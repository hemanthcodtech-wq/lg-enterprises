import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FiTrash2, FiPlus } from 'react-icons/fi';

const AdminProducts = () => {
  const { token } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('slug', slug);
      formData.append('price', Number(price));
      if (originalPrice) {
        formData.append('originalPrice', Number(originalPrice));
      }
      formData.append('stock', Number(stock));
      formData.append('category', category);
      formData.append('description', description);
      if (images) {
        for (let i = 0; i < images.length; i++) {
          formData.append('images', images[i]);
        }
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/products`, formData, {
        headers: { 
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });
      // Reset form
      setName(''); setSlug(''); setPrice(''); setOriginalPrice(''); setStock(''); setCategory(''); setDescription(''); setImages(null);
      setShowAddForm(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating product');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchProducts();
    } catch (err) {
      alert('Error deleting product');
    }
  };

  return (
    <div className="admin-tab-content">
      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
        }
        .modal-content {
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 24px;
          padding: 2.5rem;
          width: 100%; max-width: 800px; max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.4);
          animation: modalPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
        }
        
        /* Custom Scrollbar for Modal */
        .modal-content::-webkit-scrollbar {
          width: 14px;
        }
        .modal-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .modal-content::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.4);
          border-radius: 20px;
          border: 4px solid rgba(255, 255, 255, 0);
          background-clip: padding-box;
        }
        .modal-content::-webkit-scrollbar-thumb:hover {
          background-color: rgba(148, 163, 184, 0.7);
        }
        @keyframes modalPopIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .modal-close-btn {
          position: absolute; top: 1.5rem; right: 1.5rem;
          background: white; border: none; font-size: 1.5rem; width: 40px; height: 40px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #64748b; line-height: 1; transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .modal-close-btn:hover {
          color: #ef4444; transform: rotate(90deg); background: #fef2f2;
        }
        .glass-input {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 12px;
          padding: 0.8rem 1rem;
          width: 100%;
          transition: all 0.3s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .glass-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.95);
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }
        
        /* File Input Styling */
        input[type=file]::file-selector-button {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          color: #475569;
          cursor: pointer;
          font-weight: 600;
          margin-right: 1rem;
          transition: all 0.2s ease;
        }
        input[type=file]::file-selector-button:hover {
          background: #e2e8f0;
          color: #1e293b;
        }
        .admin-tab-content {
          position: relative;
          min-height: 100%;
        }
        .ambient-glow-1 {
          position: absolute;
          top: 40px;
          right: 5%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(99, 102, 241, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(50px);
        }
        .ambient-glow-2 {
          position: absolute;
          top: 380px;
          left: 5%;
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, rgba(244, 63, 94, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(50px);
        }
        .glass-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.75rem 1.6rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.4);
        }
        .glass-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4);
          background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
        }
        .glass-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .glass-product-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.45) 100%);
          backdrop-filter: blur(24px) saturate(190%);
          -webkit-backdrop-filter: blur(24px) saturate(190%);
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
          box-shadow: 
            0 10px 25px -5px rgba(15, 23, 42, 0.05),
            0 2px 6px -1px rgba(15, 23, 42, 0.03),
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.95);
          position: relative;
        }
        .glass-product-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%);
          pointer-events: none;
          z-index: 0;
        }
        .glass-product-card:hover {
          transform: translateY(-6px);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%);
          border-color: rgba(255, 255, 255, 1);
          box-shadow: 
            0 20px 35px -8px rgba(79, 70, 229, 0.16),
            0 1px 4px rgba(15, 23, 42, 0.04),
            inset 0 1px 2px 0 rgba(255, 255, 255, 1);
        }
        .card-img-box {
          height: 195px;
          margin: 0.75rem 0.75rem 0 0.75rem;
          border-radius: 14px;
          position: relative;
          overflow: hidden;
          padding: 0.85rem;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(241, 245, 249, 0.6) 100%);
          border: 1px solid rgba(255, 255, 255, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.02);
        }
        .card-img-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.12));
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .glass-product-card:hover .card-img-box img {
          transform: scale(1.08) translateY(-4px);
        }
        .card-stock-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          padding: 0.3rem 0.65rem;
          border-radius: 20px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          z-index: 2;
        }
        .card-stock-badge.in-stock {
          background: rgba(16, 185, 129, 0.15);
          color: #047857;
          border: 1px solid rgba(16, 185, 129, 0.35);
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.12);
        }
        .card-stock-badge.out-of-stock {
          background: rgba(239, 68, 68, 0.15);
          color: #b91c1c;
          border: 1px solid rgba(239, 68, 68, 0.35);
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.12);
        }
        .stock-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 6px currentColor;
        }
        .card-body-content {
          padding: 0.9rem 1.15rem 1.15rem 1.15rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          position: relative;
          z-index: 1;
        }
        .card-category-tag {
          display: inline-flex;
          align-items: center;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #4f46e5;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 6px;
          padding: 0.2rem 0.55rem;
          margin-bottom: 0.45rem;
          width: fit-content;
        }
        .card-product-title {
          margin: 0 0 0.6rem 0;
          color: #0f172a;
          font-size: 1.05rem;
          font-weight: 700;
          line-height: 1.35;
          letter-spacing: -0.2px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 2.85rem;
        }
        .card-price-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: auto;
          margin-bottom: 0.9rem;
          padding-top: 0.5rem;
          border-top: 1px dashed rgba(226, 232, 240, 0.85);
        }
        .card-price-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .card-price-val {
          display: flex;
          align-items: baseline;
          gap: 3px;
          color: #0f172a;
          font-weight: 800;
          font-size: 1.35rem;
          letter-spacing: -0.5px;
          line-height: 1.1;
        }
        .currency-symbol {
          font-size: 0.95rem;
          color: #4f46e5;
          font-weight: 700;
        }
        .card-price-original {
          font-size: 0.8rem;
          color: #94a3b8;
          text-decoration: line-through;
          font-weight: 600;
        }
        .card-discount-tag {
          font-size: 0.65rem;
          font-weight: 800;
          color: #059669;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 4px;
          padding: 0.1rem 0.35rem;
          letter-spacing: 0.3px;
          display: inline-block;
          width: fit-content;
        }
        .card-discount-badge-top {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff;
          border-radius: 6px;
          padding: 0.22rem 0.5rem;
          z-index: 2;
          box-shadow: 0 4px 10px rgba(217, 119, 6, 0.25);
        }
        .card-stock-hint {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
        }
        .glass-btn-delete {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 12px;
          padding: 0.72rem 1rem;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.35);
          position: relative;
          z-index: 1;
        }
        .glass-btn-delete:hover {
          background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(79, 70, 229, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.45);
        }
        .glass-btn-delete:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
        }
        .glass-btn-delete .btn-icon {
          font-size: 0.95rem;
          transition: transform 0.2s ease;
        }
        .glass-btn-delete:hover .btn-icon {
          transform: scale(1.15) rotate(-6deg);
        }
      `}</style>
      {/* Ambient background glow orbs for authentic glassmorphism */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '0.5rem', position: 'relative', zIndex: 1 }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 0.25rem 0', fontWeight: '800', letterSpacing: '-0.5px' }}>Product Catalog</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Manage your inventory, pricing, and live listings</p>
        </div>
        <button className="glass-btn" onClick={() => setShowAddForm(true)}>
          <FiPlus style={{ fontSize: '1.15rem' }} /> Add Product
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAddForm(false)}>&times;</button>
            <h3 style={{ marginBottom: '2rem', fontSize: '1.6rem', color: '#1e293b', background: 'linear-gradient(90deg, #1e293b, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>Add New Product</h3>
            <form onSubmit={handleSubmit} className="admin-form admin-form-grid">
              <div className="form-group">
                <label style={{ fontWeight: '600', color: '#475569' }}>Product Name</label>
                <input type="text" className="glass-input" value={name} onChange={e => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/ /g, '-'));
                }} required />
              </div>
              
              <div className="form-group">
                <label style={{ fontWeight: '600', color: '#475569' }}>Slug</label>
                <input type="text" className="glass-input" value={slug} onChange={e => setSlug(e.target.value)} required />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600', color: '#475569' }}>Original Price / MRP (₹)</label>
                <input type="number" min="0" className="glass-input" placeholder="e.g. 79999" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} />
                <small style={{ color: '#94a3b8' }}>Optional: standard retail price</small>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600', color: '#475569' }}>Discounted Price (₹) *</label>
                <input type="number" min="0" className="glass-input" placeholder="e.g. 69999" value={price} onChange={e => setPrice(e.target.value)} required />
                <small style={{ color: '#94a3b8' }}>
                  {originalPrice && Number(originalPrice) > Number(price) ? (
                    <span style={{ color: '#16a34a', fontWeight: '700' }}>
                      🎉 {Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}% Discount to buyer
                    </span>
                  ) : 'Selling price customers pay'}
                </small>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: '600', color: '#475569' }}>Stock Quantity *</label>
                <input type="number" min="0" className="glass-input" placeholder="e.g. 50" value={stock} onChange={e => setStock(e.target.value)} required />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: '600', color: '#475569' }}>Category</label>
                <select className="glass-input" value={category} onChange={e => setCategory(e.target.value)} required>
                  <option value="">Select a Category</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: '600', color: '#475569' }}>Description</label>
                <textarea className="glass-input" rows="3" value={description} onChange={e => setDescription(e.target.value)}></textarea>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontWeight: '600', color: '#475569' }}>Product Images (Cloudinary)</label>
                <input type="file" className="glass-input" style={{ padding: '0.6rem' }} multiple accept="image/*" onChange={e => setImages(e.target.files)} />
                <small style={{ color: '#64748b' }}>Select one or more images</small>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" className="glass-btn" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem', marginTop: '1.5rem', width: '100%', position: 'relative', zIndex: 1 }}>
          {products.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(16px)', borderRadius: '24px', border: '2px dashed rgba(203, 213, 225, 0.7)' }}>
              <p style={{ color: '#475569', fontSize: '1.2rem', margin: 0, fontWeight: '500' }}>No products found in the catalog.</p>
            </div>
          ) : (
            products.map(prod => (
              <div key={prod._id} className="glass-product-card">
                <div className="card-img-box">
                  {prod.originalPrice && prod.originalPrice > prod.price && (
                    <span className="card-discount-badge-top">
                      {Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF
                    </span>
                  )}
                  {prod.images && prod.images.length > 0 ? (
                    <img src={prod.images[0]} alt={prod.name} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '3rem', position: 'relative', zIndex: 1 }}>📦</div>
                  )}
                  <span className={`card-stock-badge ${prod.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    <span className="stock-dot"></span>
                    {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div className="card-body-content">
                  <span className="card-category-tag">
                    {prod.category?.name || 'General'}
                  </span>
                  <h4 className="card-product-title" title={prod.name}>{prod.name}</h4>
                  <div className="card-price-row">
                    <div className="card-price-group">
                      <div className="card-price-val">
                        <span className="currency-symbol">₹</span>
                        {prod.price?.toLocaleString('en-IN')}
                      </div>
                      {prod.originalPrice && prod.originalPrice > prod.price ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="card-price-original">
                            ₹{prod.originalPrice?.toLocaleString('en-IN')}
                          </span>
                          <span className="card-discount-tag">
                            {Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <span className="card-stock-hint">{prod.stock} left</span>
                  </div>
                  <button onClick={() => handleDelete(prod._id)} className="glass-btn-delete">
                    <FiTrash2 className="btn-icon" /> Delete Product
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
    </div>
  );
};

export default AdminProducts;
