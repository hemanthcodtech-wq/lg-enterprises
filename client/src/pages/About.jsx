import React from 'react';
import { FiUsers, FiMapPin, FiAward, FiShoppingBag, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const stats = [
  { value:'10,000+', label:'Products Listed' },
  { value:'50,000+', label:'Happy Customers' },
  { value:'15+', label:'Years in Business' },
  { value:'24/7', label:'Customer Support' },
];

const team = [
  { name:'Rajesh Kumar', role:'Founder & CEO', emoji:'👨‍💼' },
  { name:'Priya Sharma', role:'Head of Operations', emoji:'👩‍💼' },
  { name:'Anil Reddy', role:'Tech Lead', emoji:'👨‍💻' },
  { name:'Sunita Rao', role:'Customer Success', emoji:'👩‍🎧' },
];

const About = () => (
  <div>
    {/* Hero */}
    <div className="about-hero">
      <h1>About <span>LG Enterprises</span></h1>
      <p>We are Bhimavaram's most trusted one-stop retail destination — serving thousands of customers with quality electronics, furniture, grocery & clothing since 2009.</p>
    </div>

    {/* Content */}
    <div className="about-section">
      {/* Story */}
      <div className="about-grid">
        <div className="about-img-box">🏪</div>
        <div className="about-text">
          <h2>Our <span>Story</span></h2>
          <p>Founded in 2009 in Bhimavaram, Andhra Pradesh, LG Enterprises started as a small local electronics shop. Over 15 years, we've grown into a multi-category retail powerhouse with both a physical store and a rapidly growing e-commerce platform.</p>
          <p>Our mission has always been simple: <strong>bring you the best products at the fairest prices</strong>, backed by genuine quality and exceptional customer service.</p>
          <Link to="/contact" className="btn-primary" style={{ display:'inline-flex', marginTop:'1rem' }}>
            Get in Touch <FiChevronRight />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="about-stats">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-number">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div className="about-grid reverse">
        <div className="about-text">
          <h2>Why Choose <span>Us?</span></h2>
          <p>We offer both retail and wholesale options — perfect for individual customers, small businesses, and bulk buyers alike. Our physical store in Bhimavaram lets you touch and feel products before you buy.</p>
          <p>With a curated catalog spanning Electronics, Furniture, Grocery, Fashion, Home & Kitchen, and more — we truly are your <strong>All-in-One shopping destination</strong>.</p>
        </div>
        <div className="about-img-box">🛒</div>
      </div>

      {/* Team */}
      <div className="team-section">
        <h2 className="section-title" style={{ justifyContent:'center', fontSize:'1.6rem' }}>Meet Our Team</h2>
        <p style={{ color:'var(--text-gray)', marginTop:'0.5rem' }}>The people who make it all happen</p>
        <div className="team-grid">
          {team.map((t, i) => (
            <div key={i} className="team-card">
              <div className="team-avatar">{t.emoji}</div>
              <h4>{t.name}</h4>
              <p>{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default About;
