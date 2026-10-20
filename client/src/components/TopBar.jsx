import React from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiRefreshCcw, FiShield, FiCheckCircle, FiMapPin, FiHelpCircle, FiGlobe, FiChevronDown, FiInfo, FiPhone, FiGift } from 'react-icons/fi';

const TopBar = () => {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <span><FiTruck /> Free Delivery*</span>
        <span><FiRefreshCcw /> Easy Returns</span>
        <span><FiShield /> Secure Payments</span>
        <span><FiCheckCircle /> Genuine Products</span>
      </div>
      <div className="top-bar-right">
        <Link to="/gift-offers" style={{color: '#fbbf24', textDecoration: 'none', fontWeight: 700}}><span><FiGift /> Gift Offers</span></Link>
        <Link to="/about" style={{color: 'inherit', textDecoration: 'none'}}><span><FiInfo /> About Us</span></Link>
        <Link to="/contact" style={{color: 'inherit', textDecoration: 'none'}}><span><FiPhone /> Contact Us</span></Link>
        <span><FiMapPin /> Our Store</span>
      </div>
    </div>
  );
};

export default TopBar;
