import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiChevronRight, FiPercent, FiStar, FiPackage } from 'react-icons/fi';

const catLinks = [
  { name: 'Electronics',         slug: 'electronics',  icon: '📺' },
  { name: 'Furniture',           slug: 'furniture',    icon: '🛋️' },
  { name: 'Cloth & Fashion',     slug: 'fashion',      icon: '👕' },
  { name: 'Grocery',             slug: 'grocery',      icon: '🛒' },
  { name: 'Home & Kitchen',      slug: 'kitchen',      icon: '🏠' },
  { name: 'Appliances',          slug: 'appliances',   icon: '🧺' },
  { name: 'Toys & Baby',         slug: 'toys',         icon: '🧸' },
  { name: 'Sports & Fitness',    slug: 'sports',       icon: '⚽' },
  { name: 'Books & Stationery',  slug: 'books',        icon: '📚' },
  { name: 'Beauty & Care',       slug: 'beauty',       icon: '💄' },
];

const CategoryBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const activeCategory = params.get('category') || '';

  const handleCategoryClick = (slug) => {
    navigate(`/?category=${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="cat-bar">
      <button className="cat-bar-all-btn" onClick={() => navigate('/')}>
        <FiMenu /> All Categories
      </button>

      <div className="cat-bar-links">
        {catLinks.map((c, i) => (
          <div
            key={i}
            className={`cat-link ${activeCategory === c.slug ? 'active' : ''}`}
            onClick={() => handleCategoryClick(c.slug)}
          >
            <span>{c.icon}</span>{c.name}
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
