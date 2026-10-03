import React, { useEffect } from 'react';

const Privacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--text-dark)', marginBottom: '2rem' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '1rem', lineHeight: '1.6' }}>
        Last updated: October 2026
      </p>
      
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--text-dark)', marginBottom: '1rem' }}>1. Information We Collect</h3>
        <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
          When you create an account, place an order, or interact with our platform, we may collect personal information such as your name, email address, phone number, shipping address, and payment details.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--text-dark)', marginBottom: '1rem' }}>2. How We Use Your Information</h3>
        <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
          We use your information to process transactions, deliver products, send order updates, and improve your overall shopping experience. We may also send promotional emails if you have opted in.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--text-dark)', marginBottom: '1rem' }}>3. Data Protection</h3>
        <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
          We implement a variety of security measures to maintain the safety of your personal information. Your sensitive data is encrypted via Secure Socket Layer (SSL) technology and strictly restricted.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--text-dark)', marginBottom: '1rem' }}>4. Sharing of Information</h3>
        <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
          We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, such as our payment processors and shipping partners.
        </p>
      </section>

      <p style={{ color: 'var(--text-light)', marginTop: '3rem', fontSize: '0.9rem' }}>
        If you have any questions regarding this Privacy Policy, please contact us at privacy@lgenterprises.com.
      </p>
    </div>
  );
};

export default Privacy;
