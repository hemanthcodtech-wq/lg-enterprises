import React, { useState } from 'react';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';

const faqs = [
  { q:'How long does delivery take?', a:'We deliver within 3–7 business days to most locations. Metro cities receive orders within 1–3 days.' },
  { q:'Can I return a product?', a:'Yes! We offer a 7-day hassle-free return policy on all eligible products.' },
  { q:'Do you offer wholesale pricing?', a:'Absolutely. Contact us via phone or email with your bulk order requirements for special pricing.' },
  { q:'Is COD available?', a:'Cash on Delivery is available on orders up to ₹10,000 across most serviceable pin codes.' },
];

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', message:'' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ background:'var(--bg-page)' }}>
      <div className="contact-page">
        {/* Hero */}
        <div className="contact-hero">
          <h1>Get in <span>Touch</span></h1>
          <p>Have a question, need help with an order, or want to discuss wholesale pricing? We're here for you.</p>
        </div>

        {/* Grid */}
        <div className="contact-grid">
          {/* Info Cards */}
          <div className="contact-info-panel">
            <div className="contact-info-card">
              <div className="contact-icon-box"><FiMapPin /></div>
              <div>
                <h4>Our Store Address</h4>
                <p>LG Complex, Main Road,<br/>Bhimavaram, Andhra Pradesh – 534201</p>
              </div>
            </div>
            <div className="contact-info-card">
              <div className="contact-icon-box"><FiPhone /></div>
              <div>
                <h4>Phone / WhatsApp</h4>
                <p>+91 9876543210<br/>Mon–Sat: 9 AM – 8 PM</p>
              </div>
            </div>
            <div className="contact-info-card">
              <div className="contact-icon-box"><FiMail /></div>
              <div>
                <h4>Email Us</h4>
                <p>support@lgenterprises.com<br/>We reply within 24 hours</p>
              </div>
            </div>
            <div className="contact-info-card">
              <div className="contact-icon-box"><FiClock /></div>
              <div>
                <h4>Business Hours</h4>
                <p>Mon–Sat: 9:00 AM – 8:00 PM<br/>Sunday: 10:00 AM – 6:00 PM</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="contact-form-panel">
            {submitted ? (
              <div style={{ textAlign:'center', padding:'2rem' }}>
                <FiCheckCircle style={{ fontSize:'3rem', color:'var(--green)', marginBottom:'1rem' }} />
                <h3>Message Sent!</h3>
                <p style={{ color:'var(--text-gray)', marginTop:'0.5rem' }}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="btn-primary" style={{ marginTop:'1.5rem' }}>Send Another</button>
              </div>
            ) : (
              <>
                <h3>Send Us a Message</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Your Name</label>
                      <input type="text" className="form-input" placeholder="John Doe" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input type="tel" className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select className="form-input" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} required>
                      <option value="">Select a topic…</option>
                      <option>Order Inquiry</option>
                      <option>Return / Refund</option>
                      <option>Wholesale Pricing</option>
                      <option>Product Query</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea className="form-input" placeholder="Describe your query in detail…" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} required></textarea>
                  </div>
                  <button type="submit" className="contact-submit">
                    <FiSend style={{ marginRight:'0.5rem' }} /> Send Message
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* FAQs */}
        <div className="faq-section">
          <h2 className="section-title" style={{ marginBottom:'0.5rem' }}>Frequently Asked Questions</h2>
          <p style={{ color:'var(--text-gray)', fontSize:'0.88rem', marginBottom:'1.5rem' }}>Quick answers to common questions</p>
          <div className="faq-grid">
            {faqs.map((f, i) => (
              <div key={i} className="faq-item">
                <h4>{f.q}</h4>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
