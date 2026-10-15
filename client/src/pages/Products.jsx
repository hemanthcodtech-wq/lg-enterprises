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
          reviews: Math.floor(Math.random() * 200) + 10,
          stock: p.stock !== undefined ? p.stock : 10
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
          {['All', ...apiCategories.map(c => c.name)].map(t => {
            const cat = apiCategories.find(c => c.name === t);
            const isSoon = cat?.status === 'coming_soon';
            return (
              <button
                key={t}
                className={`featured-tab${activeTab === t ? ' active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t} {isSoon && <span style={{ fontSize: '0.75rem', marginLeft: '4px' }}>🚀</span>}
              </button>
            );
          })}
        </div>
      </div>

      {(() => {
        const selectedCat = (activeTab !== 'All' && apiCategories.find(c => c.name === activeTab)) || 
                            (categoryFilter && apiCategories.find(c => c.slug === categoryFilter));
        if (selectedCat && selectedCat.status === 'coming_soon') {
          return (
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
              border: '2px dashed #f59e0b',
              borderRadius: '24px',
              padding: '4rem 2rem',
              textAlign: 'center',
              maxWidth: '850px',
              margin: '2rem auto',
              boxShadow: '0 12px 36px rgba(245, 158, 11, 0.08)'
            }}>
              <div style={{
                width: '130px', height: '130px',
                margin: '0 auto 1.5rem auto',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                border: '4px solid #ffffff'
              }}>
                <img 
                  src={selectedCat.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80'} 
                  alt={selectedCat.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#b45309', padding: '6px 18px', borderRadius: '30px', fontWeight: 800, fontSize: '0.85rem', marginBottom: '1.2rem', border: '1px solid rgba(245, 158, 11, 0.35)', letterSpacing: '0.5px' }}>
                <span>🚀</span> THIS CATEGORY WILL LAUNCH SOON
              </div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.5px' }}>
                {selectedCat.name} Collection Launching Soon!
              </h2>
              <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2.2rem auto', lineHeight: 1.6 }}>
                {selectedCat.description ? selectedCat.description : `We are preparing an exclusive catalog of genuine ${selectedCat.name.toLowerCase()} products for you.`} Stay tuned, we're launching very soon!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={() => { setActiveTab('All'); navigate('/products'); }} style={{ padding: '0.85rem 2.2rem', borderRadius: '30px', fontWeight: 700 }}>
                  Browse All Products
                </button>
                <button className="btn-outline-primary" onClick={() => navigate('/')} style={{ padding: '0.85rem 2.2rem', borderRadius: '30px', fontWeight: 700 }}>
                  Back to Home
                </button>
              </div>
            </div>
          );
        }

        if (visibleProducts.length > 0) {
          return (
            <div className="products-grid">
              {visibleProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          );
        }

        return (
          <div className="empty-state">
            <p>😕 No products found</p>
            <button className="btn-primary" onClick={() => { setActiveTab('All'); navigate('/products'); }}>
              Browse All Products
            </button>
          </div>
        );
      })()}
    </div>
  );
};

export default Products;
