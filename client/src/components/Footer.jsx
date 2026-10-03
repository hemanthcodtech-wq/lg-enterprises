import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiChevronRight } from 'react-icons/fi';

const Footer = () => (
  <footer className="footer">
    <div className="footer-top">
      {/* Brand */}
      <div>
        <img src="/logo.png" alt="LG Enterprises" className="footer-brand-logo" />
        <p className="footer-desc">
          Your one-stop destination for Electronics, Furniture, Grocery, Clothing & more. Quality products at the best prices — delivered to your door.
        </p>
        <div className="footer-social">
          <a href="#" className="social-icon"><FiFacebook /></a>
          <a href="#" className="social-icon"><FiTwitter /></a>
          <a href="#" className="social-icon"><FiInstagram /></a>
          <a href="#" className="social-icon"><FiYoutube /></a>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h4 className="footer-col-title">Quick Links</h4>
        <ul className="footer-links">
          <li><Link to="/"><FiChevronRight /> Home</Link></li>
          <li><Link to="/about"><FiChevronRight /> About Us</Link></li>
          <li><Link to="/contact"><FiChevronRight /> Contact Us</Link></li>
          <li><a href="#"><FiChevronRight /> Store Locator</a></li>
          <li><a href="#"><FiChevronRight /> Careers</a></li>
        </ul>
      </div>

      {/* Customer Service */}
      <div>
        <h4 className="footer-col-title">Customer Service</h4>
        <ul className="footer-links">
          <li><a href="#"><FiChevronRight /> Track Your Order</a></li>
          <li><a href="#"><FiChevronRight /> Returns & Exchanges</a></li>
          <li><a href="#"><FiChevronRight /> Shipping Info</a></li>
          <li><a href="#"><FiChevronRight /> Help & FAQs</a></li>
          <li><a href="#"><FiChevronRight /> Bulk / Wholesale Orders</a></li>
        </ul>
      </div>

      {/* Categories */}
      <div>
        <h4 className="footer-col-title">Categories</h4>
        <ul className="footer-links">
          <li><a href="#"><FiChevronRight /> Electronics</a></li>
          <li><a href="#"><FiChevronRight /> Furniture</a></li>
          <li><a href="#"><FiChevronRight /> Grocery</a></li>
          <li><a href="#"><FiChevronRight /> Clothing</a></li>
          <li><a href="#"><FiChevronRight /> Home & Kitchen</a></li>
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h4 className="footer-col-title">Contact Info</h4>
        <div className="footer-contact-item">
          <FiMapPin />
          <p>LG Complex, Main Road,<br/>Bhimavaram, AP – 534201</p>
        </div>
        <div className="footer-contact-item">
          <FiPhone />
          <p>+91 9876543210</p>
        </div>
        <div className="footer-contact-item">
          <FiMail />
          <p>support@lgenterprises.com</p>
        </div>
      </div>
    </div>

    <hr className="footer-divider" />

    <div className="footer-bottom">
      <div className="footer-bottom-left">
        &copy; {new Date().getFullYear()} LG Enterprises. All Rights Reserved.
      </div>
      <div className="footer-bottom-right">
        <span>Secure Payments:</span>
        <span className="payment-badge">UPI</span>
        <span className="payment-badge">Cards</span>
        <span className="payment-badge">COD</span>
        <a href="#" style={{color:'var(--text-muted)'}}>Privacy Policy</a>
        <a href="#" style={{color:'var(--text-muted)'}}>Terms of Use</a>
      </div>
    </div>
  </footer>
);

export default Footer;
