import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [apiCategories, setApiCategories] = useState([]);
  const [dbProducts, setDbProducts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryFilter = params.get('category') || '';
  const searchFilter   = params.get('search')   || '';
  const dealsFilter    = params.get('deals') === 'true';
  const newFilter      = params.get('new') === 'true';
  const wholesaleFilter= params.get('wholesale') === 'true';
  const limitedFilter  = location.pathname === '/limited';

  useEffect(() => {
    // Fetch categories for tabs
    axios.get(`${import.meta.env.VITE_API_URL}/categories`)
      .then(res => setApiCategories(res.data))
      .catch(err => console.error('Error fetching categories:', err));

    // Fetch products
    axios.get(`${import.meta.env.VITE_API_URL}/products`)
      .then(res => {
        const formatted = res.data.map(p => ({
          id: p._id,
          title: p.name,
          price: p.price,
          originalPrice: p.originalPrice || Math.round(p.price * 1.2),
          image: p.images?.[0] || 'https://via.placeholder.com/300',
          category: p.category?.name?.toLowerCase() || 'other',
          discount: p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
          tags: p.tags || [],
          rating: 4.5,
          reviews: Math.floor(Math.random() * 200) + 10
        }));
        setDbProducts(formatted);
      })
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  // Derive visible products
  const visibleProducts = dbProducts.filter(p => {
    if (categoryFilter && p.category !== categoryFilter.toLowerCase()) return false;
    if (searchFilter && !p.title.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    if (dealsFilter && p.discount < 25) return false;
    if (newFilter && p.discount > 10) return false; 
    if (wholesaleFilter && p.category !== 'grocery' && p.category !== 'electronics') return false; 
    if (limitedFilter && !p.tags.includes('Limited')) return false;
    if (activeTab !== 'All' && p.category !== activeTab.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="section-pad">
      <div className="section-title-row" style={{ flexWrap:'wrap', gap:'0.5rem', marginBottom:'1.5rem' }}>
        <h2 className="section-title">All Products</h2>
        <div className="featured-tabs">
          {['All', ...apiCategories.map(c => c.name)].map(t => (
            <button
              key={t}
              className={`featured-tab${activeTab === t ? ' active' : ''}`}
              onClick={() => setActiveTab(t)}
            >{t}</button>
          ))}
        </div>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="products-grid">
          {visibleProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="empty-state">
          <p>😕 No products found</p>
          <button className="btn-primary" onClick={() => { setActiveTab('All'); navigate('/products'); }}>
            Browse All Products
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;
