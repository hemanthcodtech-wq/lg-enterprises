import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingBag, FiTruck, FiShield, FiUsers, FiAward, FiCheckCircle,
  FiTrendingUp, FiGift, FiCopy, FiArrowRight, FiDollarSign, FiChevronDown,
  FiChevronUp, FiPercent, FiPackage, FiPhoneCall, FiMapPin, FiLayers,
  FiStar, FiRefreshCw, FiZap, FiHelpCircle
} from 'react-icons/fi';
import {
  FaTv, FaCouch, FaBasketShopping, FaShirt, FaBlender,
  FaHandshakeAngle, FaNetworkWired, FaCoins
} from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';

// Typewriter phrases
const typewriterPhrases = [
  "All-in-One E-Commerce Megastore",
  "Electronics · Furniture · Groceries · Fashion",
  "Earn Passive Income with 5-Tier Referral Rewards",
  "Bhimavaram's #1 Retail & Online Supercenter",
  "Wholesale & Retail Products at Guaranteed Best Rates"
];

// Product catalog categories
const categoriesShowcase = [
  {
    icon: <FaTv />,
    title: "Electronics & Smart Tech",
    badge: "Top Brands",
    description: "Smart 4K LED TVs, latest smartphones, laptops, high-fidelity soundbars, and gaming accessories with brand warranties.",
    color: "#4f46e5",
    bg: "#eef2ff"
  },
  {
    icon: <FaCouch />,
    title: "Furniture & Interior",
    badge: "Crafted Solid Wood",
    description: "Premium teakwood sofas, ergonomic work desks, orthopaedic mattresses, modular wardrobes, and luxury dining tables.",
    color: "#f59e0b",
    bg: "#fffbeb"
  },
  {
    icon: <FaBasketShopping />,
    title: "Groceries & Daily Essentials",
    badge: "Farm Fresh & Pure",
    description: "Premium staples, pure edible oils, pulses, organic spices, packaged foods, and everyday household hygiene items.",
    color: "#10b981",
    bg: "#ecfdf5"
  },
  {
    icon: <FaShirt />,
    title: "Cloth & Fashion Apparel",
    badge: "Latest Trends",
    description: "Ethnic traditional wear, comfortable cotton casuals, menswear, designer women's fashion, and vibrant kids' collections.",
    color: "#ec4899",
    bg: "#fdf2f8"
  },
  {
    icon: <FaBlender />,
    title: "Home & Kitchen Appliances",
    badge: "Energy Efficient",
    description: "Double-door refrigerators, heavy-duty mixer grinders, microwaves, air fryers, induction stoves, and chimneys.",
    color: "#8b5cf6",
    bg: "#f5f3ff"
  },
  {
    icon: <FaHandshakeAngle />,
    title: "Wholesale & Bulk Supply",
    badge: "B2B Volume Rates",
    description: "Special institutional pricing for contractors, retail resellers, hospitality, and bulk corporate gifts across Andhra Pradesh.",
    color: "#4f46e5",
    bg: "#eef2ff"
  }
];

// 5-Level commission tiers matching Navbar primary theme
const referralTiers = [
  {
    level: 1,
    title: "Direct Referral",
    rate: 5.0,
    color: "#4f46e5",
    bg: "#eef2ff",
    description: "Earn 5% every single time your directly invited friends purchase any product.",
    example: "Friend buys ₹10,000 electronics → You get ₹500 instant wallet credit"
  },
  {
    level: 2,
    title: "2nd-Gen Network",
    rate: 2.5,
    color: "#6366f1",
    bg: "#f5f3ff",
    description: "Earn 2.5% when customers referred by your direct friends place an order.",
    example: "Level 2 buys ₹10,000 sofa set → You get ₹250 wallet credit"
  },
  {
    level: 3,
    title: "3rd-Gen Network",
    rate: 2.0,
    color: "#0284c7",
    bg: "#f0f9ff",
    description: "Earn 2.0% automatically on all orders placed 3 tiers below your initial invites.",
    example: "Level 3 buys ₹10,000 grocery cart → You get ₹200 wallet credit"
  },
  {
    level: 4,
    title: "4th-Gen Network",
    rate: 1.5,
    color: "#059669",
    bg: "#ecfdf5",
    description: "Earn 1.5% passive commission expanding into wider communities and groups.",
    example: "Level 4 buys ₹10,000 wardrobe → You get ₹150 wallet credit"
  },
  {
    level: 5,
    title: "5th-Gen Network",
    rate: 1.0,
    color: "#d97706",
    bg: "#fffbeb",
    description: "Earn 1.0% on deep network purchases. Exponential volume creates huge recurring passive income.",
    example: "Level 5 buys ₹10,000 TV → You get ₹100 wallet credit"
  }
];

// User's exact 6 scenario stages
const scenarioSteps = [
  {
    id: 1,
    title: "Stage 1: User 1 refers User 2",
    buyer: "User 2",
    action: "User 2 buys products worth ₹10,000",
    payouts: [
      { user: "User 1", level: "Level 1", percent: "5.0%", amount: "₹500.00" }
    ],
    note: "User 1 receives direct 5% commission into their wallet."
  },
  {
    id: 2,
    title: "Stage 2: User 2 refers User 3",
    buyer: "User 3",
    action: "User 3 buys products worth ₹10,000",
    payouts: [
      { user: "User 2", level: "Level 1 (Direct)", percent: "5.0%", amount: "₹500.00" },
      { user: "User 1", level: "Level 2", percent: "2.5%", amount: "₹250.00" }
    ],
    note: "User 2 gets 5% and User 1 gets 2.5% passive commission."
  },
  {
    id: 3,
    title: "Stage 3: User 3 refers User 4",
    buyer: "User 4",
    action: "User 4 buys products worth ₹10,000",
    payouts: [
      { user: "User 3", level: "Level 1", percent: "5.0%", amount: "₹500.00" },
      { user: "User 2", level: "Level 2", percent: "2.5%", amount: "₹250.00" },
      { user: "User 1", level: "Level 3", percent: "2.0%", amount: "₹200.00" }
    ],
    note: "Commissions cascade up 3 tiers simultaneously."
  },
  {
    id: 4,
    title: "Stage 4: User 4 refers User 5",
    buyer: "User 5",
    action: "User 5 buys products worth ₹10,000",
    payouts: [
      { user: "User 4", level: "Level 1", percent: "5.0%", amount: "₹500.00" },
      { user: "User 3", level: "Level 2", percent: "2.5%", amount: "₹250.00" },
      { user: "User 2", level: "Level 3", percent: "2.0%", amount: "₹200.00" },
      { user: "User 1", level: "Level 4", percent: "1.5%", amount: "₹150.00" }
    ],
    note: "User 1 still collects 1.5% from a customer 4 generations away!"
  },
  {
    id: 5,
    title: "Stage 5: User 5 refers User 6",
    buyer: "User 6",
    action: "User 6 buys products worth ₹10,000",
    payouts: [
      { user: "User 5", level: "Level 1", percent: "5.0%", amount: "₹500.00" },
      { user: "User 4", level: "Level 2", percent: "2.5%", amount: "₹250.00" },
      { user: "User 3", level: "Level 3", percent: "2.0%", amount: "₹200.00" },
      { user: "User 2", level: "Level 4", percent: "1.5%", amount: "₹150.00" },
      { user: "User 1", level: "Level 5", percent: "1.0%", amount: "₹100.00" }
    ],
    note: "All 5 tiers receive their commission credit."
  },
  {
    id: 6,
    title: "Stage 6: User 6 refers User 7 (5-Stage Cap Example)",
    buyer: "User 7",
    action: "User 7 buys products worth ₹10,000",
    payouts: [
      { user: "User 6", level: "Level 1", percent: "5.0%", amount: "₹500.00" },
      { user: "User 5", level: "Level 2", percent: "2.5%", amount: "₹250.00" },
      { user: "User 4", level: "Level 3", percent: "2.0%", amount: "₹200.00" },
      { user: "User 3", level: "Level 4", percent: "1.5%", amount: "₹150.00" },
      { user: "User 2", level: "Level 5", percent: "1.0%", amount: "₹100.00" },
      { user: "User 1", level: "Stage Exceeded (> 5)", percent: "0.0%", amount: "₹0.00 (Cap Reached)" }
    ],
    note: "As defined, User 1 receives 0% because 5 stages are exceeded. User 2 down to 6 receive full commissions!"
  }
];

// FAQs
const faqsList = [
  {
    q: "What products are available on LG Enterprises?",
    a: "LG Enterprises is a comprehensive e-commerce megastore with over 10,000+ products spanning Electronics (TVs, Laptops, Phones), Solid Wood Furniture, Daily Grocery Essentials, Apparel & Clothing, Home & Kitchen Appliances, and B2B Wholesale supplies."
  },
  {
    q: "How does the 5-Tier Referral System work?",
    a: "When you share your unique referral code or link with friends, they become part of your affiliate network. Every time someone in your 5-tier downline buys any product, you receive: 5% (Level 1), 2.5% (Level 2), 2% (Level 3), 1.5% (Level 4), and 1% (Level 5) credited straight to your digital wallet."
  },
  {
    q: "Can I refer multiple customers?",
    a: "Yes! There is zero limit to the number of direct customers you can refer. Whether you invite 5, 50, or 500 people, you earn 5% on each of their purchases, plus multi-level commissions whenever they invite others."
  },
  {
    q: "Do I get commission on every order or only the first one?",
    a: "You receive commissions on multiple repeat orders placed by referred customers! Whenever any customer in your 5 tiers shops on LG Enterprises, commissions are calculated and credited automatically."
  },
  {
    q: "How can I spend my referral wallet balance?",
    a: "Your wallet balance can be used directly during checkout to pay for 100% of any product order (electronics, groceries, furniture, etc.) without restrictions or minimum order thresholds."
  },
  {
    q: "Where is LG Enterprises physically located?",
    a: "Our flagship retail supercenter is located at LG Complex, Main Road, Bhimavaram, Andhra Pradesh - 534201. We welcome walk-in shoppers and deliver across all pin codes in India."
  }
];

const About = () => {
  const { user } = useAuth();

  // Typewriter effect state
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(70);

  // Active scenario step state
  const [activeStep, setActiveStep] = useState(1);

  // Interactive Earnings Calculator state
  const [directInvites, setDirectInvites] = useState(5);
  const [subInvites, setSubInvites] = useState(3);
  const [avgSpend, setAvgSpend] = useState(4000);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState(null);

  // Typewriter logic
  useEffect(() => {
    const handleType = () => {
      const fullText = typewriterPhrases[currentPhraseIndex];
      if (isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length - 1));
        setTypingSpeed(35);
      } else {
        setCurrentText(fullText.substring(0, currentText.length + 1));
        setTypingSpeed(65);
      }

      if (!isDeleting && currentText === fullText) {
        setTimeout(() => setIsDeleting(true), 1800);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % typewriterPhrases.length);
        setTypingSpeed(100);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentPhraseIndex, typingSpeed]);

  // Calculator projections
  const l1Count = directInvites;
  const l2Count = l1Count * subInvites;
  const l3Count = l2Count * subInvites;
  const l4Count = l3Count * subInvites;
  const l5Count = l4Count * subInvites;

  const l1Income = Math.round(l1Count * avgSpend * 0.05);
  const l2Income = Math.round(l2Count * avgSpend * 0.025);
  const l3Income = Math.round(l3Count * avgSpend * 0.02);
  const l4Income = Math.round(l4Count * avgSpend * 0.015);
  const l5Income = Math.round(l5Count * avgSpend * 0.01);

  const totalCalculatedIncome = l1Income + l2Income + l3Income + l4Income + l5Income;
  const totalNetworkShoppers = l1Count + l2Count + l3Count + l4Count + l5Count;

  return (
    <div className="about-page-wrapper" style={{ background: '#f8fafc', color: '#1e293b' }}>

      {/* New Split Hero Section with Live Showcase & Navbar Indigo Theme */}
      <section className="about-hero-section">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        <div className="about-container" style={{ position: 'relative', zIndex: 2 }}>
          
          <div className="hero-split-layout">
            
            {/* Left Content Column */}
            <div className="hero-left-content animate-slide-up">
              
              <div className="hero-badge">
                <span className="live-status-pulse"></span>
                <span>Omnichannel Retail Megastore & 5-Tier Referral Engine</span>
              </div>

              <h1 className="hero-main-title">
                Everything for Home, <br />
                <span className="gradient-text">Passive Income for Life.</span>
              </h1>

              {/* Dynamic Typewriter Terminal Bar */}
              <div className="typewriter-box">
                <span className="typewriter-label">Catalog: </span>
                <span className="typewriter-text">{currentText}</span>
                <span className="typewriter-cursor">|</span>
              </div>

              <p className="hero-subtitle">
                Explore 10,000+ brand-certified products across <strong>Electronics, Teak Furniture, Daily Groceries & Fashion</strong> — 
                paired with our automated <strong>5-Stage Multi-Tier Referral System</strong> that credits your digital wallet 
                with up to 5% cash commission on every purchase made in your network!
              </p>

              <div className="hero-cta-group">
                <a href="#referral-system" className="btn-hero-primary">
                  <FiGift /> Explore 5-Tier Referral Plan
                </a>
                <a href="#calculator" className="btn-hero-secondary">
                  <FiDollarSign /> Open Income Calculator
                </a>
                <Link to="/" className="btn-hero-outline">
                  <FiShoppingBag /> Shop Products
                </Link>
              </div>

              {/* Trust signals row */}
              <div className="hero-trust-row">
                <div className="trust-pill">
                  <FiStar style={{ color: '#f59e0b' }} /> <strong>4.9 / 5</strong> (50K+ Shoppers)
                </div>
                <div className="trust-pill">
                  <FiMapPin style={{ color: '#818cf8' }} /> <strong>Bhimavaram Showroom</strong> + Pan-India
                </div>
                <div className="trust-pill">
                  <FiShield style={{ color: '#10b981' }} /> <strong>100% Genuine</strong> Warranties
                </div>
              </div>

            </div>

            {/* Right Interactive Visual Showcase Column */}
            <div className="hero-right-showcase animate-fade-in">
              <div className="hero-showcase-glass-card">
                
                <div className="showcase-card-header">
                  <div className="card-brand-badge">
                    <span className="brand-dot"></span> LG Megastore & Rewards
                  </div>
                  <span className="active-tier-pill">5-Stage Live Engine</span>
                </div>

                {/* Live Stream Ticker Preview */}
                <div className="showcase-ticker-box">
                  <div className="ticker-label-row">
                    <span className="ticker-tag">Active Wallet Stream</span>
                    <span className="ticker-rate">Up to 5.0% Payout</span>
                  </div>
                  <div className="ticker-event">
                    <div className="ticker-icon"><FaCoins /></div>
                    <div>
                      <strong>₹500.00 Wallet Credit</strong>
                      <p>Awarded on direct Level 1 purchase of 4K Smart TV</p>
                    </div>
                  </div>
                </div>

                {/* Floating Category Badges */}
                <div className="showcase-categories-grid">
                  <div className="category-mini-pill">
                    <span className="mini-icon tv"><FaTv /></span>
                    <div>
                      <strong>Electronics</strong>
                      <span>4K TVs & Mobiles</span>
                    </div>
                  </div>
                  <div className="category-mini-pill">
                    <span className="mini-icon couch"><FaCouch /></span>
                    <div>
                      <strong>Furniture</strong>
                      <span>Teak Sofas & Beds</span>
                    </div>
                  </div>
                  <div className="category-mini-pill">
                    <span className="mini-icon grocery"><FaBasketShopping /></span>
                    <div>
                      <strong>Groceries</strong>
                      <span>Farm Staples</span>
                    </div>
                  </div>
                  <div className="category-mini-pill">
                    <span className="mini-icon shirt"><FaShirt /></span>
                    <div>
                      <strong>Cloth & Fashion</strong>
                      <span>Ethnic & Wear</span>
                    </div>
                  </div>
                </div>

                {/* 5-Tier Quick Matrix Preview */}
                <div className="showcase-matrix-strip">
                  <div className="matrix-title">5-Stage Cascading Payout Rates</div>
                  <div className="matrix-bars-row">
                    <div className="matrix-bar-item active">
                      <span className="m-lvl">L1</span>
                      <div className="m-bar h-100"></div>
                      <span className="m-pct">5%</span>
                    </div>
                    <div className="matrix-bar-item">
                      <span className="m-lvl">L2</span>
                      <div className="m-bar h-75"></div>
                      <span className="m-pct">2.5%</span>
                    </div>
                    <div className="matrix-bar-item">
                      <span className="m-lvl">L3</span>
                      <div className="m-bar h-60"></div>
                      <span className="m-pct">2%</span>
                    </div>
                    <div className="matrix-bar-item">
                      <span className="m-lvl">L4</span>
                      <div className="m-bar h-45"></div>
                      <span className="m-pct">1.5%</span>
                    </div>
                    <div className="matrix-bar-item">
                      <span className="m-lvl">L5</span>
                      <div className="m-bar h-30"></div>
                      <span className="m-pct">1%</span>
                    </div>
                  </div>
                </div>

                <div className="showcase-card-footer">
                  <span>🏪 Physical Store: LG Complex, Main Road, Bhimavaram</span>
                </div>

              </div>
            </div>

          </div>

          {/* Bottom Metric Stat Ribbon */}
          <div className="hero-stats-ribbon">
            {[
              { value: "10,000+", label: "Products Listed", icon: <FiPackage /> },
              { value: "5 Tiers", label: "Referral Commission", icon: <FiTrendingUp /> },
              { value: "50,000+", label: "Happy Shoppers", icon: <FiUsers /> },
              { value: "15+ Years", label: "Retail Legacy (Est. 2009)", icon: <FiAward /> },
            ].map((stat, i) => (
              <div key={i} className="ribbon-stat-item">
                <div className="ribbon-icon">{stat.icon}</div>
                <div>
                  <div className="ribbon-number">{stat.value}</div>
                  <div className="ribbon-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Business Core Story & Identity */}
      <section className="about-section-pad">
        <div className="about-container">
          <div className="story-split-grid">
            
            <div className="story-text-col">
              <div className="section-pill">Our Heritage & Mission</div>
              <h2 className="section-heading">
                Bhimavaram's Most Trusted <span>All-in-One Megastore</span>
              </h2>
              <p className="story-paragraph">
                Established in <strong>2009 in Bhimavaram, Andhra Pradesh</strong>, LG Enterprises was founded 
                on an uncompromising promise: delivering top-grade products with genuine manufacturer warranties 
                and wholesale-friendly pricing under one grand umbrella.
              </p>
              <p className="story-paragraph">
                What began as a renowned local electronics and appliance store has transformed into a dynamic 
                omnichannel e-commerce platform. Today, whether you need 4K OLED Smart TVs, handcrafted teak dining tables, 
                everyday staples for your kitchen, or wholesale orders for corporate setups — LG Enterprises brings it 
                to your doorstep with fast, reliable courier delivery.
              </p>

              <div className="story-features-list">
                <div className="story-feature-item">
                  <FiCheckCircle className="check-icon" />
                  <div>
                    <strong>Direct Brand Sourcing</strong>
                    <p>Zero middlemen — genuine electronics and consumer appliances backed by official warranties.</p>
                  </div>
                </div>
                <div className="story-feature-item">
                  <FiCheckCircle className="check-icon" />
                  <div>
                    <strong>Retail & Wholesale Dual Advantage</strong>
                    <p>Whether you're purchasing a single product or outfitting a complete building, enjoy scale discounts.</p>
                  </div>
                </div>
                <div className="story-feature-item">
                  <FiCheckCircle className="check-icon" />
                  <div>
                    <strong>Physical Showroom + Pan-India Shipping</strong>
                    <p>Touch, feel, and inspect furniture and appliances at our Bhimavaram store, or order seamlessly online.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="story-visual-col">
              <div className="story-card-stack">
                <div className="stack-badge top-right">
                  <FiAward /> 100% Genuine Certified
                </div>
                <div className="store-info-box">
                  <div className="store-icon-circle">
                    <FiMapPin />
                  </div>
                  <h3>Visit Our Flagship Store</h3>
                  <p>LG Complex, Main Road, Bhimavaram, Andhra Pradesh – 534201</p>
                  <div className="store-meta-grid">
                    <div>
                      <span>Mon - Sat</span>
                      <strong>9:00 AM - 8:30 PM</strong>
                    </div>
                    <div>
                      <span>Direct Helpline</span>
                      <strong>+91 98765 43210</strong>
                    </div>
                  </div>
                  <Link to="/contact" className="store-link-btn">
                    Get Directions & In-Store Inquiry <FiArrowRight />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Comprehensive Products Showcase */}
      <section className="about-section-pad" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="about-container">
          <div className="text-center-heading">
            <div className="section-pill">Product Catalog</div>
            <h2 className="section-heading">
              Everything You Need, <span>Under One Roof</span>
            </h2>
            <p className="section-subtext">
              Browse thousands of hand-selected products across our key categories with easy doorstep delivery.
            </p>
          </div>

          <div className="categories-card-grid">
            {categoriesShowcase.map((cat, i) => (
              <div key={i} className="category-showcase-card">
                <div className="cat-card-header">
                  <div className="cat-icon-avatar" style={{ color: cat.color, background: cat.bg }}>
                    {cat.icon}
                  </div>
                  <span className="cat-badge-pill" style={{ color: cat.color, background: cat.bg }}>
                    {cat.badge}
                  </span>
                </div>
                <h3 className="cat-title">{cat.title}</h3>
                <p className="cat-desc">{cat.description}</p>
                <Link to="/" className="cat-action-link" style={{ color: cat.color }}>
                  Browse Collection <FiArrowRight />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5-TIER REFERRAL PROGRAM MASTERPIECE SECTION */}
      <section id="referral-system" className="about-section-pad referral-showcase-section">
        <div className="about-container">
          
          <div className="text-center-heading">
            <div className="section-pill" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
              <FiGift style={{ marginRight: '6px' }} /> Exclusive Affiliate System
            </div>
            <h2 className="section-heading">
              Turn Your Word-of-Mouth into <span>5-Level Passive Income</span>
            </h2>
            <p className="section-subtext">
              Invite friends to shop on LG Enterprises. Whenever they purchase products — whether it's an LED TV, 
              furniture, or groceries — you and your upline earn cash commissions deposited directly into your digital wallet!
            </p>
          </div>

          {/* 5-Tier Visual Flow Breakdown Cards */}
          <div className="tiers-flow-grid">
            {referralTiers.map((tier, idx) => (
              <div key={idx} className="tier-flow-card" style={{ borderColor: tier.color }}>
                <div className="tier-level-badge" style={{ background: tier.color }}>
                  Level {tier.level}
                </div>
                <div className="tier-percent-tag" style={{ color: tier.color, background: tier.bg }}>
                  {tier.rate}%
                </div>
                <h4 className="tier-name">{tier.title}</h4>
                <p className="tier-desc">{tier.description}</p>
                <div className="tier-example-box" style={{ background: tier.bg }}>
                  <FaCoins style={{ color: tier.color, flexShrink: 0 }} />
                  <span>{tier.example}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Multi-Tier Scenario Step Explorer */}
          <div className="scenario-container">
            <div className="scenario-header">
              <div>
                <span className="scenario-tag">Real-World Flow Demonstration</span>
                <h3 className="scenario-title">How 5-Stage Referrals Work: User 1 through User 7</h3>
                <p className="scenario-subtitle">Click through each scenario stage to watch how commissions cascade up to 5 levels and stop at Level 6.</p>
              </div>
              <div className="step-switcher-pills">
                {scenarioSteps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`step-btn ${activeStep === step.id ? 'active' : ''}`}
                  >
                    Stage {step.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Stage Details Card */}
            {(() => {
              const currentStep = scenarioSteps.find((s) => s.id === activeStep) || scenarioSteps[0];
              return (
                <div className="scenario-active-card">
                  <div className="scenario-card-top">
                    <div>
                      <h4 className="active-stage-title">{currentStep.title}</h4>
                      <p className="active-stage-action">
                        🛒 <strong>{currentStep.buyer}</strong> purchases an order worth ₹10,000!
                      </p>
                    </div>
                    <div className="active-stage-pill">
                      {currentStep.note}
                    </div>
                  </div>

                  <div className="payout-table-wrapper">
                    <table className="payout-table">
                      <thead>
                        <tr>
                          <th>Recipient</th>
                          <th>Commission Level</th>
                          <th>Rate %</th>
                          <th>Wallet Payout (on ₹10,000 Order)</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentStep.payouts.map((p, idx) => (
                          <tr key={idx} className={p.amount.includes('₹0.00') ? 'row-capped' : 'row-awarded'}>
                            <td><strong>{p.user}</strong></td>
                            <td>{p.level}</td>
                            <td><span className="rate-badge">{p.percent}</span></td>
                            <td className="payout-val">{p.amount}</td>
                            <td>
                              {p.amount.includes('₹0.00') ? (
                                <span className="status-badge gray">Stage Exceeded (0%)</span>
                              ) : (
                                <span className="status-badge green">Credited to Wallet</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="scenario-footnote">
                    💡 <em>Notice: In Stage 6, when User 7 buys, User 6 gets 5%, User 5 gets 2.5%, User 4 gets 2%, User 3 gets 1.5%, User 2 gets 1%, and User 1 gets 0% because the 5-stage limit is reached!</em>
                  </div>
                </div>
              );
            })()}

          </div>

          {/* Interactive Live Earnings Calculator */}
          <div id="calculator" className="calculator-box">
            <div className="calculator-top">
              <div className="calc-header-icon">
                <FiDollarSign />
              </div>
              <div>
                <h3 className="calc-title">Interactive 5-Tier Commission Calculator</h3>
                <p className="calc-subtitle">Simulate your projected recurring wallet income by adjusting network size and average order values.</p>
              </div>
            </div>

            <div className="calc-grid">
              
              {/* Sliders Side */}
              <div className="calc-sliders-col">
                <div className="slider-group">
                  <div className="slider-header">
                    <span>Direct Friends You Invite (Level 1)</span>
                    <strong>{directInvites} People</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={directInvites}
                    onChange={(e) => setDirectInvites(Number(e.target.value))}
                    className="custom-range-slider"
                  />
                  <div className="slider-ticks"><span>1</span><span>25</span><span>50</span></div>
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <span>Average Friends Each Person Invites</span>
                    <strong>{subInvites} People</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={subInvites}
                    onChange={(e) => setSubInvites(Number(e.target.value))}
                    className="custom-range-slider"
                  />
                  <div className="slider-ticks"><span>1</span><span>5</span><span>10</span></div>
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <span>Average Monthly Spend per Customer</span>
                    <strong>₹{avgSpend.toLocaleString()}</strong>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="20000"
                    step="500"
                    value={avgSpend}
                    onChange={(e) => setAvgSpend(Number(e.target.value))}
                    className="custom-range-slider"
                  />
                  <div className="slider-ticks"><span>₹1,000</span><span>₹10,000</span><span>₹20,000</span></div>
                </div>

                <div className="calc-tip-box">
                  <FiZap style={{ color: '#4f46e5', flexShrink: 0 }} />
                  <p>Commissions accumulate on <strong>all repeat orders</strong> made by referred customers throughout their shopping lifetime!</p>
                </div>
              </div>

              {/* Output Results Side */}
              <div className="calc-results-col">
                <div className="results-card">
                  <span className="results-badge">Estimated Monthly Wallet Earnings</span>
                  <div className="results-total-amount">
                    ₹{totalCalculatedIncome.toLocaleString()}
                    <span className="month-sub">/ month</span>
                  </div>
                  <p className="results-network-size">
                    Supported by <strong>{totalNetworkShoppers.toLocaleString()}</strong> shoppers across your 5-level tree
                  </p>

                  <div className="tier-breakdown-list">
                    <div className="breakdown-row">
                      <span>Level 1 (5.0%) · {l1Count} shoppers</span>
                      <strong>₹{l1Income.toLocaleString()}</strong>
                    </div>
                    <div className="breakdown-row">
                      <span>Level 2 (2.5%) · {l2Count} shoppers</span>
                      <strong>₹{l2Income.toLocaleString()}</strong>
                    </div>
                    <div className="breakdown-row">
                      <span>Level 3 (2.0%) · {l3Count} shoppers</span>
                      <strong>₹{l3Income.toLocaleString()}</strong>
                    </div>
                    <div className="breakdown-row">
                      <span>Level 4 (1.5%) · {l4Count} shoppers</span>
                      <strong>₹{l4Income.toLocaleString()}</strong>
                    </div>
                    <div className="breakdown-row">
                      <span>Level 5 (1.0%) · {l5Count} shoppers</span>
                      <strong>₹{l5Income.toLocaleString()}</strong>
                    </div>
                  </div>

                  {user ? (
                    <Link to="/profile" className="btn-results-cta">
                      View My Referral Code in Profile <FiArrowRight />
                    </Link>
                  ) : (
                    <Link to="/register" className="btn-results-cta">
                      Sign Up & Get My Referral Code <FiArrowRight />
                    </Link>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Simple 3-Step Guide */}
          <div className="how-it-works-box">
            <h3 className="how-title">Start Earning in 3 Simple Steps</h3>
            <div className="how-steps-grid">
              <div className="how-step-card">
                <div className="how-step-num">1</div>
                <h4>Get Your Code</h4>
                <p>Register a free LG Enterprises account and find your unique referral code & link in your profile.</p>
              </div>
              <div className="how-step-card">
                <div className="how-step-num">2</div>
                <h4>Share With Friends</h4>
                <p>Share your link via WhatsApp, SMS, or Social Media. Friends automatically link under your referral code.</p>
              </div>
              <div className="how-step-card">
                <div className="how-step-num">3</div>
                <h4>Instant Wallet Commissions</h4>
                <p>Every time anyone in your 5 tiers shops, instant cash credits land in your wallet to pay for your own orders!</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Trust & Guarantees Section */}
      <section className="about-section-pad" style={{ background: '#ffffff' }}>
        <div className="about-container">
          <div className="text-center-heading">
            <div className="section-pill">Why Choose Us</div>
            <h2 className="section-heading">
              Built on 15+ Years of <span>Uncompromising Trust</span>
            </h2>
            <p className="section-subtext">The LG Enterprises standard that keeps thousands of families coming back.</p>
          </div>

          <div className="trust-grid">
            {[
              {
                icon: <FiShield />,
                title: "100% Genuine Products",
                desc: "Direct brand sourcing with authentic manufacturer warranties and brand authorization."
              },
              {
                icon: <FiTruck />,
                title: "Safe & Timely Delivery",
                desc: "Careful packaging and doorstep delivery across Bhimavaram and all major pin codes in India."
              },
              {
                icon: <FiRefreshCw />,
                title: "7-Day Easy Returns",
                desc: "Hassle-free return and replacement policy on all eligible electronics and home items."
              },
              {
                icon: <FiPhoneCall />,
                title: "24/7 Dedicated Support",
                desc: "Local, approachable customer support team ready to assist with orders, inquiries, and wholesale quotes."
              }
            ].map((t, i) => (
              <div key={i} className="trust-card">
                <div className="trust-icon-box">{t.icon}</div>
                <h4>{t.title}</h4>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Accordion */}
      <section className="about-section-pad" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div className="about-container" style={{ maxWidth: '900px' }}>
          <div className="text-center-heading">
            <div className="section-pill">Got Questions?</div>
            <h2 className="section-heading">
              Frequently Asked <span>Questions</span>
            </h2>
            <p className="section-subtext">Everything you need to know about our products and referral rewards.</p>
          </div>

          <div className="faq-accordion-wrap">
            {faqsList.map((faq, i) => (
              <div
                key={i}
                className={`faq-accordion-item ${openFaq === i ? 'open' : ''}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="faq-question-row">
                  <span className="faq-question-text">{faq.q}</span>
                  <span className="faq-chevron-icon">
                    {openFaq === i ? <FiChevronUp /> : <FiChevronDown />}
                  </span>
                </div>
                {openFaq === i && (
                  <div className="faq-answer-body">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner (Navbar Indigo Theme) */}
      <section className="about-cta-banner">
        <div className="about-container text-center">
          <h2>Ready to Experience LG Enterprises?</h2>
          <p>
            Shop electronics, furniture, clothing & groceries today, or start building your 5-tier passive income stream now!
          </p>
          <div className="cta-banner-buttons">
            <Link to="/" className="btn-cta-white">
              <FiShoppingBag /> Start Shopping Now
            </Link>
            {user ? (
              <Link to="/profile" className="btn-cta-trans">
                <FiGift /> Open My Referral Dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn-cta-trans">
                <FiGift /> Register & Earn Referral Rewards
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Custom Scoped CSS Styles for About Page Animations & Interactivity */}
      <style>{`
        .about-page-wrapper {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          overflow-x: hidden;
        }

        .about-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .about-section-pad {
          padding: 5rem 0;
        }

        /* Hero Section with Navbar Navy & Indigo Theme */
        .about-hero-section {
          position: relative;
          background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 60%, #c7d2fe 100%);
          color: #1e293b;
          padding: 6rem 0 5rem 0;
          overflow: hidden;
        }

        .hero-glow-1 {
          position: absolute;
          top: -100px;
          left: -100px;
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%);
          filter: blur(50px);
          pointer-events: none;
        }

        .hero-glow-2 {
          position: absolute;
          bottom: -150px;
          right: -100px;
          width: 550px;
          height: 550px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: #4f46e5;
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .hero-split-layout {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 3.5rem;
          align-items: center;
          margin-bottom: 3.5rem;
        }

        .hero-left-content {
          text-align: left;
        }

        .live-status-pulse {
          width: 9px;
          height: 9px;
          background: #10b981;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulseDot 2s infinite;
        }

        @keyframes pulseDot {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        .hero-main-title {
          font-size: clamp(2.1rem, 4vw, 3.2rem);
          font-weight: 800;
          letter-spacing: -0.5px;
          line-height: 1.15;
          margin-bottom: 1.2rem;
          text-align: left;
        }

        .gradient-text {
          background: linear-gradient(135deg, #4f46e5, #6366f1, #0284c7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .typewriter-box {
          font-size: clamp(1rem, 2vw, 1.25rem);
          font-weight: 600;
          color: #334155;
          min-height: 2.2rem;
          margin-bottom: 1.4rem;
        }

        .typewriter-label {
          color: #64748b;
          margin-right: 6px;
        }

        .typewriter-text {
          color: #0284c7;
          border-bottom: 2px solid rgba(2, 132, 199, 0.4);
        }

        .typewriter-cursor {
          animation: blink 0.9s infinite;
          color: #4f46e5;
          font-weight: 300;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .hero-subtitle {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #475569;
          max-width: 650px;
          margin: 0 0 2rem 0;
          text-align: left;
        }

        .hero-cta-group {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-start;
          gap: 0.9rem;
          margin-bottom: 2rem;
        }

        .btn-hero-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          padding: 0.85rem 1.6rem;
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-hero-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(79, 70, 229, 0.5);
        }

        .btn-hero-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: #4f46e5;
          padding: 0.85rem 1.6rem;
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s;
        }

        .btn-hero-secondary:hover {
          background: #f8fafc;
          transform: translateY(-2px);
        }

        .btn-hero-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid rgba(15, 23, 42, 0.2);
          color: #334155;
          padding: 0.85rem 1.4rem;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s, color 0.2s;
        }

        .btn-hero-outline:hover {
          background: rgba(15, 23, 42, 0.05);
          color: #0f172a;
        }

        .hero-trust-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
        }

        .trust-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(15, 23, 42, 0.1);
          border-radius: 999px;
          padding: 5px 13px;
          font-size: 0.82rem;
          color: #475569;
          backdrop-filter: blur(8px);
        }

        /* Right Column Showcase Card */
        .hero-right-showcase {
          width: 100%;
        }

        .hero-showcase-glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 1);
          border-radius: 24px;
          padding: 1.75rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .showcase-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .card-brand-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          color: #1e293b;
        }

        .brand-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6366f1;
        }

        .active-tier-pill {
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #4f46e5;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
        }

        .showcase-ticker-box {
          background: rgba(248, 250, 252, 0.8);
          border: 1px solid rgba(226, 232, 240, 1);
          border-radius: 14px;
          padding: 1rem;
          margin-bottom: 1.2rem;
        }

        .ticker-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .ticker-tag {
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .ticker-rate {
          color: #0284c7;
          font-weight: 700;
        }

        .ticker-event {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ticker-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(245, 158, 11, 0.15);
          color: #d97706;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .ticker-event strong {
          display: block;
          font-size: 0.98rem;
          color: #0f172a;
        }

        .ticker-event p {
          margin: 0;
          font-size: 0.8rem;
          color: #475569;
          line-height: 1.3;
        }

        .showcase-categories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.2rem;
        }

        .category-mini-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(248, 250, 252, 0.8);
          border: 1px solid rgba(226, 232, 240, 1);
          border-radius: 12px;
          padding: 0.6rem 0.8rem;
          transition: background 0.2s, transform 0.2s;
        }

        .category-mini-pill:hover {
          background: rgba(241, 245, 249, 1);
          transform: translateY(-2px);
        }

        .mini-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .mini-icon.tv {
          background: rgba(79, 70, 229, 0.15);
          color: #4f46e5;
        }

        .mini-icon.couch {
          background: rgba(245, 158, 11, 0.15);
          color: #d97706;
        }

        .mini-icon.grocery {
          background: rgba(16, 185, 129, 0.15);
          color: #059669;
        }

        .mini-icon.shirt {
          background: rgba(236, 72, 153, 0.15);
          color: #db2777;
        }

        .category-mini-pill strong {
          display: block;
          font-size: 0.85rem;
          color: #1e293b;
        }

        .category-mini-pill span {
          font-size: 0.72rem;
          color: #64748b;
        }

        .showcase-matrix-strip {
          background: rgba(248, 250, 252, 0.8);
          border-radius: 12px;
          padding: 0.9rem;
          margin-bottom: 1rem;
          border: 1px solid rgba(226, 232, 240, 1);
        }

        .matrix-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 0.6rem;
          letter-spacing: 0.5px;
        }

        .matrix-bars-row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
          text-align: center;
        }

        .matrix-bar-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .m-lvl {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
        }

        .m-bar {
          width: 100%;
          border-radius: 4px;
          background: rgba(15, 23, 42, 0.05);
        }

        .h-100 {
          height: 36px;
          background: linear-gradient(180deg, #6366f1, #4f46e5);
        }

        .h-75 {
          height: 28px;
          background: linear-gradient(180deg, #818cf8, #6366f1);
        }

        .h-60 {
          height: 22px;
          background: linear-gradient(180deg, #38bdf8, #0284c7);
        }

        .h-45 {
          height: 16px;
          background: linear-gradient(180deg, #34d399, #059669);
        }

        .h-30 {
          height: 12px;
          background: linear-gradient(180deg, #fbbf24, #d97706);
        }

        .m-pct {
          font-size: 0.7rem;
          font-weight: 800;
          color: #334155;
        }

        .showcase-card-footer {
          font-size: 0.75rem;
          color: #64748b;
          text-align: center;
          border-top: 1px solid rgba(15, 23, 42, 0.1);
          padding-top: 0.7rem;
        }

        /* Bottom Hero Stats Ribbon */
        .hero-stats-ribbon {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.2rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(226, 232, 240, 1);
          border-radius: 20px;
          padding: 1.4rem 1.8rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        .ribbon-stat-item {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ribbon-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(79, 70, 229, 0.1);
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          flex-shrink: 0;
        }

        .ribbon-number {
          font-size: 1.4rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
        }

        .ribbon-label {
          font-size: 0.82rem;
          color: #475569;
          margin-top: 2px;
        }

        /* Headings & Pills */
        .section-pill {
          display: inline-block;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #4f46e5;
          background: #e0e7ff;
          padding: 4px 12px;
          border-radius: 999px;
          margin-bottom: 0.8rem;
        }

        .section-heading {
          font-size: 2.3rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.25;
          margin-bottom: 1rem;
        }

        .section-heading span {
          color: #4f46e5;
        }

        .section-subtext {
          font-size: 1.05rem;
          color: #64748b;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .text-center-heading {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        /* Story Grid */
        .story-split-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 3.5rem;
          align-items: center;
        }

        .story-paragraph {
          font-size: 1.05rem;
          line-height: 1.8;
          color: #475569;
          margin-bottom: 1.2rem;
        }

        .story-features-list {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          margin-top: 2rem;
        }

        .story-feature-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .check-icon {
          color: #10b981;
          font-size: 1.4rem;
          flex-shrink: 0;
          margin-top: 3px;
        }

        .story-feature-item strong {
          display: block;
          font-size: 1.05rem;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .story-feature-item p {
          margin: 0;
          font-size: 0.9rem;
          color: #64748b;
        }

        /* Story Store Card */
        .story-card-stack {
          position: relative;
          background: white;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
          border: 1px solid #f1f5f9;
        }

        .stack-badge.top-right {
          position: absolute;
          top: -14px;
          right: 24px;
          background: #10b981;
          color: white;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .store-icon-circle {
          width: 60px;
          height: 60px;
          border-radius: 18px;
          background: #eef2ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          margin-bottom: 1.2rem;
        }

        .store-info-box h3 {
          font-size: 1.4rem;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .store-info-box p {
          font-size: 0.95rem;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        .store-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          background: #f8fafc;
          padding: 1rem;
          border-radius: 14px;
          margin-bottom: 1.5rem;
        }

        .store-meta-grid span {
          display: block;
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
        }

        .store-meta-grid strong {
          font-size: 0.9rem;
          color: #1e293b;
        }

        .store-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #4f46e5;
          font-weight: 700;
          text-decoration: none;
          font-size: 0.95rem;
        }

        /* Categories Grid */
        .categories-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.8rem;
        }

        .category-showcase-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .category-showcase-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
        }

        .cat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.2rem;
        }

        .cat-icon-avatar {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
        }

        .cat-badge-pill {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
        }

        .cat-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.6rem;
        }

        .cat-desc {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }

        .cat-action-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
        }

        /* Referral Masterpiece Section */
        .referral-showcase-section {
          background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%);
          border-top: 1px solid #e0e7ff;
          border-bottom: 1px solid #e0e7ff;
        }

        .tiers-flow-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 1.2rem;
          margin-bottom: 3.5rem;
        }

        .tier-flow-card {
          background: white;
          border-radius: 20px;
          padding: 1.6rem;
          border-top: 4px solid;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
          position: relative;
        }

        .tier-level-badge {
          display: inline-block;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 8px;
          margin-bottom: 0.8rem;
        }

        .tier-percent-tag {
          font-size: 1.8rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 10px;
          display: inline-block;
          margin-bottom: 0.6rem;
        }

        .tier-name {
          font-size: 1.1rem;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .tier-desc {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .tier-example-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #334155;
          line-height: 1.35;
        }

        /* Scenario Box */
        .scenario-container {
          background: white;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
          margin-bottom: 3.5rem;
        }

        .scenario-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 1.5rem;
        }

        .scenario-tag {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #4f46e5;
          font-weight: 700;
        }

        .scenario-title {
          font-size: 1.5rem;
          color: #0f172a;
          margin: 4px 0 6px 0;
        }

        .scenario-subtitle {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0;
        }

        .step-switcher-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .step-btn {
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          padding: 6px 14px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .step-btn.active {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .scenario-active-card {
          background: #f8fafc;
          border-radius: 18px;
          padding: 1.8rem;
          border: 1px solid #e2e8f0;
        }

        .scenario-card-top {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .active-stage-title {
          font-size: 1.25rem;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .active-stage-action {
          font-size: 0.95rem;
          color: #334155;
          margin: 0;
        }

        .active-stage-pill {
          background: #e0e7ff;
          color: #3730a3;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 999px;
        }

        .payout-table-wrapper {
          overflow-x: auto;
          margin-bottom: 1rem;
        }

        .payout-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          text-align: left;
        }

        .payout-table th {
          background: white;
          padding: 12px 16px;
          color: #64748b;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          border-bottom: 2px solid #e2e8f0;
        }

        .payout-table td {
          padding: 12px 16px;
          background: white;
          border-bottom: 1px solid #f1f5f9;
        }

        .row-capped td {
          background: #f8fafc !important;
          color: #94a3b8;
        }

        .rate-badge {
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 700;
        }

        .payout-val {
          font-weight: 800;
          color: #10b981;
        }

        .row-capped .payout-val {
          color: #94a3b8;
        }

        .status-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .status-badge.green {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.gray {
          background: #f1f5f9;
          color: #64748b;
        }

        .scenario-footnote {
          font-size: 0.85rem;
          color: #64748b;
          margin-top: 1rem;
        }

        /* Calculator Box */
        .calculator-box {
          background: white;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
          margin-bottom: 3.5rem;
        }

        .calculator-top {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          margin-bottom: 2rem;
        }

        .calc-header-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: #e0e7ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
        }

        .calc-title {
          font-size: 1.5rem;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .calc-subtitle {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0;
        }

        .calc-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 2.5rem;
        }

        .slider-group {
          margin-bottom: 1.6rem;
        }

        .slider-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.6rem;
        }

        .custom-range-slider {
          width: 100%;
          height: 8px;
          border-radius: 5px;
          background: #e2e8f0;
          outline: none;
          accent-color: #4f46e5;
          cursor: pointer;
        }

        .slider-ticks {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 4px;
        }

        .calc-tip-box {
          display: flex;
          gap: 10px;
          align-items: center;
          background: #eef2ff;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.85rem;
          color: #3730a3;
        }

        .results-card {
          background: linear-gradient(135deg, #0f172a, #1e1b4b);
          color: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.2);
        }

        .results-badge {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #a5b4fc;
          font-weight: 700;
        }

        .results-total-amount {
          font-size: 2.6rem;
          font-weight: 800;
          color: #38bdf8;
          margin: 8px 0;
        }

        .month-sub {
          font-size: 1rem;
          font-weight: 500;
          color: #cbd5e1;
        }

        .results-network-size {
          font-size: 0.85rem;
          color: #94a3b8;
          margin-bottom: 1.5rem;
        }

        .tier-breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1.2rem;
          margin-bottom: 1.5rem;
        }

        .breakdown-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #cbd5e1;
        }

        .breakdown-row strong {
          color: white;
        }

        .btn-results-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          text-decoration: none;
          padding: 0.85rem 1.2rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.35);
        }

        .btn-results-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(79, 70, 229, 0.45);
        }

        /* How it works */
        .how-it-works-box {
          background: white;
          border-radius: 24px;
          padding: 2.5rem;
          border: 1px solid #f1f5f9;
        }

        .how-title {
          font-size: 1.4rem;
          color: #0f172a;
          margin-bottom: 1.8rem;
          text-align: center;
        }

        .how-steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 2rem;
        }

        .how-step-card {
          text-align: center;
        }

        .how-step-num {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #4f46e5;
          color: white;
          font-size: 1.3rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem auto;
          box-shadow: 0 6px 15px rgba(79, 70, 229, 0.3);
        }

        .how-step-card h4 {
          font-size: 1.1rem;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .how-step-card p {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        /* Trust Grid */
        .trust-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 2rem;
        }

        .trust-card {
          background: #f8fafc;
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid #e2e8f0;
          text-align: center;
          transition: transform 0.2s;
        }

        .trust-card:hover {
          transform: translateY(-4px);
        }

        .trust-icon-box {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 1.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.2rem auto;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.08);
        }

        .trust-card h4 {
          font-size: 1.15rem;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .trust-card p {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        /* FAQ Accordion */
        .faq-accordion-wrap {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .faq-accordion-item {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .faq-accordion-item:hover {
          border-color: #cbd5e1;
        }

        .faq-accordion-item.open {
          border-color: #a5b4fc;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.08);
        }

        .faq-question-row {
          padding: 1.3rem 1.6rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          color: #0f172a;
          font-size: 1rem;
        }

        .faq-chevron-icon {
          color: #4f46e5;
          font-size: 1.2rem;
        }

        .faq-answer-body {
          padding: 0 1.6rem 1.3rem 1.6rem;
          font-size: 0.92rem;
          color: #475569;
          line-height: 1.6;
        }

        /* Bottom CTA Banner (Indigo Navbar Style) */
        .about-cta-banner {
          background: linear-gradient(135deg, #3730a3 0%, #4f46e5 100%);
          color: white;
          padding: 5rem 0;
          text-align: center;
        }

        .about-cta-banner h2 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .about-cta-banner p {
          font-size: 1.15rem;
          color: #e0e7ff;
          max-width: 650px;
          margin: 0 auto 2rem auto;
          line-height: 1.6;
        }

        .cta-banner-buttons {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
        }

        .btn-cta-white {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          color: #4f46e5;
          padding: 0.9rem 2rem;
          border-radius: 12px;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s;
        }

        .btn-cta-white:hover {
          transform: translateY(-2px);
        }

        .btn-cta-trans {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.9rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.2s;
        }

        .btn-cta-trans:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease forwards;
        }

        /* Comprehensive Responsive Breakpoints for All Devices */
        @media (max-width: 992px) {
          .hero-split-layout {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .hero-left-content {
            text-align: center;
          }
          .hero-main-title {
            text-align: center;
          }
          .hero-subtitle {
            margin: 0 auto 2rem auto;
            text-align: center;
          }
          .hero-cta-group {
            justify-content: center;
          }
          .hero-trust-row {
            justify-content: center;
          }
          .hero-stats-ribbon {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.2rem;
          }
          .story-split-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .calc-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .section-heading {
            font-size: 2rem;
          }
        }

        @media (max-width: 768px) {
          .about-section-pad {
            padding: 3.5rem 0;
          }
          .section-heading {
            font-size: 1.75rem;
          }
          .tiers-flow-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          .categories-card-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .about-hero-section {
            padding: 3.5rem 0 2.5rem 0;
          }
          .hero-badge {
            font-size: 0.75rem;
            padding: 5px 12px;
            margin-bottom: 1rem;
            white-space: normal;
            text-align: left;
          }
          .hero-main-title {
            font-size: 1.85rem;
          }
          .typewriter-box {
            font-size: 1rem;
            min-height: 2.5rem;
          }
          .hero-subtitle {
            font-size: 0.95rem;
          }
          .hero-cta-group {
            flex-direction: column;
            gap: 0.75rem;
          }
          .btn-hero-primary,
          .btn-hero-secondary,
          .btn-hero-outline {
            width: 100%;
            justify-content: center;
            padding: 0.8rem 1.2rem;
            font-size: 0.95rem;
          }
          .hero-trust-row {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }
          .trust-pill {
            justify-content: center;
          }
          .hero-showcase-glass-card {
            padding: 1.2rem;
          }
          .showcase-categories-grid {
            grid-template-columns: 1fr;
          }
          .hero-stats-ribbon {
            grid-template-columns: 1fr;
            padding: 1rem;
            gap: 0.9rem;
          }
          .ribbon-stat-item {
            gap: 10px;
          }
          .ribbon-number {
            font-size: 1.25rem;
          }
          .ribbon-label {
            font-size: 0.78rem;
          }
          .scenario-container,
          .calculator-box,
          .how-it-works-box {
            padding: 1.2rem;
          }
          .payout-table-wrap {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .payout-table th, .payout-table td {
            padding: 8px 10px;
            font-size: 0.8rem;
          }
          .results-total-amount {
            font-size: 1.85rem;
          }
          .tiers-flow-grid {
            grid-template-columns: 1fr;
          }
          .about-container {
            padding: 0 1rem;
          }
          .about-cta-banner h2 {
            font-size: 1.85rem;
          }
          .cta-banner-buttons {
            flex-direction: column;
          }
          .btn-cta-white, .btn-cta-trans {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

    </div>
  );
};

export default About;
