import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiMenu, FiChevronRight, FiPercent, FiStar, FiPackage, FiBox } from 'react-icons/fi';
import { FaTv, FaCouch, FaShirt, FaBasketShopping, FaKitchenSet, FaBlender, FaBabyCarriage, FaFutbol, FaBook, FaSpa } from 'react-icons/fa6';

const iconMap = {
  'electronics': <FaTv className="cat-icon" />,
  'furniture': <FaCouch className="cat-icon" />,
  'fashion': <FaShirt className="cat-icon" />,
  'grocery': <FaBasketShopping className="cat-icon" />,
  'kitchen': <FaKitchenSet className="cat-icon" />,
  'appliances': <FaBlender className="cat-icon" />,
  'toys': <FaBabyCarriage className="cat-icon" />,
  'sports': <FaFutbol className="cat-icon" />,
  'books': <FaBook className="cat-icon" />,
  'beauty': <FaSpa className="cat-icon" />
};

const CategoryBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const activeCategory = params.get('category') || '';
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (id) => {
    navigate(`/?category=${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="cat-bar">
      <button className="cat-bar-all-btn" onClick={() => navigate('/')}>
        <FiMenu /> All Categories
      </button>

      <div className="cat-bar-links">
        {categories.map((c) => (
          <div
            key={c._id}
            className={`cat-link ${activeCategory === c.slug ? 'active' : ''}`}
            onClick={() => handleCategoryClick(c.slug)}
          >
            <span>{iconMap[c.slug] || <FiBox className="cat-icon" />}</span>{c.name}
          </div>
        ))}
      </div>

      <div className="cat-bar-right">
        <div className="cat-tag cat-tag-red" onClick={() => navigate('/?deals=true')}>
          <FiPercent /> Deals
        </div>
        <div className="cat-tag cat-tag-gold" onClick={() => navigate('/?new=true')}>
          <FiStar /> New Arrivals
        </div>
        <div className="cat-tag cat-tag-orange" onClick={() => navigate('/?wholesale=true')}>
          <FiPackage /> Wholesale <FiChevronRight />
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
