import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FiTrash2, FiPlus, FiEdit2 } from 'react-icons/fi';

const AdminProducts = () => {
  const { token } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState(null);
  const [tags, setTags] = useState([]);

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Filter and Paginate Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? p.category?._id === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      } else {
        formData.append('originalPrice', '');
      }
      formData.append('stock', Number(stock));
      formData.append('category', category);
      formData.append('description', description || '');
      formData.append('tags', JSON.stringify(tags));
      if (images) {
        for (let i = 0; i < images.length; i++) {
          formData.append('images', images[i]);
        }
      }

      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/products/${editingId}`, formData, {
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/products`, formData, {
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      resetForm();
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving product');
    }
    setLoading(false);
  };

  const handleEdit = (prod) => {
    setEditingId(prod._id);
    setName(prod.name);
    setSlug(prod.slug);
    setPrice(prod.price);
    setOriginalPrice(prod.originalPrice || '');
    setStock(prod.stock);
    setCategory(prod.category?._id || '');
    setDescription(prod.description || '');
    setTags(prod.tags || []);
    setImages(null);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName(''); setSlug(''); setPrice(''); setOriginalPrice(''); setStock(''); setCategory(''); setDescription(''); setImages(null); setTags([]);
    setShowAddForm(false);
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
        .filter-bar {
          display: flex; gap: 1rem; margin-bottom: 1.5rem;
          flex-wrap: wrap; align-items: center; justify-content: space-between;
          background: #ffffff; padding: 1rem; border-radius: 12px;
          border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          position: relative; z-index: 1;
        }
        .filter-group {
          display: flex; gap: 1rem; align-items: center; flex: 1; min-width: 200px; flex-wrap: wrap;
        }
        .filter-input {
          flex: 1; padding: 0.6rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px;
          font-size: 0.9rem; outline: none; transition: border-color 0.2s; min-width: 150px;
        }
        .filter-input:focus {
          border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .pagination {
          display: flex; justify-content: center; align-items: center; gap: 0.5rem;
          margin-top: 2.5rem; padding: 1rem 0 2rem; position: relative; z-index: 1;
        }
        .page-btn {
          width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
          border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;
          cursor: pointer; font-weight: 600; color: #475569; transition: all 0.2s;
        }
        .page-btn:hover:not(:disabled) {
          background: #f8fafc; border-color: #cbd5e1; color: #0f172a;
        }
        .page-btn.active {
          background: #4f46e5; color: #ffffff; border-color: #4f46e5;
        }
        .page-btn:disabled {
          opacity: 0.5; cursor: not-allowed;
        }
        .side-panel-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex; justify-content: flex-end;
        }
        .side-panel {
          background: rgba(248, 250, 252, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          width: 100%; max-width: 650px; height: 100vh;
          overflow-y: auto;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          display: flex;
          flex-direction: column;
          border-left: 1px solid rgba(255, 255, 255, 0.8);
        }
        .side-panel-header {
          padding: 2rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          position: sticky;
          top: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          z-index: 10;
        }
        .side-panel-body {
          padding: 2rem;
          flex: 1;
        }
        .side-panel-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
          position: sticky;
          bottom: 0;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          z-index: 10;
        }
        .panel-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02);
        }
        .panel-card-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1.25rem;
        }
        
        /* Custom Scrollbar */
        .side-panel::-webkit-scrollbar {
          width: 8px;
        }
        .side-panel::-webkit-scrollbar-track {
          background: transparent;
        }
        .side-panel::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .panel-close-btn {
          background: #f1f5f9; border: none; font-size: 1.2rem; width: 32px; height: 32px;
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #64748b; line-height: 1; transition: all 0.2s ease;
        }
        .panel-close-btn:hover {
          background: #e2e8f0; color: #0f172a;
        }
        .glass-input {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.7rem 1rem;
          width: 100%;
          font-size: 0.9rem;
          transition: all 0.2s;
          box-sizing: border-box;
          font-family: inherit;
          color: #0f172a;
        }
        .glass-input:focus {
          outline: none;
          background: #ffffff;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .admin-form-grid {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .admin-form-grid .form-group {
          margin-bottom: 0;
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

        .glass-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #4f46e5;
          color: white;
          border: 1px solid #4f46e5;
          padding: 0.65rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .glass-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
          background: #4338ca;
          border-color: #4338ca;
        }
        .glass-btn.outline {
          background: #ffffff;
          color: #475569;
          border: 1px solid #cbd5e1;
          box-shadow: none;
        }
        .glass-btn.outline:hover:not(:disabled) {
          background: #f8fafc;
          color: #0f172a;
          border-color: #94a3b8;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .glass-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .table-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          position: relative;
          z-index: 1;
        }
        .admin-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          text-align: left;
        }
        .admin-table th {
          background: #f8fafc;
          color: #64748b;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.8rem 1rem;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }
        .admin-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
          font-size: 0.85rem;
          vertical-align: middle;
        }
        .admin-table tr:hover td {
          background: #f8fafc;
        }
        .admin-table tr:last-child td {
          border-bottom: none;
        }
        .table-product-image {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .table-category-tag {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #4f46e5;
          background: #e0e7ff;
          border-radius: 4px;
          padding: 0.2rem 0.5rem;
        }
        .table-stock-badge {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          padding: 0.25rem 0.6rem;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .table-stock-badge.in-stock {
          background: #d1fae5;
          color: #065f46;
        }
        .table-stock-badge.out-of-stock {
          background: #fee2e2;
          color: #991b1b;
        }
        .stock-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }
        .table-btn-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          border: none;
          border-radius: 6px;
          padding: 0.4rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .table-btn-delete {
          background: #fee2e2;
          color: #b91c1c;
        }
        .table-btn-delete:hover {
          background: #f87171;
          color: white;
        }
        .table-btn-edit {
          background: #e0e7ff;
          color: #4f46e5;
        }
        .table-btn-edit:hover {
          background: #6366f1;
          color: white;
        }
      `}</style>


      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', marginTop: '0.5rem', position: 'relative', zIndex: 1 }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 0.25rem 0', fontWeight: '800', letterSpacing: '-0.5px' }}>Product Catalog</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Manage your inventory, pricing, and live listings</p>
        </div>
        <button className="glass-btn" onClick={() => { resetForm(); setShowAddForm(true); }}>
          <FiPlus style={{ fontSize: '1.15rem' }} /> Add Product
        </button>
      </div>

      {showAddForm && (
        <div className="side-panel-overlay" onClick={resetForm}>
          <div className="side-panel" onClick={e => e.stopPropagation()}>
            <div className="side-panel-header">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {editingId ? <FiEdit2 size={20} style={{ strokeWidth: '3px' }} /> : <FiPlus size={20} style={{ strokeWidth: '3px' }} />}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.02em' }}>
                    {editingId ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    {editingId ? 'Update details for this product' : 'Fill in the details to add a product to your catalog'}
                  </p>
                </div>
              </div>
              <button className="panel-close-btn" onClick={resetForm}>&times;</button>
            </div>
            
            <div className="side-panel-body">
              <form id="add-product-form" onSubmit={handleSubmit} className="admin-form">
                
                <div className="panel-card">
                  <div className="admin-form-grid">
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontWeight: '600', color: '#475569' }}>Product Name</label>
                      <input type="text" className="glass-input" value={name} onChange={e => {
                        setName(e.target.value);
                        setSlug(e.target.value.toLowerCase().replace(/ /g, '-'));
                      }} required />
                    </div>
                    
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontWeight: '600', color: '#475569' }}>Slug</label>
                      <input type="text" className="glass-input" value={slug} onChange={e => setSlug(e.target.value)} required />
                    </div>
                  </div>
                </div>

                <div className="panel-card">
                  <h4 className="panel-card-title">Pricing</h4>
                  <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label style={{ fontWeight: '600', color: '#475569' }}>MRP / Original Price (₹)</label>
                      <input type="number" min="0" className="glass-input" placeholder="e.g. 79999" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} />
                      <small style={{ color: '#94a3b8' }}>Optional: standard retail price</small>
                    </div>

                    <div className="form-group">
                      <label style={{ fontWeight: '600', color: '#475569' }}>Selling Price (₹) *</label>
                      <input type="number" min="0" className="glass-input" placeholder="e.g. 69999" value={price} onChange={e => setPrice(e.target.value)} required />
                      <small style={{ color: '#94a3b8' }}>
                        {originalPrice && Number(originalPrice) > Number(price) ? (
                          <span style={{ color: '#16a34a', fontWeight: '700' }}>
                            🎉 {Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}% OFF
                          </span>
                        ) : 'Price customers pay'}
                      </small>
                    </div>
                  </div>
                </div>

                <div className="panel-card">
                  <h4 className="panel-card-title">Inventory & Category</h4>
                  <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label style={{ fontWeight: '600', color: '#475569' }}>Stock Quantity *</label>
                      <input type="number" min="0" className="glass-input" placeholder="e.g. 50" value={stock} onChange={e => setStock(e.target.value)} required />
                    </div>

                    <div className="form-group">
                      <label style={{ fontWeight: '600', color: '#475569' }}>Category *</label>
                      <select className="glass-input" value={category} onChange={e => setCategory(e.target.value)} required>
                        <option value="">Select a Category</option>
                        {categories.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="panel-card">
                  <h4 className="panel-card-title">Tags & Badges</h4>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Select Tags</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {['Deal of the Day', 'Trending', 'Top Seller', 'Limited'].map(tag => (
                        <label key={tag} style={{ 
                          padding: '0.5rem 1rem', 
                          background: tags.includes(tag) ? '#4f46e5' : '#f1f5f9', 
                          color: tags.includes(tag) ? 'white' : '#475569',
                          borderRadius: '20px', 
                          fontSize: '0.85rem', 
                          fontWeight: 600, 
                          cursor: 'pointer',
                          border: `1px solid ${tags.includes(tag) ? '#4f46e5' : '#e2e8f0'}`,
                          transition: 'all 0.2s'
                        }}>
                          <input 
                            type="checkbox" 
                            style={{ display: 'none' }}
                            checked={tags.includes(tag)}
                            onChange={(e) => {
                              if (e.target.checked) setTags([...tags, tag]);
                              else setTags(tags.filter(t => t !== tag));
                            }}
                          />
                          {tag}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="panel-card">
                  <h4 className="panel-card-title">Description</h4>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <textarea className="glass-input" rows="4" placeholder="Product description..." value={description} onChange={e => setDescription(e.target.value)}></textarea>
                  </div>
                </div>

                <div className="panel-card">
                  <h4 className="panel-card-title">Images</h4>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input type="file" className="glass-input" style={{ padding: '0.6rem' }} multiple accept="image/*" onChange={e => setImages(e.target.files)} />
                    <small style={{ color: '#64748b', display: 'block', marginTop: '0.5rem' }}>Select one or more images (Cloudinary)</small>
                  </div>
                </div>

              </form>
            </div>

            <div className="side-panel-footer">
              <button type="button" className="glass-btn outline" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" form="add-product-form" className="glass-btn" disabled={loading}>
                {loading ? 'Saving...' : (editingId ? '✓ Save Changes' : '✓ Add Product')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="filter-bar">
        <div className="filter-group">
          <input 
            type="text" 
            placeholder="Search products by name..." 
            className="filter-input"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <select 
            className="filter-input" 
            style={{ maxWidth: '200px' }}
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
          Showing {filteredProducts.length} product(s)
        </div>
      </div>

      <div className="table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>MRP (₹)</th>
                <th>Selling Price (₹)</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '4rem', textAlign: 'center' }}>
                    <p style={{ color: '#475569', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>No products match your criteria.</p>
                  </td>
                </tr>
              ) : (
                currentProducts.map(prod => (
                  <tr key={prod._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {prod.images && prod.images.length > 0 ? (
                          <img src={prod.images[0]} alt={prod.name} className="table-product-image" />
                        ) : (
                          <div className="table-product-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#cbd5e1' }}>📦</div>
                        )}
                        <div>
                          <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.2rem' }}>{prod.name}</div>
                          {prod.originalPrice && prod.originalPrice > prod.price && (
                            <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: '700' }}>
                              {Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="table-category-tag">
                        {prod.category?.name || 'General'}
                      </span>
                    </td>
                    <td>
                      {prod.originalPrice ? (
                        <span style={{ color: '#94a3b8', textDecoration: 'line-through', fontWeight: '500' }}>
                          {prod.originalPrice.toLocaleString('en-IN')}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', color: '#0f172a' }}>
                        {prod.price?.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                        <span className={`table-stock-badge ${prod.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                          <span className="stock-dot"></span>
                          {prod.stock > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                          {prod.stock} units
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEdit(prod)} className="table-btn-action table-btn-edit">
                          <FiEdit2 /> Edit
                        </button>
                        <button onClick={() => handleDelete(prod._id)} className="table-btn-action table-btn-delete">
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="page-btn" 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page} 
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button 
              className="page-btn" 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              &gt;
            </button>
          </div>
        )}
    </div>
  );
};

export default AdminProducts;
