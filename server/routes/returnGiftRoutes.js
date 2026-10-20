const express = require('express');
const router = express.Router();
const ReturnGiftCampaign = require('../models/ReturnGiftCampaign');
const ReturnGiftClaim = require('../models/ReturnGiftClaim');
const Order = require('../models/Order');
const User = require('../models/User');
const { authUser, authAdmin } = require('../middleware/auth');
const sendEmail = require('../utils/mailer');
const { upload } = require('../config/cloudinary');

/**
 * Helper: Calculate user's total purchases and progress for a campaign.
 * Automatically creates/updates claim record if user has reached the target threshold.
 */
async function getCampaignProgressForUser(campaign, userId) {
  const start = new Date(campaign.startDate);
  const end = new Date(campaign.endDate);

  const orders = await Order.find({
    user: userId,
    createdAt: { $gte: start, $lte: end },
    status: { $nin: ['Cancelled', 'Returned'] }
  }).sort({ createdAt: -1 });

  const totalPurchased = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
  const targetAmount = campaign.targetAmount;
  const isQualified = totalPurchased >= targetAmount;
  const remainingAmount = Math.max(0, targetAmount - totalPurchased);
  const progressPercentage = Math.min(100, Math.round((totalPurchased / targetAmount) * 100));

  let claim = await ReturnGiftClaim.findOne({ campaign: campaign._id, user: userId });

  if (isQualified && !claim) {
    const user = await User.findById(userId).select('name email phone address');
    let resolvedAddress = user?.address || '';
    if (!resolvedAddress && orders.length > 0) {
      resolvedAddress = orders[0].shippingAddress || '';
    }

    claim = new ReturnGiftClaim({
      campaign: campaign._id,
      user: userId,
      totalPurchased,
      targetAmount,
      qualifiedAt: new Date(),
      status: 'Pending Dispatch',
      shippingAddress: {
        name: user?.name || 'Valued Customer',
        phone: user?.phone || '',
        email: user?.email || '',
        address: resolvedAddress
      }
    });
    await claim.save();
  } else if (claim && claim.totalPurchased !== totalPurchased) {
    claim.totalPurchased = totalPurchased;
    await claim.save();
  }

  return {
    campaign,
    totalPurchased,
    targetAmount,
    remainingAmount,
    progressPercentage,
    isQualified,
    claim,
    qualifyingOrders: orders.map(o => ({
      _id: o._id,
      totalAmount: o.totalAmount,
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      itemCount: o.items?.length || 0
    }))
  };
}

// -------------------------------------------------------------
// PUBLIC / CUSTOMER ROUTES
// -------------------------------------------------------------

/**
 * GET /api/return-gifts/active
 * Get active return gift campaigns for banners, homepage, and shop previews
 */
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    // Return active campaigns
    const campaigns = await ReturnGiftCampaign.find({
      isActive: true,
      endDate: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } // allow up to 1 day after end for display
    }).sort({ createdAt: -1 });

    res.json(campaigns);
  } catch (err) {
    console.error('Error fetching active return gift campaigns:', err);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

/**
 * GET /api/return-gifts/my-progress
 * Authenticated customer: get all active return gift campaigns with personalized live progress
 */
router.get('/my-progress', authUser, async (req, res) => {
  try {
    const now = new Date();
    // Active campaigns or campaigns where customer already has a claim
    const activeCampaigns = await ReturnGiftCampaign.find({
      $or: [
        { isActive: true, endDate: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }
      ]
    }).sort({ createdAt: -1 });

    const results = [];
    for (const campaign of activeCampaigns) {
      const progress = await getCampaignProgressForUser(campaign, req.user.id);
      results.push(progress);
    }

    res.json(results);
  } catch (err) {
    console.error('Error fetching user return gift progress:', err);
    res.status(500).json({ error: 'Failed to fetch return gift progress' });
  }
});

/**
 * GET /api/return-gifts/my-claims
 * Authenticated customer: list all claims won by the user
 */
router.get('/my-claims', authUser, async (req, res) => {
  try {
    const claims = await ReturnGiftClaim.find({ user: req.user.id })
      .populate('campaign')
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (err) {
    console.error('Error fetching claims:', err);
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

/**
 * PUT /api/return-gifts/my-claims/:claimId/address
 * Customer can update their shipping address while gift is in 'Pending Dispatch'
 */
router.put('/my-claims/:claimId/address', authUser, async (req, res) => {
  try {
    const { address, phone, name } = req.body;
    const claim = await ReturnGiftClaim.findOne({ _id: req.params.claimId, user: req.user.id });

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    if (claim.status !== 'Pending Dispatch') {
      return res.status(400).json({ error: 'Address cannot be changed once the gift has been dispatched' });
    }

    if (address) claim.shippingAddress.address = address;
    if (phone) claim.shippingAddress.phone = phone;
    if (name) claim.shippingAddress.name = name;

    await claim.save();
    res.json({ message: 'Shipping address updated successfully', claim });
  } catch (err) {
    console.error('Error updating claim address:', err);
    res.status(500).json({ error: 'Failed to update shipping address' });
  }
});

// -------------------------------------------------------------
// ADMIN ROUTES (Protected with authAdmin)
// -------------------------------------------------------------

/**
 * GET /api/return-gifts/admin/alerts
 * Real-time count of gifts requiring dispatch and recent qualified customer alerts.
 * Automatically synchronizes any newly qualified customers across active campaigns.
 */
router.get('/admin/alerts', authAdmin, async (req, res) => {
  try {
    const now = new Date();
    // Auto-sync qualification for active campaigns
    const activeCampaigns = await ReturnGiftCampaign.find({
      isActive: true,
      startDate: { $lte: now }
    });

    for (const camp of activeCampaigns) {
      const start = new Date(camp.startDate);
      const end = new Date(camp.endDate);
      const orders = await Order.find({
        createdAt: { $gte: start, $lte: end },
        status: { $nin: ['Cancelled', 'Returned'] }
      }).populate('user', 'name email phone address');

      const userTotals = new Map();
      orders.forEach(ord => {
        if (!ord.user) return;
        const uId = ord.user._id.toString();
        if (!userTotals.has(uId)) {
          userTotals.set(uId, { user: ord.user, total: 0, orders: [] });
        }
        const entry = userTotals.get(uId);
        entry.total += (ord.totalAmount || 0);
        entry.orders.push(ord);
      });

      for (const [uId, entry] of userTotals.entries()) {
        if (entry.total >= camp.targetAmount) {
          let claim = await ReturnGiftClaim.findOne({ campaign: camp._id, user: uId });
          if (!claim) {
            const u = entry.user;
            const fallbackAddress = u.address || (entry.orders.length > 0 ? entry.orders[0].shippingAddress : '') || '';
            claim = new ReturnGiftClaim({
              campaign: camp._id,
              user: u._id,
              totalPurchased: entry.total,
              targetAmount: camp.targetAmount,
              qualifiedAt: new Date(),
              status: 'Pending Dispatch',
              shippingAddress: {
                name: u.name || 'Valued Customer',
                phone: u.phone || '',
                email: u.email || '',
                address: fallbackAddress
              }
            });
            await claim.save();
          } else if (claim.totalPurchased !== entry.total) {
            claim.totalPurchased = entry.total;
            await claim.save();
          }
        }
      }
    }

    const pendingDispatchCount = await ReturnGiftClaim.countDocuments({ status: 'Pending Dispatch' });
    const totalQualified = await ReturnGiftClaim.countDocuments();
    const dispatchedCount = await ReturnGiftClaim.countDocuments({ status: 'Dispatched' });
    const deliveredCount = await ReturnGiftClaim.countDocuments({ status: 'Delivered' });

    const recentAlerts = await ReturnGiftClaim.find()
      .populate('user', 'name email phone')
      .populate('campaign', 'title giftTitle giftImage giftValue targetAmount')
      .sort({ qualifiedAt: -1, createdAt: -1 })
      .limit(6);

    res.json({
      pendingDispatchCount,
      totalQualified,
      dispatchedCount,
      deliveredCount,
      recentAlerts
    });
  } catch (err) {
    console.error('Error fetching return gifts alerts:', err);
    res.status(500).json({ error: 'Failed to fetch gift alerts' });
  }
});

/**
 * GET /api/return-gifts/admin/campaigns
 * List all campaigns with real-time participation & claim analytics
 */
router.get('/admin/campaigns', authAdmin, async (req, res) => {
  try {
    const campaigns = await ReturnGiftCampaign.find().sort({ createdAt: -1 });

    const campaignsWithStats = await Promise.all(campaigns.map(async (camp) => {
      const start = new Date(camp.startDate);
      const end = new Date(camp.endDate);

      // Total orders in window
      const orders = await Order.find({
        createdAt: { $gte: start, $lte: end },
        status: { $nin: ['Cancelled', 'Returned'] }
      }).select('user totalAmount');

      const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const uniqueParticipants = new Set(orders.map(o => o.user?.toString()).filter(Boolean)).size;

      // Claims stats
      const claims = await ReturnGiftClaim.find({ campaign: camp._id });
      const totalQualified = claims.length;
      const totalDispatched = claims.filter(c => c.status === 'Dispatched' || c.status === 'Delivered').length;
      const totalDelivered = claims.filter(c => c.status === 'Delivered').length;
      const totalPending = claims.filter(c => c.status === 'Pending Dispatch').length;

      return {
        ...camp.toObject(),
        stats: {
          totalSales,
          uniqueParticipants,
          totalQualified,
          totalPending,
          totalDispatched,
          totalDelivered
        }
      };
    }));

    res.json(campaignsWithStats);
  } catch (err) {
    console.error('Error fetching admin campaigns:', err);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

/**
 * POST /api/return-gifts/admin/campaigns
 * Admin creates a new return gift campaign with optional Cloudinary image upload
 */
router.post('/admin/campaigns', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      targetAmount,
      startDate,
      endDate,
      giftTitle,
      giftDescription,
      giftValue,
      giftProduct,
      terms,
      isActive
    } = req.body;

    let giftImage = req.body.giftImage;
    if (req.file) {
      giftImage = req.file.path; // Cloudinary URL
    }

    if (!title || !targetAmount || !startDate || !endDate || !giftTitle) {
      return res.status(400).json({ error: 'Please provide all required campaign fields' });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const campaign = new ReturnGiftCampaign({
      title,
      subtitle: subtitle || 'Exclusive Milestone Reward',
      description,
      targetAmount: Number(targetAmount),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      giftTitle,
      giftDescription,
      giftImage: giftImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      giftValue: Number(giftValue) || 0,
      giftProduct: giftProduct || null,
      terms: Array.isArray(terms) ? terms : (terms ? terms.split('\n').filter(t => t.trim()) : []),
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true
    });

    await campaign.save();
    res.status(201).json(campaign);
  } catch (err) {
    console.error('Error creating campaign:', err);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

/**
 * PUT /api/return-gifts/admin/campaigns/:id
 * Admin updates a campaign with optional Cloudinary image upload
 */
router.put('/admin/campaigns/:id', authAdmin, upload.single('image'), async (req, res) => {
  try {
    const campaign = await ReturnGiftCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (req.file) {
      campaign.giftImage = req.file.path; // Cloudinary URL
    }

    const fields = [
      'title', 'subtitle', 'description', 'targetAmount', 'startDate', 'endDate',
      'giftTitle', 'giftDescription', 'giftImage', 'giftValue', 'giftProduct', 'terms', 'isActive'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          campaign[field] = new Date(req.body[field]);
        } else if (field === 'targetAmount' || field === 'giftValue') {
          campaign[field] = Number(req.body[field]);
        } else if (field === 'terms' && typeof req.body.terms === 'string') {
          campaign.terms = req.body.terms.split('\n').filter(t => t.trim());
        } else if (field === 'isActive') {
          campaign.isActive = req.body.isActive === 'true' || req.body.isActive === true;
        } else if (field === 'giftImage' && !req.file) {
          campaign.giftImage = req.body.giftImage;
        } else if (field !== 'giftImage') {
          campaign[field] = req.body[field];
        }
      }
    });

    await campaign.save();
    res.json(campaign);
  } catch (err) {
    console.error('Error updating campaign:', err);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

/**
 * DELETE /api/return-gifts/admin/campaigns/:id
 * Admin deletes a campaign
 */
router.delete('/admin/campaigns/:id', authAdmin, async (req, res) => {
  try {
    const campaign = await ReturnGiftCampaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    // Also remove associated claims
    await ReturnGiftClaim.deleteMany({ campaign: req.params.id });
    res.json({ message: 'Campaign and associated claims deleted' });
  } catch (err) {
    console.error('Error deleting campaign:', err);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

/**
 * GET /api/return-gifts/admin/campaigns/:id/participants
 * Live customer progress & claims table for a campaign.
 * Automatically synchronizes any newly qualified customers into ReturnGiftClaim.
 */
router.get('/admin/campaigns/:id/participants', authAdmin, async (req, res) => {
  try {
    const campaign = await ReturnGiftCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const start = new Date(campaign.startDate);
    const end = new Date(campaign.endDate);

    // Fetch all non-cancelled orders in campaign window
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $nin: ['Cancelled', 'Returned'] }
    }).populate('user', 'name email phone address');

    // Group by user
    const userOrdersMap = new Map();
    orders.forEach(ord => {
      if (!ord.user) return;
      const userId = ord.user._id.toString();
      if (!userOrdersMap.has(userId)) {
        userOrdersMap.set(userId, {
          user: ord.user,
          totalPurchased: 0,
          orders: []
        });
      }
      const entry = userOrdersMap.get(userId);
      entry.totalPurchased += (ord.totalAmount || 0);
      entry.orders.push({
        _id: ord._id,
        totalAmount: ord.totalAmount,
        status: ord.status,
        createdAt: ord.createdAt
      });
    });

    // Also get all existing claims for this campaign
    const existingClaims = await ReturnGiftClaim.find({ campaign: campaign._id })
      .populate('user', 'name email phone address');

    const claimsMap = new Map();
    existingClaims.forEach(claim => {
      if (claim.user) {
        claimsMap.set(claim.user._id.toString(), claim);
      }
    });

    // Make sure all users with existing claims are in the list (even if they placed orders outside window)
    existingClaims.forEach(claim => {
      if (!claim.user) return;
      const uId = claim.user._id.toString();
      if (!userOrdersMap.has(uId)) {
        userOrdersMap.set(uId, {
          user: claim.user,
          totalPurchased: claim.totalPurchased || campaign.targetAmount,
          orders: []
        });
      }
    });

    const participants = [];

    for (const [userId, data] of userOrdersMap.entries()) {
      const isQualified = data.totalPurchased >= campaign.targetAmount;
      let claim = claimsMap.get(userId);

      // If user reached target and no claim created yet, auto-create claim
      if (isQualified && !claim) {
        const u = data.user;
        const fallbackAddress = u.address || (data.orders.length > 0 ? (await Order.findById(data.orders[0]._id).select('shippingAddress'))?.shippingAddress : '') || '';

        claim = new ReturnGiftClaim({
          campaign: campaign._id,
          user: u._id,
          totalPurchased: data.totalPurchased,
          targetAmount: campaign.targetAmount,
          qualifiedAt: new Date(),
          status: 'Pending Dispatch',
          shippingAddress: {
            name: u.name || 'Valued Customer',
            phone: u.phone || '',
            email: u.email || '',
            address: fallbackAddress
          }
        });
        await claim.save();
        claimsMap.set(userId, claim);
      } else if (claim && claim.totalPurchased !== data.totalPurchased) {
        claim.totalPurchased = data.totalPurchased;
        await claim.save();
      }

      participants.push({
        user: {
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          address: data.user.address
        },
        totalPurchased: data.totalPurchased,
        targetAmount: campaign.targetAmount,
        progressPercentage: Math.min(100, Math.round((data.totalPurchased / campaign.targetAmount) * 100)),
        isQualified,
        orderCount: data.orders.length,
        orders: data.orders,
        claim: claim || null
      });
    }

    // Sort: Qualified pending dispatch first, then by totalPurchased descending
    participants.sort((a, b) => {
      if (a.claim?.status === 'Pending Dispatch' && b.claim?.status !== 'Pending Dispatch') return -1;
      if (b.claim?.status === 'Pending Dispatch' && a.claim?.status !== 'Pending Dispatch') return 1;
      return b.totalPurchased - a.totalPurchased;
    });

    res.json({
      campaign,
      participants
    });
  } catch (err) {
    console.error('Error fetching campaign participants:', err);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

/**
 * POST /api/return-gifts/admin/claims/:claimId/dispatch
 * Admin dispatches the gift to the qualified customer
 */
router.post('/admin/claims/:claimId/dispatch', authAdmin, async (req, res) => {
  try {
    const { courierName, trackingNumber, trackingUrl, dispatchedAt, adminNotes, notifyCustomer } = req.body;

    const claim = await ReturnGiftClaim.findById(req.params.claimId)
      .populate('campaign')
      .populate('user', 'name email phone');

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    claim.status = 'Dispatched';
    claim.dispatchDetails = {
      courierName: courierName || 'Standard Express',
      trackingNumber: trackingNumber || '',
      trackingUrl: trackingUrl || '',
      dispatchedAt: dispatchedAt ? new Date(dispatchedAt) : new Date(),
      adminNotes: adminNotes || ''
    };

    await claim.save();

    // Send email notification to customer if requested
    if (notifyCustomer !== false && claim.user?.email) {
      try {
        const giftName = claim.campaign?.giftTitle || 'Special Return Gift';
        await sendEmail({
          email: claim.user.email,
          subject: `🎁 Your Return Gift Has Been Dispatched! - LG Enterprises`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 8px;">
              <h2 style="color: #2563eb; margin-top: 0;">Congratulations, ${claim.user.name}! 🎉</h2>
              <p>We are delighted to inform you that your milestone return gift for reaching <strong>₹${claim.targetAmount.toLocaleString('en-IN')}</strong> in purchases has been dispatched!</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e293b;">Dispatched Gift: ${giftName}</h3>
                <p style="margin: 5px 0;"><strong>Courier Partner:</strong> ${courierName || 'Standard Express'}</p>
                <p style="margin: 5px 0;"><strong>Tracking Number / AWB:</strong> ${trackingNumber || 'Available on request'}</p>
                ${trackingUrl ? `<p style="margin: 10px 0;"><a href="${trackingUrl}" style="background-color: #2563eb; color: #fff; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block;">Track Your Package</a></p>` : ''}
                ${adminNotes ? `<p style="margin: 5px 0; color: #64748b;"><em>Note: ${adminNotes}</em></p>` : ''}
              </div>

              <p>Delivery Address:</p>
              <p style="color: #475569; background: #fff; padding: 10px; border-left: 3px solid #2563eb;">
                ${claim.shippingAddress?.name || claim.user.name}<br/>
                ${claim.shippingAddress?.phone || claim.user.phone || ''}<br/>
                ${claim.shippingAddress?.address || 'Your verified store address'}
              </p>

              <p style="color: #64748b; font-size: 0.9rem; margin-top: 25px;">Thank you for shopping with LG Enterprises. We value your partnership!</p>
            </div>
          `
        });
      } catch (mailErr) {
        console.error('Failed to send gift dispatch email:', mailErr);
      }
    }

    res.json({ message: 'Gift successfully marked as Dispatched', claim });
  } catch (err) {
    console.error('Error dispatching gift:', err);
    res.status(500).json({ error: 'Failed to dispatch gift' });
  }
});

/**
 * POST /api/return-gifts/admin/claims/:claimId/deliver
 * Admin marks the gift as Delivered
 */
router.post('/admin/claims/:claimId/deliver', authAdmin, async (req, res) => {
  try {
    const claim = await ReturnGiftClaim.findById(req.params.claimId);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    claim.status = 'Delivered';
    if (!claim.dispatchDetails) claim.dispatchDetails = {};
    claim.dispatchDetails.deliveredAt = new Date();

    await claim.save();
    res.json({ message: 'Gift marked as Delivered', claim });
  } catch (err) {
    console.error('Error marking gift as delivered:', err);
    res.status(500).json({ error: 'Failed to mark gift as delivered' });
  }
});

/**
 * PUT /api/return-gifts/admin/claims/:claimId
 * Admin update any claim fields (status, courier details, notes, address)
 */
router.put('/admin/claims/:claimId', authAdmin, async (req, res) => {
  try {
    const { status, courierName, trackingNumber, trackingUrl, adminNotes, shippingAddress } = req.body;
    const claim = await ReturnGiftClaim.findById(req.params.claimId);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    if (status) claim.status = status;
    if (courierName !== undefined) claim.dispatchDetails.courierName = courierName;
    if (trackingNumber !== undefined) claim.dispatchDetails.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) claim.dispatchDetails.trackingUrl = trackingUrl;
    if (adminNotes !== undefined) claim.dispatchDetails.adminNotes = adminNotes;
    if (shippingAddress) claim.shippingAddress = shippingAddress;

    await claim.save();
    res.json({ message: 'Claim updated successfully', claim });
  } catch (err) {
    console.error('Error updating claim:', err);
    res.status(500).json({ error: 'Failed to update claim' });
  }
});

module.exports = router;
