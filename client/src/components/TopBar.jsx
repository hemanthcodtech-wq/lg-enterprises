import React from 'react';
import { FiTruck, FiRefreshCcw, FiShield, FiCheckCircle, FiMapPin, FiHelpCircle, FiGlobe, FiChevronDown } from 'react-icons/fi';

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
        <span><FiMapPin /> Our Store</span>
        <span><FiTruck /> Track Order</span>
        <span><FiHelpCircle /> Need Help?</span>
        <span><span className="hindi-text">हिन्दी</span></span>
        <span><FiGlobe /> English <FiChevronDown /></span>
      </div>
    </div>
  );
};

export default TopBar;
