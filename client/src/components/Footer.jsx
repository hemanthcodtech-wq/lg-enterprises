import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FiPhone, FiMail, FiMapPin, FiFacebook, FiTwitter, 
  FiInstagram, FiYoutube, FiChevronRight 
} from 'react-icons/fi';

const defaultCategories = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Furniture', slug: 'furniture' },
  { name: 'Grocery', slug: 'grocery' },
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Home & Kitchen', slug: 'kitchen' },
];

const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/categories`)
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCategories(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayCategories = categories.length > 0 ? categories.slice(0, 5) : defaultCategories;

  return (
    <footer className="footer">
      <div className="footer-top">
        {/* Brand */}
        <div>
          <Link to="/" onClick={scrollToTop} style={{ display: 'inline-block' }}>
            <img src="/logo.png" alt="LG Enterprises" className="footer-brand-logo" />
          </Link>
          <p className="footer-desc">
            Your one-stop destination for Electronics, Furniture, Grocery, Clothing & more. Quality products at the best prices — delivered to your door.
          </p>
          <div className="footer-social">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon"
              aria-label="Facebook"
            >
              <FiFacebook />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon"
              aria-label="Twitter"
            >
              <FiTwitter />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon"
              aria-label="Instagram"
            >
              <FiInstagram />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-icon"
              aria-label="YouTube"
            >
              <FiYoutube />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links">
            <li>
              <Link to="/" onClick={scrollToTop}>
                <FiChevronRight /> Home
              </Link>
            </li>
            <li>
              <Link to="/products" onClick={scrollToTop}>
                <FiChevronRight /> All Products
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={scrollToTop}>
                <FiChevronRight /> About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={scrollToTop}>
                <FiChevronRight /> Contact Us
              </Link>
            </li>
            <li>
              <Link to="/limited" onClick={scrollToTop}>
                <FiChevronRight /> Limited Deals
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="footer-col-title">Customer Service</h4>
          <ul className="footer-links">
            <li>
              <Link to="/orders" onClick={scrollToTop}>
                <FiChevronRight /> Track Your Order
              </Link>
            </li>
            <li>
              <Link to="/profile" onClick={scrollToTop}>
                <FiChevronRight /> My Account
              </Link>
            </li>
            <li>
              <Link to="/cart" onClick={scrollToTop}>
                <FiChevronRight /> Shopping Cart
              </Link>
            </li>
            <li>
              <Link to="/products?wholesale=true" onClick={scrollToTop}>
                <FiChevronRight /> Bulk / Wholesale Orders
              </Link>
            </li>
            <li>
              <Link to="/terms" onClick={scrollToTop}>
                <FiChevronRight /> Returns & Policies
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="footer-col-title">Categories</h4>
          <ul className="footer-links">
            {displayCategories.map((cat, idx) => (
              <li key={cat._id || cat.slug || idx}>
                <Link 
                  to={`/products?category=${encodeURIComponent((cat.slug || cat.name).toLowerCase())}`}
                  onClick={scrollToTop}
                >
                  <FiChevronRight /> {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="footer-col-title">Contact Info</h4>
          <Link to="/contact" onClick={scrollToTop} className="footer-contact-item" style={{ textDecoration: 'none' }}>
            <FiMapPin />
            <p style={{ margin: 0 }}>LG Complex, Main Road,<br/>Bhimavaram, AP – 534201</p>
          </Link>
          <a href="tel:+919876543210" className="footer-contact-item" style={{ textDecoration: 'none' }}>
            <FiPhone />
            <p style={{ margin: 0 }}>+91 9876543210</p>
          </a>
          <a href="mailto:support@lgenterprises.com" className="footer-contact-item" style={{ textDecoration: 'none' }}>
            <FiMail />
            <p style={{ margin: 0 }}>support@lgenterprises.com</p>
          </a>
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
          <Link to="/privacy" onClick={scrollToTop} className="footer-legal-link">
            Privacy Policy
          </Link>
          <Link to="/terms" onClick={scrollToTop} className="footer-legal-link">
            Terms of Use
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
