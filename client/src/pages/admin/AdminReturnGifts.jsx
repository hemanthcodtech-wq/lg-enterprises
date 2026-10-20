import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  FiGift, FiPlus, FiTrash2, FiEdit2, FiSearch, FiRefreshCw,
  FiCheckCircle, FiTruck, FiClock, FiCalendar, FiDollarSign,
  FiUser, FiMapPin, FiExternalLink, FiX, FiCheck, FiSend,
  FiPackage, FiAlertCircle, FiChevronRight, FiChevronLeft,
  FiTrendingUp, FiShoppingBag, FiInfo, FiTag, FiUploadCloud,
  FiImage, FiLink
} from 'react-icons/fi';

const DEFAULT_GIFT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80';

const AdminReturnGifts = () => {
  const { token } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'claims' ? 'claims' : 'campaigns'); // 'campaigns' | 'claims'
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Sync tab and search from URL params if updated
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'claims') {
      setActiveTab('claims');
    } else if (tab === 'campaigns') {
      setActiveTab('campaigns');
    }
    const search = searchParams.get('search');
    if (search) {
      setClaimSearch(search);
    }
  }, [searchParams]);

  // Selected campaign for participants/claims view
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [participantsData, setParticipantsData] = useState(null);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Filters for Campaigns
  const [campaignSearch, setCampaignSearch] = useState('');
  const [campaignStatusFilter, setCampaignStatusFilter] = useState('All'); // 'All', 'Active', 'Inactive'
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignsPerPage, setCampaignsPerPage] = useState(10);

  // Filters for Claims
  const [claimSearch, setClaimSearch] = useState('');
  const [claimStatusFilter, setClaimStatusFilter] = useState('All'); // 'All', 'Pending Dispatch', 'Dispatched', 'Delivered', 'In Progress'
  const [claimPage, setClaimPage] = useState(1);
  const [claimsPerPage, setClaimsPerPage] = useState(10);

  // Store products for gift selection
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeProductSearch, setStoreProductSearch] = useState('');
  const [selectedStoreProduct, setSelectedStoreProduct] = useState(null);
  const [loadingStoreProducts, setLoadingStoreProducts] = useState(false);

  // Slide-over Drawer: Create / Edit Campaign
  const fileInputRef = useRef(null);
  const [giftImageFile, setGiftImageFile] = useState(null);
  const [giftImagePreview, setGiftImagePreview] = useState('');
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [submittingCampaign, setSubmittingCampaign] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    subtitle: 'Exclusive Milestone Gift Offer',
    description: '',
    targetAmount: '',
    startDate: '',
    endDate: '',
    giftTitle: '',
    giftDescription: '',
    giftImage: '',
    giftValue: '',
    giftProduct: null,
    terms: '',
    isActive: true
  });

  // Slide-over Drawer: Dispatch Gift
  const [showDispatchDrawer, setShowDispatchDrawer] = useState(false);
  const [selectedClaimForDispatch, setSelectedClaimForDispatch] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({
    dispatchedAt: new Date().toISOString().split('T')[0],
    adminNotes: '',
    notifyCustomer: true
  });
  const [dispatchSubmitting, setDispatchSubmitting] = useState(false);

  // Modal: View Orders
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedParticipantOrders, setSelectedParticipantOrders] = useState(null);

  // Fetch campaigns
  const fetchCampaigns = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/return-gifts/admin/campaigns`, {
        headers: { 'x-auth-token': token }
      });
      setCampaigns(res.data);
      if (res.data.length > 0 && !selectedCampaignId) {
        setSelectedCampaignId(res.data[0]._id);
      }
      if (showToast) toast.success('Gift offer campaigns refreshed');
    } catch (err) {
      console.error('Failed to fetch gift offer campaigns:', err);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStoreProducts = async () => {
    try {
      setLoadingStoreProducts(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
      setStoreProducts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch store products:', err);
    } finally {
      setLoadingStoreProducts(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCampaigns();
      fetchStoreProducts();
    }
  }, [token]);

  const filteredStoreProducts = useMemo(() => {
    if (!storeProductSearch.trim()) return storeProducts;
    const q = storeProductSearch.toLowerCase().trim();
    return storeProducts.filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.description?.toLowerCase().includes(q)
    );
  }, [storeProducts, storeProductSearch]);

  // Fetch participants when selectedCampaignId changes or tab is claims
  const fetchParticipants = async (campaignId) => {
    if (!campaignId) return;
    try {
      setLoadingParticipants(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/return-gifts/admin/campaigns/${campaignId}/participants`, {
        headers: { 'x-auth-token': token }
      });
      setParticipantsData(res.data);
    } catch (err) {
      console.error('Failed to fetch participants:', err);
      toast.error('Failed to load customer participants');
    } finally {
      setLoadingParticipants(false);
    }
  };

  useEffect(() => {
    if (token && selectedCampaignId && activeTab === 'claims') {
      fetchParticipants(selectedCampaignId);
    }
  }, [selectedCampaignId, activeTab, token]);

  // Open Create Drawer
  const handleOpenCreateDrawer = () => {
    setEditingCampaignId(null);
    setGiftImageFile(null);
    if (giftImagePreview && giftImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(giftImagePreview);
    }
    setShowUrlField(false);
    setStoreProductSearch('');
    const now = new Date();
    const startStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endStr = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    let defaultTitle = '';
    let defaultDesc = 'Spend above the milestone threshold to receive this complimentary gift offer dispatched directly to your home!';
    let defaultImg = DEFAULT_GIFT_FALLBACK_IMAGE;
    let defaultVal = 0;
    let defaultProdId = null;

    if (storeProducts && storeProducts.length > 0) {
      const firstProd = storeProducts[0];
      setSelectedStoreProduct(firstProd);
      defaultTitle = firstProd.name;
      defaultDesc = firstProd.description ? (firstProd.description.length > 180 ? firstProd.description.substring(0, 180) + '...' : firstProd.description) : `Official ${firstProd.name}`;
      defaultImg = firstProd.images?.[0] || DEFAULT_GIFT_FALLBACK_IMAGE;
      defaultVal = firstProd.originalPrice || firstProd.price || 0;
      defaultProdId = firstProd._id;
    } else {
      setSelectedStoreProduct(null);
    }

    setGiftImagePreview(defaultImg);

    setCampaignForm({
      title: '',
      subtitle: 'Exclusive Milestone Gift Offer',
      description: 'Spend above the milestone threshold to receive this complimentary gift offer dispatched directly to your home!',
      targetAmount: 25000,
      startDate: startStr,
      endDate: endStr,
      giftTitle: defaultTitle,
      giftDescription: defaultDesc,
      giftImage: defaultImg,
      giftValue: defaultVal,
      giftProduct: defaultProdId,
      terms: 'Valid on cumulative purchases made within the campaign period.\nCancelled and returned orders are excluded.\nGift offer will be dispatched within 5 days of milestone completion.',
      isActive: true
    });
    setShowDrawer(true);
  };

  // Open Edit Drawer
  const handleOpenEditDrawer = (camp) => {
    setEditingCampaignId(camp._id);
    setGiftImageFile(null);
    if (giftImagePreview && giftImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(giftImagePreview);
    }
    setGiftImagePreview(camp.giftImage || DEFAULT_GIFT_FALLBACK_IMAGE);
    setShowUrlField(false);
    setStoreProductSearch('');

    // Check if linked or matching store product
    const matchedProduct = storeProducts.find(p => (camp.giftProduct && p._id === camp.giftProduct) || p.name === camp.giftTitle);
    setSelectedStoreProduct(matchedProduct || null);

    setCampaignForm({
      title: camp.title,
      subtitle: camp.subtitle || '',
      description: camp.description || '',
      targetAmount: camp.targetAmount,
      startDate: new Date(camp.startDate).toISOString().split('T')[0],
      endDate: new Date(camp.endDate).toISOString().split('T')[0],
      giftTitle: camp.giftTitle,
      giftDescription: camp.giftDescription || '',
      giftImage: camp.giftImage || '',
      giftValue: camp.giftValue || 0,
      giftProduct: camp.giftProduct || (matchedProduct?._id || null),
      terms: Array.isArray(camp.terms) ? camp.terms.join('\n') : (camp.terms || ''),
      isActive: camp.isActive !== undefined ? camp.isActive : true
    });
    setShowDrawer(true);
  };

  // Close Drawer
  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setEditingCampaignId(null);
    setGiftImageFile(null);
    if (giftImagePreview && giftImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(giftImagePreview);
    }
    setGiftImagePreview('');
    setShowUrlField(false);
    setSelectedStoreProduct(null);
    setStoreProductSearch('');
  };

  // Cloudinary image file handlers
  const handleImageFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('File size exceeds 8MB limit');
      return;
    }
    if (giftImagePreview && giftImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(giftImagePreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setGiftImageFile(file);
    setGiftImagePreview(previewUrl);
    toast.success(`Selected "${file.name}" for Cloudinary upload`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImageFile = () => {
    if (giftImagePreview && giftImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(giftImagePreview);
    }
    setGiftImageFile(null);
    setGiftImagePreview(campaignForm.giftImage || DEFAULT_GIFT_FALLBACK_IMAGE);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectStoreProduct = (prod) => {
    if (giftImagePreview && giftImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(giftImagePreview);
    }
    setGiftImageFile(null);
    const prodImg = (prod.images && prod.images.length > 0) ? prod.images[0] : '';
    setGiftImagePreview(prodImg);
    setSelectedStoreProduct(prod);

    setCampaignForm(prev => ({
      ...prev,
      giftTitle: prod.name,
      giftImage: prodImg,
      giftValue: prod.originalPrice || prod.price || 0,
      giftDescription: prod.description ? (prod.description.length > 180 ? prod.description.substring(0, 180) + '...' : prod.description) : `Official ${prod.name}`,
      giftProduct: prod._id
    }));

    toast.success(`Selected "${prod.name}" (₹${prod.price?.toLocaleString('en-IN')}) as Gift Offer`);
  };

  // Submit Campaign Form (Create / Edit) with Cloudinary upload
  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    try {
      setSubmittingCampaign(true);

      const formData = new FormData();
      formData.append('title', campaignForm.title);
      formData.append('subtitle', campaignForm.subtitle || '');
      formData.append('description', campaignForm.description || '');
      formData.append('targetAmount', Number(campaignForm.targetAmount));
      formData.append('startDate', campaignForm.startDate);
      formData.append('endDate', campaignForm.endDate);
      formData.append('giftTitle', campaignForm.giftTitle);
      formData.append('giftDescription', campaignForm.giftDescription || '');
      formData.append('giftValue', Number(campaignForm.giftValue) || 0);
      formData.append('terms', campaignForm.terms || '');
      formData.append('isActive', campaignForm.isActive);

      if (campaignForm.giftProduct) {
        formData.append('giftProduct', campaignForm.giftProduct);
      }

      if (giftImageFile) {
        formData.append('image', giftImageFile);
      } else if (campaignForm.giftImage) {
        formData.append('giftImage', campaignForm.giftImage);
      }

      const config = {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editingCampaignId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/return-gifts/admin/campaigns/${editingCampaignId}`,
          formData,
          config
        );
        toast.success('Campaign updated with Cloudinary image!');
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/return-gifts/admin/campaigns`,
          formData,
          config
        );
        toast.success('Campaign created with Cloudinary image!');
      }
      handleCloseDrawer();
      fetchCampaigns();
    } catch (err) {
      console.error('Failed to save campaign:', err);
      toast.error(err.response?.data?.error || 'Failed to save campaign');
    } finally {
      setSubmittingCampaign(false);
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete campaign "${title}"? This will also remove associated claims.`)) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/return-gifts/admin/campaigns/${id}`, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Campaign deleted');
      fetchCampaigns();
    } catch (err) {
      toast.error('Failed to delete campaign');
    }
  };

  // Toggle Active status
  const handleToggleActive = async (camp) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/return-gifts/admin/campaigns/${camp._id}`,
        { isActive: !camp.isActive },
        { headers: { 'x-auth-token': token } }
      );
      toast.success(`Campaign marked as ${!camp.isActive ? 'Active' : 'Inactive'}`);
      fetchCampaigns();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Open Dispatch Drawer
  const handleOpenDispatchDrawer = (claim, participant) => {
    setSelectedClaimForDispatch({ ...claim, participantUser: participant.user });
    setDispatchForm({
      dispatchedAt: new Date().toISOString().split('T')[0],
      adminNotes: claim?.dispatchDetails?.adminNotes || 'Gift offer dispatched to customer address. Free delivery.',
      notifyCustomer: true
    });
    setShowDispatchDrawer(true);
  };

  // Confirm Dispatch
  const handleConfirmDispatch = async (e) => {
    e.preventDefault();
    if (!selectedClaimForDispatch?._id) return;
    try {
      setDispatchSubmitting(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL}/return-gifts/admin/claims/${selectedClaimForDispatch._id}/dispatch`,
        {
          courierName: 'Direct Dispatch',
          trackingNumber: '',
          trackingUrl: '',
          dispatchedAt: dispatchForm.dispatchedAt,
          adminNotes: dispatchForm.adminNotes,
          notifyCustomer: dispatchForm.notifyCustomer
        },
        { headers: { 'x-auth-token': token } }
      );
      toast.success('Gift offer marked as Dispatched! Customer notified.');
      setShowDispatchDrawer(false);
      fetchParticipants(selectedCampaignId);
      fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to dispatch gift');
    } finally {
      setDispatchSubmitting(false);
    }
  };

  // Mark Delivered
  const handleMarkDelivered = async (claimId) => {
    if (!window.confirm('Mark this gift as successfully delivered to the customer?')) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/return-gifts/admin/claims/${claimId}/deliver`,
        {},
        { headers: { 'x-auth-token': token } }
      );
      toast.success('Gift marked as Delivered!');
      fetchParticipants(selectedCampaignId);
      fetchCampaigns();
    } catch (err) {
      toast.error('Failed to mark delivered');
    }
  };

  // View Contributing Orders
  const handleViewOrders = (participant) => {
    setSelectedParticipantOrders(participant);
    setShowOrdersModal(true);
  };

  // Aggregate Stats
  const aggregateStats = useMemo(() => {
    let totalSales = 0;
    let totalQualified = 0;
    let totalPending = 0;
    let totalDispatched = 0;
    let totalDelivered = 0;

    campaigns.forEach(c => {
      if (c.stats) {
        totalSales += c.stats.totalSales || 0;
        totalQualified += c.stats.totalQualified || 0;
        totalPending += c.stats.totalPending || 0;
        totalDispatched += c.stats.totalDispatched || 0;
        totalDelivered += c.stats.totalDelivered || 0;
      }
    });

    return { totalSales, totalQualified, totalPending, totalDispatched, totalDelivered };
  }, [campaigns]);

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const term = campaignSearch.toLowerCase();
      const matchesSearch = c.title.toLowerCase().includes(term) || c.giftTitle.toLowerCase().includes(term);
      const matchesStatus = 
        campaignStatusFilter === 'All' ? true :
        campaignStatusFilter === 'Active' ? c.isActive : !c.isActive;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, campaignSearch, campaignStatusFilter]);

  const totalCampaignPages = Math.ceil(filteredCampaigns.length / campaignsPerPage) || 1;
  const currentCampaigns = useMemo(() => {
    const start = (campaignPage - 1) * campaignsPerPage;
    return filteredCampaigns.slice(start, start + campaignsPerPage);
  }, [filteredCampaigns, campaignPage, campaignsPerPage]);

  // Filtered Participants in Claims tab
  const filteredParticipants = useMemo(() => {
    if (!participantsData?.participants) return [];
    return participantsData.participants.filter(p => {
      const term = claimSearch.toLowerCase();
      const matchesSearch = 
        p.user?.name?.toLowerCase().includes(term) ||
        p.user?.email?.toLowerCase().includes(term) ||
        p.user?.phone?.includes(term) ||
        p.claim?.shippingAddress?.address?.toLowerCase().includes(term);

      let matchesStatus = true;
      if (claimStatusFilter === 'Pending Dispatch') {
        matchesStatus = p.claim?.status === 'Pending Dispatch';
      } else if (claimStatusFilter === 'Dispatched') {
        matchesStatus = p.claim?.status === 'Dispatched';
      } else if (claimStatusFilter === 'Delivered') {
        matchesStatus = p.claim?.status === 'Delivered';
      } else if (claimStatusFilter === 'In Progress') {
        matchesStatus = !p.isQualified;
      }

      return matchesSearch && matchesStatus;
    });
  }, [participantsData, claimSearch, claimStatusFilter]);

  const totalClaimPages = Math.ceil(filteredParticipants.length / claimsPerPage) || 1;
  const currentParticipants = useMemo(() => {
    const start = (claimPage - 1) * claimsPerPage;
    return filteredParticipants.slice(start, start + claimsPerPage);
  }, [filteredParticipants, claimPage, claimsPerPage]);

  return (
    <div className="admin-return-gifts-official">
      <style>{`
        /* Exact match to AdminProducts typography, scale, and enterprise design system */
        .admin-return-gifts-official {
          padding-bottom: 3rem;
          color: #0f172a;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .header-section {
          margin-bottom: 1.5rem;
        }
        .page-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .page-title-group h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.15rem 0;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .page-title-group p {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }

        .header-actions-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }
        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.8rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #475569;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          font-family: inherit;
        }
        .refresh-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .refresh-btn .spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .add-product-btn-official {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.8rem;
          background: #4f46e5;
          color: #ffffff;
          border: 1px solid #4f46e5;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
          font-family: inherit;
        }
        .add-product-btn-official:hover {
          background: #4338ca;
          border-color: #4338ca;
        }

        /* Sub-navigation Tabs */
        .subnav-tabs-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f1f5f9;
          padding: 0.35rem;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          width: fit-content;
        }
        .subnav-tab-btn {
          padding: 0.45rem 0.95rem;
          border-radius: 7px;
          border: none;
          background: transparent;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .subnav-tab-btn.active {
          background: #ffffff;
          color: #4f46e5;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        /* KPI Metric Cards (Match AdminProducts) */
        .metrics-grid-official {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .metric-card-official {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .metric-card-official:hover {
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
          border-color: #cbd5e1;
        }
        .metric-icon-bubble {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .metric-icon-bubble.blue { background: #eff6ff; color: #2563eb; }
        .metric-icon-bubble.green { background: #ecfdf5; color: #059669; }
        .metric-icon-bubble.amber { background: #fffbeb; color: #d97706; }
        .metric-icon-bubble.purple { background: #faf5ff; color: #7c3aed; }

        .metric-title {
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.15rem;
        }
        .metric-value {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        /* Enterprise Table Card */
        .table-enterprise-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
          overflow: hidden;
        }

        /* Filter Toolbar */
        .table-filter-bar {
          padding: 0.85rem 1.25rem;
          background: #ffffff;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .search-field-wrapper {
          position: relative;
          min-width: 240px;
          flex: 1;
          max-width: 320px;
        }
        .search-field-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 0.85rem;
        }
        .search-field-input {
          width: 100%;
          padding: 0.45rem 2rem 0.45rem 2rem;
          font-size: 0.8rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #0f172a;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
          box-sizing: border-box;
        }
        .search-field-input:focus {
          border-color: #4f46e5;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        .search-clear-btn {
          position: absolute;
          right: 0.6rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 0.8rem;
          padding: 2px;
          display: flex;
          align-items: center;
        }
        .search-clear-btn:hover {
          color: #334155;
        }

        .filter-controls-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .filter-pill {
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          background: #ffffff;
          color: #64748b;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-family: inherit;
        }
        .filter-pill:hover {
          background: #f1f5f9;
          color: #334155;
        }
        .filter-pill.active {
          background: #4f46e5;
          color: #ffffff;
          border-color: #4f46e5;
          font-weight: 600;
        }
        .filter-pill-badge {
          font-size: 0.65rem;
          padding: 0.05rem 0.35rem;
          border-radius: 999px;
          background: #e2e8f0;
          color: #475569;
        }
        .filter-pill.active .filter-pill-badge {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .filter-select-official {
          padding: 0.4rem 0.65rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #f8fafc;
          font-size: 0.75rem;
          color: #334155;
          font-weight: 500;
          outline: none;
          cursor: pointer;
          font-family: inherit;
        }

        /* Official Table */
        .official-table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          width: 100%;
        }
        .official-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          text-align: left;
        }
        .official-table th {
          background: #f8fafc;
          padding: 0.65rem 1rem;
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }
        .official-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
          background: #ffffff;
          font-size: 0.8rem;
          transition: background-color 0.15s ease;
        }
        .official-table tr:last-child td {
          border-bottom: none;
        }
        .official-table tr:hover td {
          background: #f8fafc;
        }

        .prod-image-cell {
          width: 44px;
          height: 44px;
          border-radius: 6px;
          object-fit: cover;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: #94a3b8;
          flex-shrink: 0;
        }

        .cat-chip-tag {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #0f172a;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 0.15rem 0.45rem;
        }

        .stock-badge-pill {
          font-size: 0.68rem;
          font-weight: 600;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .stock-badge-pill.in {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .stock-badge-pill.out {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        .stock-badge-pill.pending {
          background: #fffbeb;
          color: #b45309;
          border: 1px solid #fde68a;
        }
        .stock-badge-pill.dispatched {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }
        .stock-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .btn-table-action {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          border-radius: 6px;
          padding: 0.35rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .btn-action-primary {
          background: #4f46e5;
          color: #ffffff;
          border: 1px solid #4f46e5;
        }
        .btn-action-primary:hover {
          background: #4338ca;
        }
        .btn-action-edit {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
        }
        .btn-action-edit:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        .btn-action-delete {
          background: #fff5f5;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
        .btn-action-delete:hover {
          background: #fee2e2;
          color: #b91c1c;
        }

        /* Pagination Footer */
        .table-pagination-footer {
          padding: 0.75rem 1.25rem;
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .pagination-meta-info {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .rows-select {
          padding: 0.15rem 0.4rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background: #f8fafc;
          font-size: 0.75rem;
          color: #334155;
          cursor: pointer;
          outline: none;
          font-family: inherit;
        }
        .pagination-controls-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .pagination-nav-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pagination-nav-btn:hover:not(:disabled) {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }
        .pagination-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .page-pill-btn {
          min-width: 32px;
          height: 32px;
          padding: 0 0.5rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid transparent;
          background: transparent;
          color: #475569;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .page-pill-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .page-pill-btn.active {
          background: #4f46e5;
          color: #ffffff;
          border-color: #4f46e5;
        }

        /* Slide-over Drawer (Add/Edit) - Exactly matching AdminProducts */
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }
        .drawer-panel {
          background: #ffffff;
          width: 100%;
          max-width: 620px;
          height: 100vh;
          overflow-y: auto;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
          animation: drawerSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }
        @keyframes drawerSlide {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .drawer-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .drawer-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .drawer-header p {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0.15rem 0 0 0;
        }
        .drawer-close-btn {
          background: #f1f5f9;
          border: none;
          font-size: 1.1rem;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.15s ease;
        }
        .drawer-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        .drawer-body {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .drawer-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
          position: sticky;
          bottom: 0;
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          z-index: 10;
        }
        .drawer-btn-cancel {
          padding: 0.45rem 1rem;
          background: #ffffff;
          color: #475569;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }
        .drawer-btn-submit {
          padding: 0.45rem 1.2rem;
          background: #4f46e5;
          color: #ffffff;
          border: 1px solid #4f46e5;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
        .drawer-btn-submit:hover:not(:disabled) {
          background: #4338ca;
          border-color: #4338ca;
        }
        .drawer-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .drawer-field-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .drawer-field-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #334155;
        }
        .drawer-field-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #0f172a;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .drawer-field-input:focus {
          border-color: #4f46e5;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .preset-grid-pills {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.4rem;
          max-height: 160px;
          overflow-y: auto;
          padding: 0.2rem;
        }
        .preset-pill-item {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.4rem 0.6rem;
          background: #f8fafc;
          cursor: pointer;
          font-size: 0.72rem;
          font-weight: 600;
          color: #475569;
          text-align: left;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .preset-pill-item:hover {
          border-color: #4f46e5;
          background: #eff6ff;
          color: #4f46e5;
        }
        .preset-pill-item.active {
          border-color: #4f46e5;
          background: #eef2ff;
          color: #4f46e5;
          font-weight: 700;
          box-shadow: 0 0 0 1px #4f46e5;
        }

        /* Store Inventory Product Pick Cards */
        .store-products-quick-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 0.5rem;
          max-height: 220px;
          overflow-y: auto;
          padding: 0.2rem;
        }
        .store-product-pick-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.45rem 0.6rem;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-align: left;
          position: relative;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
        }
        .store-product-pick-card:hover {
          border-color: #4f46e5;
          background: #f8faff;
          transform: translateY(-1px);
        }
        .store-product-pick-card.selected {
          border-color: #4f46e5;
          background: #eef2ff;
          box-shadow: 0 0 0 1.5px #4f46e5;
        }
        .store-product-pick-thumb {
          width: 38px;
          height: 38px;
          border-radius: 6px;
          object-fit: cover;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          flex-shrink: 0;
        }
        .store-product-pick-info {
          flex: 1;
          min-width: 0;
        }
        .store-product-pick-title {
          font-size: 0.74rem;
          font-weight: 600;
          color: #1e293b;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .store-product-pick-meta {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 2px;
        }
        .store-product-pick-price {
          font-size: 0.72rem;
          font-weight: 700;
          color: #4f46e5;
        }
        .store-product-pick-stock {
          font-size: 0.62rem;
          padding: 1px 5px;
          border-radius: 999px;
          font-weight: 600;
        }
        .store-product-pick-stock.in {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .store-product-pick-stock.out {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        .store-product-pick-check {
          position: absolute;
          right: 0.45rem;
          top: 0.45rem;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #4f46e5;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
        }

        /* Cloudinary Image Uploader (Matching AdminProducts) */
        .uploader-dropzone-box {
          border: 2px dashed #cbd5e1;
          border-radius: 10px;
          background: #f8fafc;
          padding: 1.25rem 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }
        .uploader-dropzone-box:hover {
          border-color: #4f46e5;
          background: #f1f5f9;
        }
        .uploader-dropzone-box.drag-active {
          border-color: #4f46e5;
          background: #eff6ff;
          transform: scale(1.01);
        }
        .uploader-drop-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #eef2ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.35rem;
          margin-bottom: 0.15rem;
        }
        .uploader-drop-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f172a;
        }
        .uploader-drop-hint {
          font-size: 0.72rem;
          color: #64748b;
        }
        .cloudinary-cloud-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.68rem;
          font-weight: 600;
          color: #0284c7;
          background: #e0f2fe;
          border: 1px solid #bae6fd;
          padding: 0.15rem 0.5rem;
          border-radius: 999px;
        }
        .uploaded-file-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
        }
        .uploaded-file-thumb {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #86efac;
          background: #ffffff;
          flex-shrink: 0;
        }
        .uploaded-file-details {
          flex: 1;
          min-width: 0;
        }
        .uploaded-file-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #166534;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .uploaded-file-meta {
          font-size: 0.7rem;
          color: #15803d;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.15rem;
        }
        .btn-remove-file {
          background: #ffffff;
          border: 1px solid #fecaca;
          color: #dc2626;
          border-radius: 6px;
          padding: 0.3rem 0.6rem;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .btn-remove-file:hover {
          background: #fee2e2;
        }
        .url-toggle-btn {
          background: transparent;
          border: none;
          color: #4f46e5;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          font-family: inherit;
        }
        .url-toggle-btn:hover {
          text-decoration: underline;
        }
      `}</style>

      {/* Header Section */}
      <div className="header-section">
        <div className="page-title-row">
          <div className="page-title-group">
            <h2>
              <FiGift style={{ color: '#4f46e5' }} /> Gift Offer Campaigns
            </h2>
            <p>Configure order value milestones, campaign time windows, and track gift dispatches to qualifying customers.</p>
          </div>

          <div className="header-actions-group">
            <div className="subnav-tabs-wrapper">
              <button 
                className={`subnav-tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
                onClick={() => setActiveTab('campaigns')}
              >
                <FiCalendar /> Campaigns ({campaigns.length})
              </button>
              <button 
                className={`subnav-tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
                onClick={() => setActiveTab('claims')}
              >
                <FiTruck /> Claims &amp; Dispatch
                {aggregateStats.totalPending > 0 && (
                  <span style={{ background: '#f59e0b', color: 'white', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '10px' }}>
                    {aggregateStats.totalPending}
                  </span>
                )}
              </button>
            </div>

            <button 
              className="refresh-btn" 
              onClick={() => fetchCampaigns(true)}
              title="Refresh Data"
            >
              <FiRefreshCw className={refreshing ? 'spin' : ''} />
              <span>Refresh</span>
            </button>

            <button 
              className="add-product-btn-official" 
              onClick={handleOpenCreateDrawer}
            >
              <FiPlus />
              <span>New Campaign</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards (Matches AdminProducts) */}
      <div className="metrics-grid-official">
        <div className="metric-card-official">
          <div className="metric-icon-bubble blue">
            <FiDollarSign />
          </div>
          <div>
            <div className="metric-title">Campaign Sales</div>
            <div className="metric-value">₹{aggregateStats.totalSales.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="metric-card-official">
          <div className="metric-icon-bubble purple">
            <FiGift />
          </div>
          <div>
            <div className="metric-title">Qualified Shoppers</div>
            <div className="metric-value">{aggregateStats.totalQualified}</div>
          </div>
        </div>

        <div className="metric-card-official">
          <div className="metric-icon-bubble amber">
            <FiClock />
          </div>
          <div>
            <div className="metric-title">Needs Dispatch</div>
            <div className="metric-value" style={{ color: aggregateStats.totalPending > 0 ? '#d97706' : '#0f172a' }}>
              {aggregateStats.totalPending}
            </div>
          </div>
        </div>

        <div className="metric-card-official">
          <div className="metric-icon-bubble blue">
            <FiTruck />
          </div>
          <div>
            <div className="metric-title">Dispatched</div>
            <div className="metric-value">{aggregateStats.totalDispatched}</div>
          </div>
        </div>

        <div className="metric-card-official">
          <div className="metric-icon-bubble green">
            <FiCheckCircle />
          </div>
          <div>
            <div className="metric-title">Delivered</div>
            <div className="metric-value">{aggregateStats.totalDelivered}</div>
          </div>
        </div>
      </div>

      {/* TAB 1: CAMPAIGNS LIST TABLE */}
      {activeTab === 'campaigns' && (
        <div className="table-enterprise-card">
          {/* Table Filters Toolbar */}
          <div className="table-filter-bar">
            <div className="search-field-wrapper">
              <FiSearch className="search-field-icon" />
              <input 
                type="text" 
                placeholder="Search campaigns or gift names..." 
                className="search-field-input"
                value={campaignSearch}
                onChange={(e) => { setCampaignSearch(e.target.value); setCampaignPage(1); }}
              />
              {campaignSearch && (
                <button className="search-clear-btn" onClick={() => setCampaignSearch('')}>
                  <FiX />
                </button>
              )}
            </div>

            <div className="filter-controls-group">
              <button 
                className={`filter-pill ${campaignStatusFilter === 'All' ? 'active' : ''}`}
                onClick={() => { setCampaignStatusFilter('All'); setCampaignPage(1); }}
              >
                All <span className="filter-pill-badge">{campaigns.length}</span>
              </button>
              <button 
                className={`filter-pill ${campaignStatusFilter === 'Active' ? 'active' : ''}`}
                onClick={() => { setCampaignStatusFilter('Active'); setCampaignPage(1); }}
              >
                Active <span className="filter-pill-badge">{campaigns.filter(c => c.isActive).length}</span>
              </button>
              <button 
                className={`filter-pill ${campaignStatusFilter === 'Inactive' ? 'active' : ''}`}
                onClick={() => { setCampaignStatusFilter('Inactive'); setCampaignPage(1); }}
              >
                Inactive <span className="filter-pill-badge">{campaigns.filter(c => !c.isActive).length}</span>
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="official-table-wrapper">
            <table className="official-table">
              <thead>
                <tr>
                  <th>Campaign &amp; Reward Gift</th>
                  <th>Order Threshold (₹)</th>
                  <th>Timeline Window</th>
                  <th>Shoppers &amp; Claims</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', width: '220px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && campaigns.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      <FiRefreshCw className="spin" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#4f46e5' }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>Loading campaigns...</p>
                    </td>
                  </tr>
                ) : currentCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎁</div>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>No campaigns match your criteria</p>
                      <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Create a new campaign or clear your search keyword</small>
                    </td>
                  </tr>
                ) : (
                  currentCampaigns.map((camp) => {
                    const now = new Date();
                    const start = new Date(camp.startDate);
                    const end = new Date(camp.endDate);
                    const isOngoing = now >= start && now <= end && camp.isActive;
                    const isUpcoming = now < start;
                    const isEnded = now > end;

                    return (
                      <tr key={camp._id}>
                        {/* Campaign & Gift */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img 
                              src={camp.giftImage || DEFAULT_GIFT_FALLBACK_IMAGE} 
                              alt={camp.giftTitle} 
                              className="prod-image-cell"
                              onError={e => { e.target.src = DEFAULT_GIFT_FALLBACK_IMAGE; }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem', marginBottom: '0.15rem' }}>
                                {camp.title}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#4f46e5', fontWeight: 600 }}>
                                🎁 {camp.giftTitle} {camp.giftValue > 0 && `(Worth ₹${camp.giftValue.toLocaleString('en-IN')})`}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Target Order Threshold */}
                        <td>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                            ₹{camp.targetAmount?.toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Dates */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 500 }}>
                              {new Date(camp.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {' — '}
                              {new Date(camp.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <div>
                              {isOngoing && <span className="cat-chip-tag" style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}>Live Now</span>}
                              {isUpcoming && <span className="cat-chip-tag" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>Upcoming</span>}
                              {isEnded && <span className="cat-chip-tag">Ended</span>}
                            </div>
                          </div>
                        </td>

                        {/* Stats */}
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.75rem' }}>
                            <span title="Participants" style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#334155' }}>
                              {camp.stats?.uniqueParticipants || 0} shoppers
                            </span>
                            <span title="Qualified" style={{ background: '#fffbeb', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fde68a', color: '#b45309', fontWeight: 700 }}>
                              {camp.stats?.totalQualified || 0} qualified
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`stock-badge-pill ${camp.isActive ? 'in' : 'out'}`}>
                            <span className="stock-dot"></span>
                            {camp.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button 
                              onClick={() => { setSelectedCampaignId(camp._id); setActiveTab('claims'); }}
                              className="btn-table-action btn-action-primary"
                              title="View Customer Claims & Dispatch Gift"
                            >
                              <FiTruck /> Claims ({camp.stats?.totalQualified || 0})
                            </button>
                            <button 
                              onClick={() => handleOpenEditDrawer(camp)}
                              className="btn-table-action btn-action-edit"
                              title="Edit Campaign"
                            >
                              <FiEdit2 />
                            </button>
                            <button 
                              onClick={() => handleToggleActive(camp)}
                              className="btn-table-action btn-action-edit"
                              title={camp.isActive ? 'Pause Campaign' : 'Activate Campaign'}
                            >
                              {camp.isActive ? 'Pause' : 'Activate'}
                            </button>
                            <button 
                              onClick={() => handleDeleteCampaign(camp._id, camp.title)}
                              className="btn-table-action btn-action-delete"
                              title="Delete Campaign"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="table-pagination-footer">
            <div className="pagination-meta-info">
              <span>
                Showing {filteredCampaigns.length === 0 ? 0 : (campaignPage - 1) * campaignsPerPage + 1} to {Math.min(campaignPage * campaignsPerPage, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Rows:</span>
                <select 
                  className="rows-select" 
                  value={campaignsPerPage} 
                  onChange={e => { setCampaignsPerPage(Number(e.target.value)); setCampaignPage(1); }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            <div className="pagination-controls-row">
              <button 
                className="pagination-nav-btn" 
                disabled={campaignPage === 1}
                onClick={() => setCampaignPage(prev => Math.max(prev - 1, 1))}
              >
                <FiChevronLeft />
              </button>
              {Array.from({ length: totalCampaignPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  className={`page-pill-btn ${campaignPage === page ? 'active' : ''}`}
                  onClick={() => setCampaignPage(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="pagination-nav-btn" 
                disabled={campaignPage === totalCampaignPages}
                onClick={() => setCampaignPage(prev => Math.min(prev + 1, totalCampaignPages))}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER CLAIMS & DISPATCH TABLE */}
      {activeTab === 'claims' && (
        <div className="table-enterprise-card">
          {/* Table Filters Toolbar */}
          <div className="table-filter-bar">
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
              <div className="search-field-wrapper">
                <FiSearch className="search-field-icon" />
                <input 
                  type="text" 
                  placeholder="Search customer name, email, phone..." 
                  className="search-field-input"
                  value={claimSearch}
                  onChange={(e) => { setClaimSearch(e.target.value); setClaimPage(1); }}
                />
                {claimSearch && (
                  <button className="search-clear-btn" onClick={() => setClaimSearch('')}>
                    <FiX />
                  </button>
                )}
              </div>

              <select 
                className="filter-select-official" 
                value={selectedCampaignId || ''}
                onChange={e => setSelectedCampaignId(e.target.value)}
              >
                {campaigns.map(c => (
                  <option key={c._id} value={c._id}>
                    Campaign: {c.title} (Target: ₹{c.targetAmount?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-controls-group">
              <button 
                className={`filter-pill ${claimStatusFilter === 'All' ? 'active' : ''}`}
                onClick={() => { setClaimStatusFilter('All'); setClaimPage(1); }}
              >
                All <span className="filter-pill-badge">{participantsData?.participants?.length || 0}</span>
              </button>
              <button 
                className={`filter-pill ${claimStatusFilter === 'Pending Dispatch' ? 'active' : ''}`}
                onClick={() => { setClaimStatusFilter('Pending Dispatch'); setClaimPage(1); }}
              >
                ⚡ Ready to Send <span className="filter-pill-badge">{participantsData?.participants?.filter(p => p.claim?.status === 'Pending Dispatch').length || 0}</span>
              </button>
              <button 
                className={`filter-pill ${claimStatusFilter === 'Dispatched' ? 'active' : ''}`}
                onClick={() => { setClaimStatusFilter('Dispatched'); setClaimPage(1); }}
              >
                Dispatched <span className="filter-pill-badge">{participantsData?.participants?.filter(p => p.claim?.status === 'Dispatched').length || 0}</span>
              </button>
              <button 
                className={`filter-pill ${claimStatusFilter === 'Delivered' ? 'active' : ''}`}
                onClick={() => { setClaimStatusFilter('Delivered'); setClaimPage(1); }}
              >
                Delivered <span className="filter-pill-badge">{participantsData?.participants?.filter(p => p.claim?.status === 'Delivered').length || 0}</span>
              </button>
            </div>
          </div>

          {/* Claims Table Content */}
          <div className="official-table-wrapper">
            <table className="official-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Spend in Window</th>
                  <th>Goal Progress</th>
                  <th>Shipping Address</th>
                  <th>Gift Offer Status</th>
                  <th style={{ textAlign: 'right', width: '220px' }}>Dispatch Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingParticipants ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      <FiRefreshCw className="spin" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#4f46e5' }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>Calculating customer purchases &amp; milestone claims...</p>
                    </td>
                  </tr>
                ) : currentParticipants.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>No customer records match this filter</p>
                      <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Select another campaign or clear your search</small>
                    </td>
                  </tr>
                ) : (
                  currentParticipants.map((p) => {
                    const claim = p.claim;
                    const status = claim?.status || (p.isQualified ? 'Pending Dispatch' : 'In Progress');

                    return (
                      <tr key={p.user?._id}>
                        {/* Customer */}
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem', marginBottom: '0.15rem' }}>
                            {p.user?.name || 'Customer'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.user?.email}</div>
                          {p.user?.phone && (
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>📞 {p.user?.phone}</div>
                          )}
                        </td>

                        {/* Spend vs Target */}
                        <td>
                          <span style={{ fontWeight: 700, color: p.isQualified ? '#059669' : '#0f172a', fontSize: '0.85rem' }}>
                            ₹{p.totalPurchased?.toLocaleString('en-IN')}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}> / ₹{p.targetAmount?.toLocaleString('en-IN')}</span>
                          <div>
                            <button
                              onClick={() => handleViewOrders(p)}
                              style={{ background: 'none', border: 'none', color: '#4f46e5', padding: 0, fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                            >
                              {p.orderCount} order(s) placed
                            </button>
                          </div>
                        </td>

                        {/* Progress */}
                        <td style={{ minWidth: '140px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginBottom: '4px' }}>
                            <span style={{ color: p.isQualified ? '#059669' : '#4f46e5' }}>
                              {p.progressPercentage}%
                            </span>
                            {p.isQualified ? (
                              <span style={{ color: '#059669' }}>Reached!</span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>₹{(p.targetAmount - p.totalPurchased).toLocaleString('en-IN')} left</span>
                            )}
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                width: `${p.progressPercentage}%`, 
                                height: '100%', 
                                background: p.isQualified ? '#10b981' : '#4f46e5',
                                borderRadius: '4px'
                              }} 
                            />
                          </div>
                        </td>

                        {/* Shipping Destination */}
                        <td style={{ maxWidth: '180px' }}>
                          <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.3 }}>
                            {claim?.shippingAddress?.address || p.user?.address || (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No address provided</span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          {status === 'Pending Dispatch' && (
                            <span className="stock-badge-pill pending">
                              <span className="stock-dot"></span>
                              READY TO SEND
                            </span>
                          )}
                          {status === 'Dispatched' && (
                            <div>
                              <span className="stock-badge-pill dispatched">
                                <span className="stock-dot"></span>
                                DISPATCHED
                              </span>
                              {claim?.dispatchDetails?.dispatchedAt && (
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                                  Dispatched: {new Date(claim.dispatchDetails.dispatchedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          )}
                          {status === 'Delivered' && (
                            <span className="stock-badge-pill in">
                              <span className="stock-dot"></span>
                              DELIVERED
                            </span>
                          )}
                          {status === 'In Progress' && (
                            <span className="stock-badge-pill" style={{ background: '#f1f5f9', color: '#64748b' }}>
                              IN PROGRESS
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {status === 'Pending Dispatch' && (
                              <button
                                onClick={() => handleOpenDispatchDrawer(claim, p)}
                                className="btn-table-action btn-action-primary"
                              >
                                <FiSend /> Dispatch Gift
                              </button>
                            )}
                            {status === 'Dispatched' && (
                              <button
                                onClick={() => handleMarkDelivered(claim._id)}
                                className="btn-table-action"
                                style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
                                title="Confirm Gift Delivered"
                              >
                                <FiCheck /> Mark Delivered
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="table-pagination-footer">
            <div className="pagination-meta-info">
              <span>
                Showing {filteredParticipants.length === 0 ? 0 : (claimPage - 1) * claimsPerPage + 1} to {Math.min(claimPage * claimsPerPage, filteredParticipants.length)} of {filteredParticipants.length} customers
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Rows:</span>
                <select 
                  className="rows-select" 
                  value={claimsPerPage} 
                  onChange={e => { setClaimsPerPage(Number(e.target.value)); setClaimPage(1); }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            <div className="pagination-controls-row">
              <button 
                className="pagination-nav-btn" 
                disabled={claimPage === 1}
                onClick={() => setClaimPage(prev => Math.max(prev - 1, 1))}
              >
                <FiChevronLeft />
              </button>
              {Array.from({ length: totalClaimPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  className={`page-pill-btn ${claimPage === page ? 'active' : ''}`}
                  onClick={() => setClaimPage(page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="pagination-nav-btn" 
                disabled={claimPage === totalClaimPages}
                onClick={() => setClaimPage(prev => Math.min(prev + 1, totalClaimPages))}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER DRAWER MODAL FOR CREATE/EDIT CAMPAIGN (Matching AdminProducts) */}
      {showDrawer && (
        <div className="drawer-overlay" onClick={handleCloseDrawer}>
          <div className="drawer-panel" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h3>{editingCampaignId ? 'Edit Gift Offer Campaign' : 'Create Gift Offer Campaign'}</h3>
                <p>{editingCampaignId ? 'Update milestone target threshold and gift specs' : 'Configure qualifying order value, time period & reward gift'}</p>
              </div>
              <button className="drawer-close-btn" onClick={handleCloseDrawer}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="drawer-body">
              <div className="drawer-field-group">
                <label className="drawer-field-label">Campaign Title *</label>
                <input 
                  type="text" 
                  className="drawer-field-input" 
                  value={campaignForm.title} 
                  onChange={e => setCampaignForm({ ...campaignForm, title: e.target.value })} 
                  placeholder="e.g. Diwali Mega Gift Offer Bonanza" 
                  required 
                />
              </div>

              <div className="drawer-field-group">
                <label className="drawer-field-label">Campaign Subtitle</label>
                <input 
                  type="text" 
                  className="drawer-field-input" 
                  value={campaignForm.subtitle} 
                  onChange={e => setCampaignForm({ ...campaignForm, subtitle: e.target.value })} 
                  placeholder="e.g. Exclusive Milestone Gift Offer" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="drawer-field-group">
                  <label className="drawer-field-label">Target Order Value (₹) *</label>
                  <input 
                    type="number" 
                    className="drawer-field-input" 
                    value={campaignForm.targetAmount} 
                    onChange={e => setCampaignForm({ ...campaignForm, targetAmount: e.target.value })} 
                    placeholder="e.g. 25000" 
                    min="1"
                    required 
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Cumulative amount customer must spend</span>
                </div>
                <div className="drawer-field-group">
                  <label className="drawer-field-label">Gift Market Value (₹)</label>
                  <input 
                    type="number" 
                    className="drawer-field-input" 
                    value={campaignForm.giftValue} 
                    onChange={e => setCampaignForm({ ...campaignForm, giftValue: e.target.value })} 
                    placeholder="e.g. 4999" 
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Displayed as "Worth ₹X FREE!"</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="drawer-field-group">
                  <label className="drawer-field-label">Start Date *</label>
                  <input 
                    type="date" 
                    className="drawer-field-input" 
                    value={campaignForm.startDate} 
                    onChange={e => setCampaignForm({ ...campaignForm, startDate: e.target.value })} 
                    required 
                  />
                </div>
                <div className="drawer-field-group">
                  <label className="drawer-field-label">End Date *</label>
                  <input 
                    type="date" 
                    className="drawer-field-input" 
                    value={campaignForm.endDate} 
                    onChange={e => setCampaignForm({ ...campaignForm, endDate: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              {/* Gift Item Selector: Store Products Catalog */}
              <div className="drawer-field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <label className="drawer-field-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                    <FiShoppingBag style={{ color: '#4f46e5' }} /> Select From Store Products Catalog ({storeProducts.length})
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Click a product to auto-fill details, or customize below
                  </span>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem' }}>
                  {/* Instant Search Bar */}
                  <div style={{ position: 'relative', marginBottom: '0.6rem' }}>
                    <FiSearch style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }} />
                    <input 
                      type="text" 
                      value={storeProductSearch}
                      onChange={e => setStoreProductSearch(e.target.value)}
                      placeholder="Search your store catalog products by name..."
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.75rem 0.45rem 2rem',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    {storeProductSearch && (
                      <button
                        type="button"
                        onClick={() => setStoreProductSearch('')}
                        style={{
                          position: 'absolute',
                          right: '0.6rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          padding: '2px'
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Products Grid */}
                  {loadingStoreProducts ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.75rem' }}>
                      Loading store products...
                    </div>
                  ) : (
                    <div className="store-products-quick-grid">
                      {filteredStoreProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1.25rem', color: '#94a3b8', fontSize: '0.75rem', gridColumn: '1 / -1' }}>
                          No store products found matching "{storeProductSearch}"
                        </div>
                      ) : (
                        filteredStoreProducts.map(prod => {
                          const isSelected = selectedStoreProduct?._id === prod._id || campaignForm.giftProduct === prod._id || campaignForm.giftTitle === prod.name;
                          const pImg = prod.images?.[0] || DEFAULT_GIFT_FALLBACK_IMAGE;
                          return (
                            <button
                              key={prod._id}
                              type="button"
                              className={`store-product-pick-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleSelectStoreProduct(prod)}
                            >
                              <img 
                                src={pImg} 
                                alt={prod.name} 
                                className="store-product-pick-thumb"
                                onError={e => { e.target.src = DEFAULT_GIFT_FALLBACK_IMAGE; }}
                              />
                              <div className="store-product-pick-info">
                                <div className="store-product-pick-title" title={prod.name}>{prod.name}</div>
                                <div className="store-product-pick-meta">
                                  <span className="store-product-pick-price">₹{prod.price?.toLocaleString('en-IN')}</span>
                                  {prod.stock > 0 ? (
                                    <span className="store-product-pick-stock in">{prod.stock} in stock</span>
                                  ) : (
                                    <span className="store-product-pick-stock out">Out of stock</span>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <div className="store-product-pick-check">
                                  <FiCheck />
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="drawer-field-group">
                <label className="drawer-field-label">Gift Title / Item Name *</label>
                <input 
                  type="text" 
                  className="drawer-field-input" 
                  value={campaignForm.giftTitle} 
                  onChange={e => setCampaignForm({ ...campaignForm, giftTitle: e.target.value })} 
                  placeholder="e.g. Noise ColorFit Pulse 2 Max Smartwatch" 
                  required 
                />
              </div>

              {/* Gift Image (Cloudinary File Upload + Direct URL Fallback) */}
              <div className="drawer-field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="drawer-field-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Gift Image * 
                    <span className="cloudinary-cloud-badge">
                      <FiUploadCloud /> Cloudinary Upload
                    </span>
                  </label>
                  <button 
                    type="button" 
                    className="url-toggle-btn"
                    onClick={() => setShowUrlField(prev => !prev)}
                  >
                    <FiLink /> {showUrlField ? 'Hide URL input' : 'Or enter image URL'}
                  </button>
                </div>

                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/png, image/jpeg, image/webp, image/gif" 
                  style={{ display: 'none' }} 
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFileSelect(e.target.files[0]);
                    }
                  }} 
                />

                {/* If a new file is staged for Cloudinary upload */}
                {giftImageFile ? (
                  <div className="uploaded-file-card">
                    <img src={giftImagePreview} alt="Upload preview" className="uploaded-file-thumb" />
                    <div className="uploaded-file-details">
                      <div className="uploaded-file-name">{giftImageFile.name}</div>
                      <div className="uploaded-file-meta">
                        <FiCheckCircle /> {(giftImageFile.size / 1024).toFixed(1)} KB • Ready for Cloudinary
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn-remove-file"
                      onClick={handleRemoveImageFile}
                      title="Remove and revert"
                    >
                      <FiX /> Remove
                    </button>
                  </div>
                ) : (
                  /* Dropzone box */
                  <div 
                    className={`uploader-dropzone-box ${isDraggingImage ? 'drag-active' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="uploader-drop-icon">
                      <FiUploadCloud />
                    </div>
                    <div className="uploader-drop-title">
                      Click to choose image or drag &amp; drop
                    </div>
                    <div className="uploader-drop-hint">
                      PNG, JPG, WEBP or GIF up to 8MB • Auto-uploaded to Cloudinary CDN
                    </div>
                  </div>
                )}

                {/* Current Image / Preview thumbnail if using existing URL / preset */}
                {!giftImageFile && giftImagePreview && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    padding: '0.5rem 0.75rem', 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    marginTop: '0.35rem'
                  }}>
                    <img 
                      src={giftImagePreview} 
                      alt="Current preview" 
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      onError={e => { e.target.src = DEFAULT_GIFT_FALLBACK_IMAGE; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#334155' }}>Current Gift Image</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {giftImagePreview}
                      </div>
                    </div>
                    <button 
                      type="button"
                      style={{ 
                        fontSize: '0.72rem', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '6px', 
                        border: '1px solid #cbd5e1', 
                        background: '#ffffff', 
                        color: '#4f46e5', 
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Replace File
                    </button>
                  </div>
                )}

                {/* Optional direct URL input if toggled */}
                {showUrlField && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <input 
                      type="url" 
                      className="drawer-field-input" 
                      value={campaignForm.giftImage} 
                      onChange={e => {
                        const url = e.target.value;
                        setCampaignForm(prev => ({ ...prev, giftImage: url }));
                        if (!giftImageFile) setGiftImagePreview(url);
                      }} 
                      placeholder="https://images.unsplash.com/photo-..." 
                    />
                    <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                      Direct web image URL fallback (used if no file uploaded)
                    </span>
                  </div>
                )}
              </div>

              <div className="drawer-field-group">
                <label className="drawer-field-label">Gift Features &amp; Description</label>
                <textarea 
                  className="drawer-field-input" 
                  rows={2} 
                  value={campaignForm.giftDescription} 
                  onChange={e => setCampaignForm({ ...campaignForm, giftDescription: e.target.value })} 
                  placeholder="e.g. 1.85'' HD Display, Bluetooth Calling, 10-day battery life..."
                />
              </div>

              <div className="drawer-field-group">
                <label className="drawer-field-label">Campaign Explanatory Description</label>
                <textarea 
                  className="drawer-field-input" 
                  rows={2} 
                  value={campaignForm.description} 
                  onChange={e => setCampaignForm({ ...campaignForm, description: e.target.value })} 
                  placeholder="Explaining the milestone promotion to shoppers..."
                />
              </div>

              <div className="drawer-field-group">
                <label className="drawer-field-label">Terms &amp; Conditions (one per line)</label>
                <textarea 
                  className="drawer-field-input" 
                  rows={3} 
                  value={campaignForm.terms} 
                  onChange={e => setCampaignForm({ ...campaignForm, terms: e.target.value })} 
                  placeholder="Rules & guidelines for qualifying..."
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="campIsActive" 
                  checked={campaignForm.isActive} 
                  onChange={e => setCampaignForm({ ...campaignForm, isActive: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#4f46e5' }}
                />
                <label htmlFor="campIsActive" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                  Campaign is Active &amp; Visible to Customers
                </label>
              </div>

              <div className="drawer-footer">
                <button type="button" className="drawer-btn-cancel" onClick={handleCloseDrawer}>
                  Cancel
                </button>
                <button type="submit" disabled={submittingCampaign} className="drawer-btn-submit">
                  {submittingCampaign ? (giftImageFile ? 'Uploading to Cloudinary...' : 'Saving Campaign...') : (editingCampaignId ? 'Update Campaign' : 'Launch Campaign')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SLIDE-OVER DRAWER MODAL FOR DISPATCH GIFT */}
      {showDispatchDrawer && selectedClaimForDispatch && (
        <div className="drawer-overlay" onClick={() => setShowDispatchDrawer(false)}>
          <div className="drawer-panel" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h3>Dispatch Milestone Gift</h3>
                <p>Send gift to {selectedClaimForDispatch.participantUser?.name || 'Customer'}</p>
              </div>
              <button className="drawer-close-btn" onClick={() => setShowDispatchDrawer(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleConfirmDispatch} className="drawer-body">
              {/* Recipient Details Card */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                  Recipient: {selectedClaimForDispatch.participantUser?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Email: {selectedClaimForDispatch.participantUser?.email} &bull; Phone: {selectedClaimForDispatch.participantUser?.phone || 'N/A'}
                </div>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginTop: '0.25rem', fontSize: '0.78rem', color: '#334155' }}>
                  <strong>Destination Address:</strong><br />
                  {selectedClaimForDispatch.shippingAddress?.address || selectedClaimForDispatch.participantUser?.address || 'No address specified'}
                </div>
              </div>

              <div className="drawer-field-group">
                <label className="drawer-field-label">Dispatch Date</label>
                <input 
                  type="date" 
                  className="drawer-field-input" 
                  value={dispatchForm.dispatchedAt} 
                  onChange={e => setDispatchForm({ ...dispatchForm, dispatchedAt: e.target.value })} 
                />
              </div>

              <div className="drawer-field-group">
                <label className="drawer-field-label">Dispatch Remarks / Notes</label>
                <textarea 
                  className="drawer-field-input" 
                  rows={3} 
                  value={dispatchForm.adminNotes} 
                  onChange={e => setDispatchForm({ ...dispatchForm, adminNotes: e.target.value })} 
                  placeholder="e.g. Gift dispatched via direct doorstep delivery. Handled with care."
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
                <input 
                  type="checkbox" 
                  id="notifyCustomerEmail" 
                  checked={dispatchForm.notifyCustomer} 
                  onChange={e => setDispatchForm({ ...dispatchForm, notifyCustomer: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#4f46e5' }}
                />
                <label htmlFor="notifyCustomerEmail" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                  Send dispatch confirmation notification to customer
                </label>
              </div>

              <div className="drawer-footer">
                <button type="button" className="drawer-btn-cancel" onClick={() => setShowDispatchDrawer(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={dispatchSubmitting} className="drawer-btn-submit">
                  <FiSend /> {dispatchSubmitting ? 'Dispatching...' : 'Confirm & Dispatch Gift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW CONTRIBUTING ORDERS */}
      {showOrdersModal && selectedParticipantOrders && (
        <div className="drawer-overlay" onClick={() => setShowOrdersModal(false)}>
          <div className="drawer-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="drawer-header">
              <div>
                <h3>Contributing Orders</h3>
                <p>Orders placed by {selectedParticipantOrders.user?.name} in campaign window</p>
              </div>
              <button className="drawer-close-btn" onClick={() => setShowOrdersModal(false)}>
                <FiX />
              </button>
            </div>

            <div className="drawer-body">
              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Qualifying Purchases:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                  ₹{selectedParticipantOrders.totalPurchased?.toLocaleString('en-IN')}
                </span>
              </div>

              {selectedParticipantOrders.orders?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No individual orders found</div>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', textAlign: 'left', color: '#64748b' }}>
                        <th style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>Order ID</th>
                        <th style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                        <th style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                        <th style={{ padding: '8px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedParticipantOrders.orders.map((ord, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 600 }}>#{ord._id?.slice(-8)}</td>
                          <td style={{ padding: '8px 10px', color: '#64748b' }}>{new Date(ord.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span className="cat-chip-tag">{ord.status}</span>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            ₹{ord.totalAmount?.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="drawer-footer">
              <button type="button" className="drawer-btn-cancel" onClick={() => setShowOrdersModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturnGifts;
