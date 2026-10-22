import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiCheckCircle, FiAlertTriangle, FiFileText, FiLock, FiInfo, FiArrowLeft, FiHelpCircle, FiCheck } from 'react-icons/fi';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const coreClauses = [
    {
      num: 1,
      title: 'Voluntary Participation',
      icon: <FiCheckCircle />,
      badge: 'Free Will',
      badgeColor: '#10b981',
      badgeBg: '#ecfdf5',
      text: 'By registering with or using this website, I confirm that I am doing so voluntarily, of my own free will, and without any force, pressure, or coercion from any person or organization.'
    },
    {
      num: 2,
      title: 'Acceptance of Risk',
      icon: <FiAlertTriangle />,
      badge: 'Informed Choice',
      badgeColor: '#f59e0b',
      badgeBg: '#fffbeb',
      text: 'I understand that using this website is my personal choice and that I am responsible for my decision to participate. I acknowledge that there may be risks, uncertainties, or limitations associated with the website and its services.'
    },
    {
      num: 3,
      title: 'No Guarantee of Continuity',
      icon: <FiInfo />,
      badge: 'Service Availability',
      badgeColor: '#6366f1',
      badgeBg: '#eef2ff',
      text: 'I understand that the website and its services may be modified, suspended, interrupted, or discontinued at any time. I acknowledge that the website may not always be available or may cease operations entirely.'
    },
    {
      num: 4,
      title: 'Acknowledgment and Consent',
      icon: <FiFileText />,
      badge: 'Agreement',
      badgeColor: '#0ea5e9',
      badgeBg: '#f0f9ff',
      text: 'By proceeding, I confirm that I have read, understood, and voluntarily accepted these Terms and Conditions. I understand that my participation is subject to the applicable terms, policies, and laws.'
    },
    {
      num: 5,
      title: 'Limitation of Liability',
      icon: <FiShield />,
      badge: 'Legal Disclaimer',
      badgeColor: '#ec4899',
      badgeBg: '#fdf2f8',
      text: 'To the extent permitted by applicable law, the website shall not be liable for losses arising from service interruptions or discontinuation, except where liability cannot legally be excluded.'
    },
    {
      num: 6,
      title: 'User Confirmation',
      icon: <FiLock />,
      badge: 'Independent Decision',
      badgeColor: '#8b5cf6',
      badgeBg: '#f5f3ff',
      text: 'By creating an account or using the website, I confirm that I have made an independent and informed decision to participate and that I have not been forced or misled into doing so.'
    }
  ];

  return (
    <div className="terms-page-wrapper">
      <div className="terms-container">
        {/* Breadcrumb Navigation */}
        <div className="terms-breadcrumb">
          <Link to="/" className="terms-back-link">
            <FiArrowLeft /> Back to Home
          </Link>
          <span className="terms-breadcrumb-sep">/</span>
          <span className="terms-breadcrumb-curr">Terms and Conditions</span>
        </div>

        {/* Hero Section */}
        <header className="terms-hero">
          <div className="terms-hero-badge">
            <FiShield /> Official Agreement & User Declaration
          </div>
          <h1 className="terms-hero-title">Terms and Conditions</h1>
          <p className="terms-hero-subtitle">
            Please read these Terms and Conditions carefully before registering, creating an account, or using our website and services.
          </p>
          <div className="terms-meta-bar">
            <span><strong>Effective Date:</strong> October 2026</span>
            <span className="meta-dot">•</span>
            <span><strong>Applicable To:</strong> All Registered & Guest Users</span>
            <span className="meta-dot">•</span>
            <span><strong>Platform:</strong> LG Enterprises</span>
          </div>
        </header>

        {/* Executive Callout Card */}
        <div className="terms-callout-card">
          <div className="terms-callout-icon">
            <FiInfo />
          </div>
          <div className="terms-callout-content">
            <h3>Important Notice Regarding Voluntary Use</h3>
            <p>
              Your access to and use of this platform constitutes full, voluntary acceptance of the terms outlined below. If you do not agree with any part of these terms or do not participate of your own free will, you must immediately refrain from registering or using this website.
            </p>
          </div>
        </div>

        {/* Core Terms Section (1 to 6) */}
        <section className="terms-core-section">
          <div className="terms-section-header">
            <span className="terms-section-tag">Primary Clauses</span>
            <h2>User Agreement & Declaration</h2>
            <p>
              The following fundamental terms govern your participation, account ownership, and interaction with this website:
            </p>
          </div>

          <div className="terms-clauses-grid">
            {coreClauses.map((clause) => (
              <div key={clause.num} className="terms-clause-card" id={`clause-${clause.num}`}>
                <div className="terms-clause-top">
                  <div className="terms-clause-num-badge">
                    <span className="clause-num">{clause.num}</span>
                    <span className="clause-icon">{clause.icon}</span>
                  </div>
                  <span 
                    className="terms-clause-pill"
                    style={{ color: clause.badgeColor, background: clause.badgeBg, border: `1px solid ${clause.badgeColor}33` }}
                  >
                    {clause.badge}
                  </span>
                </div>

                <h3 className="terms-clause-title">
                  {clause.num}. {clause.title}
                </h3>

                <p className="terms-clause-body">
                  {clause.text}
                </p>

                <div className="terms-clause-footer">
                  <FiCheck style={{ color: clause.badgeColor }} /> Voluntary Agreement Clause {clause.num} of 6
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* General Store Policies Section */}
        <section className="terms-additional-section">
          <div className="terms-section-header">
            <span className="terms-section-tag">Platform Guidelines</span>
            <h2>Store Policies & Commerce Terms</h2>
            <p>
              In addition to the primary declaration above, standard operating policies apply to all orders and services:
            </p>
          </div>

          <div className="terms-policy-accordion">
            <div className="terms-policy-box">
              <h4>7. Account Responsibility & Security</h4>
              <p>
                You are responsible for safeguarding your login credentials, wallet security, and all activities that occur under your account. You agree to notify us immediately of any unauthorized access or security breach.
              </p>
            </div>

            <div className="terms-policy-box">
              <h4>8. Products, Pricing & Store Orders</h4>
              <p>
                We strive for absolute accuracy in product specifications, pricing, and availability. In the event of a typographical or system error, we reserve the right to rectify order information or cancel erroneous orders prior to fulfillment with full repayment to your wallet or original payment method.
              </p>
            </div>

            <div className="terms-policy-box">
              <h4>9. 7-Day Return Policy & Wallet Repayment</h4>
              <p>
                Eligible store products are backed by our 7-day return policy commencing upon delivery. Once an item is received and confirmed by the administrator, stock is replenished into inventory and your refund is credited directly to your customer wallet. Associated referral commissions mature only after the 7-day return window elapses without return request.
              </p>
            </div>

            <div className="terms-policy-box">
              <h4>10. Affiliate Program & Commission Guidelines</h4>
              <p>
                Affiliate referral commissions and gift milestone campaigns are performance-based benefits provided voluntarily by the platform and remain subject to verification, anti-fraud checks, and fulfillment terms.
              </p>
            </div>
          </div>
        </section>

        {/* Contact & Support Section */}
        <section className="terms-contact-card">
          <div className="terms-contact-content">
            <div className="terms-contact-badge"><FiHelpCircle /> Need Clarification?</div>
            <h3>Questions About Our Terms?</h3>
            <p>
              If you have any questions, concerns, or requests regarding these Terms and Conditions, please feel free to reach out to our dedicated legal and customer support team.
            </p>
            <div className="terms-contact-meta">
              <span><strong>Support Email:</strong> support@lgenterprises.com</span>
              <span className="meta-dot">•</span>
              <span><strong>Business Hours:</strong> Monday – Saturday (9:00 AM – 6:00 PM IST)</span>
            </div>
          </div>
          <div className="terms-contact-actions">
            <Link to="/contact" className="terms-btn-primary">
              Contact Support
            </Link>
            <Link to="/register" className="terms-btn-secondary">
              Create Account
            </Link>
          </div>
        </section>
      </div>

      <style>{`
        .terms-page-wrapper {
          min-height: 100vh;
          background: #f8fafc;
          padding: 2.5rem 1rem 5rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0f172a;
        }
        .terms-container {
          max-width: 940px;
          margin: 0 auto;
        }
        .terms-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 2rem;
        }
        .terms-back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: #4f46e5;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.15s;
        }
        .terms-back-link:hover {
          color: #3730a3;
          text-decoration: underline;
        }
        .terms-breadcrumb-sep {
          color: #cbd5e1;
        }
        .terms-breadcrumb-curr {
          color: #475569;
          font-weight: 500;
        }

        /* Hero */
        .terms-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          border-radius: 20px;
          padding: 3rem 2.5rem;
          color: #ffffff;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.2);
          margin-bottom: 2rem;
          position: relative;
          overflow: hidden;
        }
        .terms-hero::after {
          content: '';
          position: absolute;
          top: -40%;
          right: -20%;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%);
          pointer-events: none;
        }
        .terms-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #e0e7ff;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .terms-hero-title {
          font-size: 2.25rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.2;
          margin-bottom: 0.75rem;
        }
        .terms-hero-subtitle {
          font-size: 1.05rem;
          color: #cbd5e1;
          line-height: 1.6;
          max-width: 680px;
          margin-bottom: 1.5rem;
        }
        .terms-meta-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          font-size: 0.82rem;
          color: #94a3b8;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
        }
        .terms-meta-bar strong {
          color: #e2e8f0;
        }
        .meta-dot {
          color: #475569;
        }

        /* Callout Box */
        .terms-callout-card {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-left: 4px solid #3b82f6;
          border-radius: 14px;
          padding: 1.4rem 1.6rem;
          display: flex;
          align-items: flex-start;
          gap: 1.1rem;
          margin-bottom: 2.5rem;
        }
        .terms-callout-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #dbeafe;
          color: #1d4ed8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.35rem;
          flex-shrink: 0;
        }
        .terms-callout-content h3 {
          font-size: 0.98rem;
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 0.35rem;
        }
        .terms-callout-content p {
          font-size: 0.88rem;
          color: #1e40af;
          line-height: 1.6;
          margin: 0;
        }

        /* Section Headers */
        .terms-core-section, .terms-additional-section {
          margin-bottom: 3rem;
        }
        .terms-section-header {
          margin-bottom: 1.75rem;
        }
        .terms-section-tag {
          font-size: 0.74rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #4f46e5;
          margin-bottom: 0.25rem;
          display: block;
        }
        .terms-section-header h2 {
          font-size: 1.6rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.4rem;
        }
        .terms-section-header p {
          font-size: 0.95rem;
          color: #64748b;
          line-height: 1.5;
        }

        /* Clauses Grid (6 Items) */
        .terms-clauses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
          gap: 1.25rem;
        }
        @media (max-width: 640px) {
          .terms-clauses-grid {
            grid-template-columns: 1fr;
          }
        }
        .terms-clause-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          display: flex;
          flex-direction: column;
        }
        .terms-clause-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.06);
          border-color: #cbd5e1;
        }
        .terms-clause-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .terms-clause-num-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .clause-num {
          font-size: 0.85rem;
          font-weight: 800;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #0f172a;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .clause-icon {
          font-size: 1.15rem;
          color: #64748b;
          display: flex;
          align-items: center;
        }
        .terms-clause-pill {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
          letter-spacing: 0.02em;
        }
        .terms-clause-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.75rem;
        }
        .terms-clause-body {
          font-size: 0.92rem;
          color: #334155;
          line-height: 1.65;
          flex: 1;
          margin-bottom: 1.25rem;
          background: #f8fafc;
          padding: 1rem;
          border-radius: 10px;
          border-left: 3px solid #cbd5e1;
        }
        .terms-clause-footer {
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }

        /* Policy Accordion */
        .terms-policy-accordion {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .terms-policy-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          box-shadow: 0 1px 4px rgba(0,0,0,0.02);
        }
        .terms-policy-box h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }
        .terms-policy-box p {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        /* Contact Card */
        .terms-contact-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 2.25rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .terms-contact-content {
          flex: 1;
          min-width: 280px;
        }
        .terms-contact-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #4f46e5;
          text-transform: uppercase;
          margin-bottom: 0.4rem;
        }
        .terms-contact-content h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.4rem;
        }
        .terms-contact-content p {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }
        .terms-contact-meta {
          font-size: 0.82rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .terms-contact-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .terms-btn-primary {
          background: #4f46e5;
          color: #ffffff;
          padding: 0.7rem 1.4rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
          transition: background 0.15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .terms-btn-primary:hover {
          background: #4338ca;
        }
        .terms-btn-secondary {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
          padding: 0.7rem 1.4rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .terms-btn-secondary:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
      `}</style>
    </div>
  );
};

export default Terms;
