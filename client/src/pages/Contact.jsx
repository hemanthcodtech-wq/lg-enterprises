import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiCheckCircle,
  FiMessageCircle, FiPackage, FiGift, FiShield, FiHelpCircle,
  FiChevronDown, FiChevronUp, FiArrowRight, FiZap, FiTruck, FiRefreshCw
} from 'react-icons/fi';
import {
  FaWhatsapp, FaStore, FaHandshakeAngle, FaBoxesStacked, FaCoins
} from 'react-icons/fa6';

// Typewriter phrases for Contact page
const typewriterPhrases = [
  "We're Here to Help You 24/7",
  "Electronics · Furniture · Groceries · Wholesale Inquiries",
  "Order Tracking · 7-Day Returns · Warranty Assistance",
  "5-Tier Referral Rewards & Wallet Questions",
  "Visit Our Bhimavaram Flagship Supercenter"
];

// Department support channels
const departments = [
  {
    icon: <FiPackage />,
    title: "Orders & Delivery Support",
    email: "orders@lgenterprises.com",
    desc: "Tracking live shipments, dispatch timelines, and doorstep courier status.",
    badge: "Fast Dispatch"
  },
  {
    icon: <FaHandshakeAngle />,
    title: "Wholesale & Bulk Orders",
    email: "wholesale@lgenterprises.com",
    desc: "B2B institutional discounts, hotels, interior contractors, and commercial supply.",
    badge: "Volume Pricing"
  },
  {
    icon: <FiGift />,
    title: "5-Tier Referral & Wallet Help",
    email: "referrals@lgenterprises.com",
    desc: "Assistance with your unique referral code, invite links, and commission wallet credits.",
    badge: "Instant Credit"
  },
  {
    icon: <FiShield />,
    title: "Warranty & After-Sales",
    email: "support@lgenterprises.com",
    desc: "Manufacturer warranties, on-site installation, and 7-day hassle-free returns.",
    badge: "Brand Certified"
  }
];

// Contact FAQs
const contactFaqs = [
  {
    q: "Where is LG Enterprises physically located?",
    a: "Our flagship showroom is situated at LG Complex, Main Road, Bhimavaram, Andhra Pradesh - 534201. Customers are always welcome for in-person product demos and furniture inspections!"
  },
  {
    q: "How fast do you respond to online inquiries?",
    a: "Our customer service desk responds to all messages and emails within 2 to 4 business hours. For immediate assistance during store hours, our WhatsApp helpline is open."
  },
  {
    q: "How does the 5-Tier Referral System work if I have questions?",
    a: "Every registered user gets an automatic 8-character referral code and shareable link in their profile. Whenever referred shoppers place orders, you earn 5% (L1), 2.5% (L2), 2% (L3), 1.5% (L4), and 1% (L5) credited instantly to your wallet."
  },
  {
    q: "Can I request wholesale quotes for commercial or bulk furniture?",
    a: "Yes! Use the form on this page and select 'Wholesale & Bulk Pricing' as the topic, or reach out to our dedicated wholesale team at wholesale@lgenterprises.com."
  },
  {
    q: "What are your delivery timelines across India?",
    a: "Local orders in Bhimavaram and nearby districts arrive within 24 to 48 hours. Orders across Andhra Pradesh and metro cities arrive within 2–4 business days with live tracking."
  }
];

const Contact = () => {
  // Typewriter effect state
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(70);

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // FAQ state
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

  // Department quick select handler
  const handleDepartmentSelect = (subjectValue) => {
    setForm(prev => ({ ...prev, subject: subjectValue }));
    const formElement = document.getElementById('contact-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="contact-page-wrapper" style={{ background: '#f8fafc', color: '#1e293b' }}>

      {/* Dynamic 2-Column Command-Center Hero Section (Indigo & Navy Navbar Theme) */}
      <section className="contact-hero-section">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        <div className="contact-container" style={{ position: 'relative', zIndex: 2 }}>
          
          <div className="contact-hero-split">
            
            {/* Left Content Column */}
            <div className="contact-hero-left animate-slide-up">
              
              <div className="contact-hero-badge">
                <span className="live-status-pulse"></span>
                <span>Customer Care Desk Online • Immediate Response</span>
              </div>

              <h1 className="contact-hero-title">
                Direct Help & Support, <br />
                <span className="gradient-text">When You Need It.</span>
              </h1>

              {/* Dynamic Typewriter Terminal Bar */}
              <div className="typewriter-box">
                <span className="typewriter-label">Assisting with: </span>
                <span className="typewriter-text">{currentText}</span>
                <span className="typewriter-cursor">|</span>
              </div>

              <p className="contact-hero-subtitle">
                Have questions about ongoing deliveries, warranty claims, bulk wholesale quotes, 
                or your <strong>5-tier referral wallet earnings</strong>? Connect directly with our Bhimavaram support desk 
                via WhatsApp, phone, or send an inquiry below for guaranteed fast turnaround.
              </p>

              {/* Direct Action Buttons */}
              <div className="contact-hero-actions">
                <a 
                  href="https://wa.me/919876543210" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-contact-whatsapp"
                >
                  <FaWhatsapp className="btn-icon" /> Chat on WhatsApp
                </a>
                <a href="tel:+919876543210" className="btn-contact-call">
                  <FiPhone className="btn-icon" /> Call +91 98765 43210
                </a>
                <a href="#contact-form" className="btn-contact-form-jump">
                  <FiSend className="btn-icon" /> Send Message
                </a>
              </div>

              {/* Trust & SLA Signals */}
              <div className="contact-trust-pills">
                <div className="trust-pill-item">
                  <span className="pill-dot green"></span>
                  <strong>&lt; 15 Mins</strong> WhatsApp SLA
                </div>
                <div className="trust-pill-item">
                  <span className="pill-dot blue"></span>
                  <strong>Mon - Sat</strong> 9:00 AM - 8:30 PM
                </div>
                <div className="trust-pill-item">
                  <span className="pill-dot purple"></span>
                  <strong>100% Genuine</strong> Brand Warranties
                </div>
              </div>

            </div>

            {/* Right Interactive Department Launcher Card */}
            <div className="contact-hero-right animate-fade-in">
              <div className="contact-launcher-card">
                
                <div className="launcher-header">
                  <div>
                    <span className="launcher-tag">⚡ Fast-Track Dispatcher</span>
                    <h3 className="launcher-title">Select Department to Inquire</h3>
                  </div>
                  <span className="launcher-badge">Instant Form Sync</span>
                </div>

                <p className="launcher-subtext">
                  Click any department below to automatically pre-fill your message topic and jump straight to the inquiry form:
                </p>

                <div className="launcher-grid">
                  <button 
                    type="button" 
                    onClick={() => handleDepartmentSelect("Order Inquiry")}
                    className={`launcher-item-btn ${form.subject === 'Order Inquiry' ? 'selected' : ''}`}
                  >
                    <div className="launcher-btn-icon order"><FiPackage /></div>
                    <div className="launcher-btn-text">
                      <strong>Orders & Delivery</strong>
                      <span>Track shipment & dispatch</span>
                    </div>
                    <FiArrowRight className="launcher-arrow" />
                  </button>

                  <button 
                    type="button" 
                    onClick={() => handleDepartmentSelect("Wholesale & Bulk Pricing")}
                    className={`launcher-item-btn ${form.subject === 'Wholesale & Bulk Pricing' ? 'selected' : ''}`}
                  >
                    <div className="launcher-btn-icon wholesale"><FaHandshakeAngle /></div>
                    <div className="launcher-btn-text">
                      <strong>Wholesale & Bulk B2B</strong>
                      <span>Institutional quotes & discounts</span>
                    </div>
                    <FiArrowRight className="launcher-arrow" />
                  </button>

                  <button 
                    type="button" 
                    onClick={() => handleDepartmentSelect("5-Tier Referral System")}
                    className={`launcher-item-btn ${form.subject === '5-Tier Referral System' ? 'selected' : ''}`}
                  >
                    <div className="launcher-btn-icon referral"><FiGift /></div>
                    <div className="launcher-btn-text">
                      <strong>5-Tier Referral Wallet</strong>
                      <span>Code, downline & commissions</span>
                    </div>
                    <FiArrowRight className="launcher-arrow" />
                  </button>

                  <button 
                    type="button" 
                    onClick={() => handleDepartmentSelect("Returns & Warranty")}
                    className={`launcher-item-btn ${form.subject === 'Returns & Warranty' ? 'selected' : ''}`}
                  >
                    <div className="launcher-btn-icon warranty"><FiShield /></div>
                    <div className="launcher-btn-text">
                      <strong>Warranty & Returns</strong>
                      <span>7-Day returns & brand service</span>
                    </div>
                    <FiArrowRight className="launcher-arrow" />
                  </button>
                </div>

                {/* Physical Store Mini Banner */}
                <div className="launcher-store-banner">
                  <div className="store-banner-pin"><FiMapPin /></div>
                  <div className="store-banner-details">
                    <strong>Bhimavaram Flagship Showroom</strong>
                    <p>LG Complex, Main Road, Bhimavaram, AP – 534201</p>
                  </div>
                  <a href="#store-map" className="store-banner-link">View Details</a>
                </div>

              </div>
            </div>

          </div>

          {/* Full-Width Support Metric Ribbon */}
          <div className="contact-stats-ribbon">
            {[
              { value: "< 2 Hours", label: "Average Response Time", icon: <FiClock /> },
              { value: "Mon - Sat", label: "9:00 AM - 8:30 PM Showroom", icon: <FaStore /> },
              { value: "10,000+", label: "Products Under Warranty", icon: <FiPackage /> },
              { value: "5 Tiers", label: "Referral Program Support", icon: <FiGift /> }
            ].map((stat, i) => (
              <div key={i} className="contact-ribbon-item">
                <div className="contact-ribbon-icon">{stat.icon}</div>
                <div>
                  <div className="contact-ribbon-value">{stat.value}</div>
                  <div className="contact-ribbon-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Main Contact Grid: Info Cards + Form */}
      <section className="contact-section-pad">
        <div className="contact-container">
          
          <div className="contact-main-grid">
            
            {/* Left Column: Direct Info Cards */}
            <div className="contact-info-col">
              <div className="section-pill">Direct Channels</div>
              <h2 className="section-heading">
                We're Always <span>Ready to Connect</span>
              </h2>
              <p className="story-paragraph">
                Reach out to us via any of our official channels or step right into our Bhimavaram retail megastore.
              </p>

              <div className="info-cards-stack" id="store-map">
                
                {/* Store Address Card */}
                <div className="info-item-card">
                  <div className="info-icon-box">
                    <FiMapPin />
                  </div>
                  <div>
                    <h4>Physical Showroom Address</h4>
                    <p>LG Complex, Main Road, Bhimavaram, Andhra Pradesh – 534201</p>
                    <span className="info-subtext">Walk-in demos for electronics, appliances & furniture</span>
                  </div>
                </div>

                {/* Phone & WhatsApp */}
                <div className="info-item-card">
                  <div className="info-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                    <FaWhatsapp />
                  </div>
                  <div>
                    <h4>Phone & WhatsApp Helpline</h4>
                    <p>+91 98765 43210 / +91 98765 43211</p>
                    <span className="info-subtext">Available Mon – Sat: 9:00 AM – 8:30 PM (IST)</span>
                  </div>
                </div>

                {/* Email Support */}
                <div className="info-item-card">
                  <div className="info-icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                    <FiMail />
                  </div>
                  <div>
                    <h4>Official Email Inboxes</h4>
                    <p>support@lgenterprises.com</p>
                    <span className="info-subtext">24/7 ticket logging with guaranteed fast turnaround</span>
                  </div>
                </div>

                {/* Store Timings */}
                <div className="info-item-card">
                  <div className="info-icon-box" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                    <FiClock />
                  </div>
                  <div>
                    <h4>Business Operating Hours</h4>
                    <p>Monday – Saturday: 9:00 AM – 8:30 PM</p>
                    <span className="info-subtext">Sunday: 10:00 AM – 6:00 PM</span>
                  </div>
                </div>

              </div>

              {/* Quick Referral Banner in Contact */}
              <div className="contact-referral-callout">
                <div className="callout-icon">
                  <FiGift />
                </div>
                <div>
                  <h5>Have questions about the 5-Tier Referral Plan?</h5>
                  <p>Earn up to 5% cash commissions on every order placed by your network!</p>
                  <Link to="/about#referral-system" className="callout-link">
                    View 5-Tier Referral Guide <FiArrowRight />
                  </Link>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Send Message Form */}
            <div className="contact-form-col">
              <div className="contact-form-wrapper" id="contact-form">
                
                {submitted ? (
                  <div className="form-success-card">
                    <div className="success-icon-circle">
                      <FiCheckCircle />
                    </div>
                    <h3>Message Successfully Sent!</h3>
                    <p>
                      Thank you for contacting <strong>LG Enterprises</strong>. A customer support representative has received your ticket and will follow up shortly at <strong>{form.email}</strong>.
                    </p>
                    <div className="success-details-pill">
                      <span>Topic: <strong>{form.subject}</strong></span>
                    </div>
                    <button 
                      onClick={() => {
                        setSubmitted(false);
                        setForm({ name: '', email: '', phone: '', subject: 'Order Inquiry', message: '' });
                      }}
                      className="btn-send-another"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="form-top-title">
                      <h3>Send Us a Direct Message</h3>
                      <p>Fill out the form below and our team will get back to you promptly.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="styled-contact-form">
                      
                      <div className="form-row-2">
                        <div className="form-field-group">
                          <label>Full Name *</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Ramesh Varma" 
                            required 
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                          />
                        </div>

                        <div className="form-field-group">
                          <label>Phone / WhatsApp Number</label>
                          <input 
                            type="tel" 
                            placeholder="+91 98765 43210" 
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-field-group">
                        <label>Email Address *</label>
                        <input 
                          type="email" 
                          placeholder="you@example.com" 
                          required 
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </div>

                      <div className="form-field-group">
                        <label>Inquiry Subject / Category *</label>
                        <select 
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          required
                        >
                          <option value="Order Inquiry">📦 Order Status & Delivery Tracking</option>
                          <option value="Wholesale & Bulk Pricing">🏢 Wholesale & Institutional Bulk Supply</option>
                          <option value="5-Tier Referral System">🎁 5-Tier Referral Code & Wallet Earnings</option>
                          <option value="Product Specification">📺 Product Details, Electronics & Furniture</option>
                          <option value="Returns & Warranty">🛡️ 7-Day Returns & Brand Warranty</option>
                          <option value="Store Visit">🏪 Bhimavaram Physical Store Inquiries</option>
                          <option value="Other Query">💬 Other Inquiries</option>
                        </select>
                      </div>

                      <div className="form-field-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label>Your Detailed Message *</label>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {form.message.length} chars
                          </span>
                        </div>
                        <textarea 
                          rows="5"
                          placeholder="Please provide order ID or describe your requirements in detail..."
                          required
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                        ></textarea>
                      </div>

                      <button 
                        type="submit" 
                        disabled={submitting}
                        className="btn-submit-message"
                      >
                        {submitting ? (
                          <span>Sending Message...</span>
                        ) : (
                          <>
                            <FiSend /> Send Message to LG Enterprises
                          </>
                        )}
                      </button>

                      <div className="form-privacy-note">
                        🔒 Your personal details are protected and never shared with third parties.
                      </div>

                    </form>
                  </>
                )}

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Dedicated Department Cards */}
      <section className="contact-section-pad" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="contact-container">
          <div className="text-center-heading">
            <div className="section-pill">Department Routing</div>
            <h2 className="section-heading">
              Specialized Assistance for <span>Every Need</span>
            </h2>
            <p className="section-subtext">
              Direct your questions to the right specialist for accelerated resolutions.
            </p>
          </div>

          <div className="departments-grid">
            {departments.map((dept, i) => (
              <div key={i} className="department-card">
                <div className="dept-header">
                  <div className="dept-icon-circle">{dept.icon}</div>
                  <span className="dept-badge">{dept.badge}</span>
                </div>
                <h4>{dept.title}</h4>
                <p>{dept.desc}</p>
                <div className="dept-email-link">
                  <FiMail /> <strong>{dept.email}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="contact-section-pad" style={{ background: '#f8fafc' }}>
        <div className="contact-container" style={{ maxWidth: '900px' }}>
          <div className="text-center-heading">
            <div className="section-pill">Quick Answers</div>
            <h2 className="section-heading">
              Frequently Asked <span>Questions</span>
            </h2>
            <p className="section-subtext">Answers to the most common questions our support team receives.</p>
          </div>

          <div className="faq-accordion-wrap">
            {contactFaqs.map((faq, i) => (
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

      {/* Bottom CTA Banner (Indigo Navbar Style) */}
      <section className="contact-cta-banner">
        <div className="contact-container text-center">
          <h2>Looking to Start Shopping or Earn Referral Cash?</h2>
          <p>
            Explore 10,000+ products across electronics, furniture, groceries and clothing, or join our 5-tier affiliate network today!
          </p>
          <div className="cta-banner-buttons">
            <Link to="/" className="btn-cta-white">
              <FiPackage /> Explore Product Megastore
            </Link>
            <Link to="/about#referral-system" className="btn-cta-trans">
              <FiGift /> Learn 5-Tier Referral Plan
            </Link>
          </div>
        </div>
      </section>

      {/* Scoped CSS Styles for Contact Page */}
      <style>{`
        .contact-page-wrapper {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          overflow-x: hidden;
        }

        .contact-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .contact-section-pad {
          padding: 5rem 0;
        }

        /* Hero Section */
        .contact-hero-section {
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

        .contact-hero-split {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 3.5rem;
          align-items: center;
          margin-bottom: 3.5rem;
        }

        .contact-hero-left {
          text-align: left;
        }

        .contact-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: #4f46e5;
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1.4rem;
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

        .contact-hero-title {
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
          margin-bottom: 1.3rem;
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

        .contact-hero-subtitle {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #475569;
          max-width: 650px;
          margin: 0 0 2rem 0;
          text-align: left;
        }

        .contact-hero-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-start;
          gap: 0.9rem;
          margin-bottom: 2rem;
        }

        .btn-contact-whatsapp {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #25D366, #128C7E);
          color: white;
          padding: 0.85rem 1.6rem;
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 10px 25px rgba(37, 211, 102, 0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-contact-whatsapp:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(37, 211, 102, 0.45);
        }

        .btn-contact-call {
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
          transition: transform 0.2s;
        }

        .btn-contact-call:hover {
          transform: translateY(-2px);
        }

        .btn-contact-form-jump {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: #4f46e5;
          padding: 0.85rem 1.4rem;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s;
        }

        .btn-contact-form-jump:hover {
          background: #f8fafc;
        }

        .contact-trust-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
        }

        .trust-pill-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(15, 23, 42, 0.1);
          border-radius: 999px;
          padding: 5px 14px;
          font-size: 0.82rem;
          color: #475569;
          backdrop-filter: blur(8px);
        }

        .pill-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .pill-dot.green {
          background: #10b981;
        }

        .pill-dot.blue {
          background: #38bdf8;
        }

        .pill-dot.purple {
          background: #a855f7;
        }

        /* Right Column Launcher Card */
        .contact-hero-right {
          width: 100%;
        }

        .contact-launcher-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 1);
          border-radius: 24px;
          padding: 1.75rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .launcher-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.6rem;
        }

        .launcher-tag {
          font-size: 0.75rem;
          font-weight: 700;
          color: #818cf8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
        }

        .launcher-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          margin: 4px 0 0 0;
        }

        .launcher-badge {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #4f46e5;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 9px;
          border-radius: 999px;
          white-space: nowrap;
        }

        .launcher-subtext {
          font-size: 0.84rem;
          color: #475569;
          margin-bottom: 1.1rem;
          line-height: 1.5;
        }

        .launcher-grid {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          margin-bottom: 1.2rem;
        }

        .launcher-item-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          text-align: left;
          background: rgba(248, 250, 252, 0.8);
          border: 1px solid rgba(226, 232, 240, 1);
          border-radius: 14px;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          color: inherit;
        }

        .launcher-item-btn:hover {
          background: rgba(241, 245, 249, 1);
          border-color: #cbd5e1;
          transform: translateX(3px);
        }

        .launcher-item-btn.selected {
          background: rgba(224, 231, 255, 0.6);
          border-color: #6366f1;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.15);
        }

        .launcher-btn-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          flex-shrink: 0;
        }

        .launcher-btn-icon.order {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        .launcher-btn-icon.wholesale {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
        }

        .launcher-btn-icon.referral {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
        }

        .launcher-btn-icon.warranty {
          background: rgba(236, 72, 153, 0.2);
          color: #f472b6;
        }

        .launcher-btn-text {
          flex-grow: 1;
        }

        .launcher-btn-text strong {
          display: block;
          font-size: 0.92rem;
          color: #0f172a;
        }

        .launcher-btn-text span {
          display: block;
          font-size: 0.75rem;
          color: #475569;
        }

        .launcher-arrow {
          color: #94a3b8;
          font-size: 1rem;
          transition: transform 0.2s;
        }

        .launcher-item-btn:hover .launcher-arrow {
          color: #4f46e5;
          transform: translateX(3px);
        }

        .launcher-store-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(248, 250, 252, 0.5);
          border: 1px dashed rgba(203, 213, 225, 1);
          border-radius: 12px;
          padding: 0.75rem 1rem;
        }

        .store-banner-pin {
          color: #4f46e5;
          font-size: 1.3rem;
          flex-shrink: 0;
        }

        .store-banner-details {
          flex-grow: 1;
        }

        .store-banner-details strong {
          display: block;
          font-size: 0.85rem;
          color: #1e293b;
        }

        .store-banner-details p {
          margin: 0;
          font-size: 0.75rem;
          color: #64748b;
        }

        .store-banner-link {
          color: #818cf8;
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: none;
        }

        /* Bottom Hero Stats Ribbon */
        .contact-stats-ribbon {
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

        .contact-ribbon-item {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .contact-ribbon-icon {
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

        .contact-ribbon-value {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
        }

        .contact-ribbon-label {
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

        /* Contact Main Grid */
        .contact-main-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 3.5rem;
          align-items: flex-start;
        }

        .story-paragraph {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #475569;
          margin-bottom: 2rem;
        }

        /* Info Cards */
        .info-cards-stack {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .info-item-card {
          display: flex;
          align-items: flex-start;
          gap: 1.2rem;
          background: white;
          padding: 1.5rem;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .info-item-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
        }

        .info-icon-box {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 1.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-item-card h4 {
          font-size: 1.1rem;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .info-item-card p {
          font-size: 0.95rem;
          color: #334155;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .info-subtext {
          font-size: 0.8rem;
          color: #64748b;
        }

        /* Referral Callout Banner */
        .contact-referral-callout {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
          border: 1px solid #c7d2fe;
          border-radius: 18px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .callout-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: #4f46e5;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .contact-referral-callout h5 {
          font-size: 1rem;
          color: #1e1b4b;
          margin: 0 0 3px 0;
        }

        .contact-referral-callout p {
          font-size: 0.85rem;
          color: #475569;
          margin: 0 0 6px 0;
        }

        .callout-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #4f46e5;
          font-size: 0.85rem;
          font-weight: 700;
          text-decoration: none;
        }

        /* Form Wrapper */
        .contact-form-wrapper {
          background: white;
          border-radius: 24px;
          padding: 2.5rem;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
        }

        .form-top-title h3 {
          font-size: 1.6rem;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .form-top-title p {
          font-size: 0.95rem;
          color: #64748b;
          margin-bottom: 2rem;
        }

        .styled-contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2rem;
        }

        .form-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-field-group label {
          font-size: 0.88rem;
          font-weight: 600;
          color: #334155;
        }

        .form-field-group input,
        .form-field-group select,
        .form-field-group textarea {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          font-size: 0.95rem;
          color: #0f172a;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-field-group input:focus,
        .form-field-group select:focus,
        .form-field-group textarea:focus {
          border-color: #4f46e5;
          background: white;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
        }

        .btn-submit-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          box-shadow: 0 8px 25px rgba(79, 70, 229, 0.35);
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 0.5rem;
        }

        .btn-submit-message:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(79, 70, 229, 0.45);
        }

        .form-privacy-note {
          text-align: center;
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 0.5rem;
        }

        /* Success Card */
        .form-success-card {
          text-align: center;
          padding: 3rem 1.5rem;
        }

        .success-icon-circle {
          width: 75px;
          height: 75px;
          border-radius: 50%;
          background: #dcfce7;
          color: #16a34a;
          font-size: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem auto;
        }

        .form-success-card h3 {
          font-size: 1.7rem;
          color: #0f172a;
          margin-bottom: 0.8rem;
        }

        .form-success-card p {
          font-size: 1rem;
          color: #475569;
          line-height: 1.6;
          max-width: 480px;
          margin: 0 auto 1.5rem auto;
        }

        .success-details-pill {
          display: inline-block;
          background: #f1f5f9;
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 0.85rem;
          color: #334155;
          margin-bottom: 2rem;
        }

        .btn-send-another {
          background: #4f46e5;
          color: white;
          padding: 0.8rem 1.8rem;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }

        /* Department Cards */
        .departments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.8rem;
        }

        .department-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .department-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
        }

        .dept-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.2rem;
        }

        .dept-icon-circle {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dept-badge {
          background: #f1f5f9;
          color: #475569;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
        }

        .department-card h4 {
          font-size: 1.2rem;
          color: #0f172a;
          margin-bottom: 0.6rem;
        }

        .department-card p {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }

        .dept-email-link {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: #4f46e5;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
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

        /* Bottom CTA Banner */
        .contact-cta-banner {
          background: linear-gradient(135deg, #3730a3 0%, #4f46e5 100%);
          color: white;
          padding: 5rem 0;
          text-align: center;
        }

        .contact-cta-banner h2 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .contact-cta-banner p {
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
          .contact-hero-split {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .contact-hero-left {
            text-align: center;
          }
          .contact-hero-title {
            text-align: center;
          }
          .contact-hero-subtitle {
            margin: 0 auto 2rem auto;
            text-align: center;
          }
          .contact-hero-actions {
            justify-content: center;
          }
          .contact-trust-pills {
            justify-content: center;
          }
          .contact-stats-ribbon {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.2rem;
          }
          .contact-main-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .section-heading {
            font-size: 2rem;
          }
        }

        @media (max-width: 768px) {
          .contact-section-pad {
            padding: 3.5rem 0;
          }
          .section-heading {
            font-size: 1.75rem;
          }
          .departments-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
        }

        @media (max-width: 600px) {
          .contact-hero-section {
            padding: 3.5rem 0 2.5rem 0;
          }
          .contact-hero-badge {
            font-size: 0.75rem;
            padding: 5px 12px;
            margin-bottom: 1rem;
            white-space: normal;
            text-align: left;
          }
          .contact-hero-title {
            font-size: 1.85rem;
          }
          .typewriter-box {
            font-size: 1rem;
            min-height: 2.5rem;
          }
          .contact-hero-subtitle {
            font-size: 0.95rem;
          }
          .contact-hero-actions {
            flex-direction: column;
            gap: 0.75rem;
          }
          .btn-contact-whatsapp,
          .btn-contact-call,
          .btn-contact-form-jump {
            width: 100%;
            justify-content: center;
            padding: 0.8rem 1.2rem;
            font-size: 0.95rem;
          }
          .contact-trust-pills {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }
          .trust-pill-item {
            justify-content: center;
          }
          .contact-launcher-card {
            padding: 1.2rem;
          }
          .launcher-store-banner {
            flex-direction: column;
            text-align: center;
          }
          .contact-stats-ribbon {
            grid-template-columns: 1fr;
            padding: 1rem;
            gap: 0.9rem;
          }
          .contact-ribbon-item {
            gap: 10px;
          }
          .contact-ribbon-value {
            font-size: 1.25rem;
          }
          .contact-ribbon-label {
            font-size: 0.78rem;
          }
          .form-row-2 {
            grid-template-columns: 1fr;
          }
          .contact-form-wrapper {
            padding: 1.2rem;
          }
          .departments-grid {
            grid-template-columns: 1fr;
          }
          .contact-container {
            padding: 0 1rem;
          }
          .contact-cta-banner h2 {
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

export default Contact;
