import React, { useEffect } from 'react';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--text-dark)', marginBottom: '2rem' }}>Terms of Use</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '1rem', lineHeight: '1.6' }}>
        Last updated: October 2026
      </p>
      
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--text-dark)', marginBottom: '1rem' }}>1. Acceptance of Terms</h3>
        <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
          By accessing and using LG Enterprises, you accept and agree to be bound by the terms and provision of this agreement. 
          In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--text-dark)', marginBottom: '1rem' }}>2. Products and Services</h3>
        <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
          LG Enterprises strives to ensure that all details, descriptions, and prices of products appearing on the website are accurate.
          However, errors may occur. If we discover an error in the price of any goods which you have ordered, we will inform you of this as soon as possible.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--text-dark)', marginBottom: '1rem' }}>3. User Accounts</h3>
        <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
          To access some features of the site, you may need to register for an account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--text-dark)', marginBottom: '1rem' }}>4. Shipping & Returns</h3>
        <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>
          We aim to deliver products within the estimated timeframes. If you are not satisfied with your purchase, you can return it subject to our standard Return Policy guidelines outlined separately.
        </p>
      </section>
      
      <p style={{ color: 'var(--text-light)', marginTop: '3rem', fontSize: '0.9rem' }}>
        If you have any questions regarding these Terms of Use, please contact us at support@lgenterprises.com.
      </p>
    </div>
  );
};

export default Terms;
