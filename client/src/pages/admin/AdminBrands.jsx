import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FiImage, FiPlus, FiTrash2, FiTag, FiSearch, FiCheck, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AdminBrands = () => {
  const { token } = useOutletContext();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', image: null });
  
  // Filtering & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/brands/admin`, {
        headers: { 'x-auth-token': token }
      });
      setBrands(res.data);
    } catch (err) {
      console.error('Failed to fetch brands', err);
    }
  };

  useEffect(() => {
    if (token) fetchBrands();
  }, [token]);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('image', formData.image);

      await axios.post(`${import.meta.env.VITE_API_URL}/brands`, data, {
        headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData({ name: '', image: null });
      if (document.getElementById('brand-image')) document.getElementById('brand-image').value = '';
      fetchBrands();
    } catch (err) {
      alert(err.response?.data?.error || 'Error adding brand');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this brand?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/brands/${id}`, { headers: { 'x-auth-token': token } });
      fetchBrands();
    } catch (err) {
      alert('Error deleting brand');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/brands/${id}/toggle`, {}, { headers: { 'x-auth-token': token } });
      fetchBrands();
    } catch (err) {
      alert('Error updating brand status');
    }
  };

  const filteredBrands = useMemo(() => {
    return brands.filter(brand => {
      const matchesSearch = brand.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' 
        ? true 
        : statusFilter === 'Active' ? brand.isActive : !brand.isActive;
      return matchesSearch && matchesStatus;
    });
  }, [brands, search, statusFilter]);

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const currentBrands = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBrands.slice(start, start + itemsPerPage);
  }, [filteredBrands, currentPage]);

  return (
    <div className="admin-tab-content">
      <style>{`
        .admin-tab-content { position: relative; min-height: 100%; }
        .glass-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02); overflow: hidden; }
        .carousel-split-grid { display: grid; grid-template-columns: 350px 1fr; gap: 2rem; align-items: start; }
        @media (max-width: 900px) { .carousel-split-grid { grid-template-columns: 1fr; } }
        .form-group { margin-bottom: 1.25rem; }
        .form-label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }
        .form-input { width: 100%; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; color: #1e293b; transition: all 0.2s; background: #f8fafc; }
        .form-input:focus { outline: none; border-color: #4f46e5; background: #ffffff; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
        .btn-primary { width: 100%; padding: 0.875rem; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; display: flex; justify-content: center; align-items: center; gap: 0.5rem; }
        .btn-primary:hover { background: #4338ca; }
        .slides-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem; }
        .slide-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
        .slide-card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .slide-image { width: 100%; height: 140px; object-fit: contain; background: #f8fafc; padding: 1rem; }
        .slide-content { padding: 1rem; flex: 1; }
        .slide-title { font-weight: 700; color: #1e293b; margin: 0 0 0.25rem 0; font-size: 1.05rem; }
        .slide-actions { padding: 1rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; background: #f8fafc; align-items: center; }
        .btn-action { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .btn-delete { background: #fee2e2; color: #ef4444; }
        .btn-delete:hover { background: #fecaca; }
        .btn-toggle-active { background: #dcfce7; color: #166534; }
        .btn-toggle-inactive { background: #f1f5f9; color: #64748b; }
        .filter-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: center; flex-wrap: wrap; }
      `}</style>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', margin: '0 0 0.5rem 0' }}>Top Brands</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>Upload and manage brand logos displayed on the homepage.</p>
      </div>

      <div className="carousel-split-grid">
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiPlus style={{ color: '#4f46e5' }} /> Add New Brand
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Brand Name</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange} 
                placeholder="e.g. Samsung" className="form-input" required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Brand Logo (Image)</label>
              <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', background: '#f8fafc', position: 'relative', cursor: 'pointer' }}>
                <input 
                  type="file" name="image" id="brand-image" onChange={handleChange} accept="image/*"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} required
                />
                <FiImage style={{ fontSize: '2rem', color: '#94a3b8', marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>
                  {formData.image ? formData.image.name : 'Click or drag image'}
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Uploading...' : 'Save Brand'}
            </button>
          </form>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiTag style={{ color: '#4f46e5' }} /> Manage Brands
            </h2>
            <div className="filter-bar" style={{ margin: 0 }}>
              <div style={{ position: 'relative' }}>
                <FiSearch style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                <input 
                  type="text" placeholder="Search brands..." 
                  value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  style={{ padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                />
              </div>
              <select 
                value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', background: 'white' }}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          {filteredBrands.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <FiImage style={{ fontSize: '3rem', color: '#cbd5e1', margin: '0 auto 1rem auto' }} />
              <h3 style={{ color: '#475569', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>No Brands Found</h3>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Try adjusting your filters or add a new brand.</p>
            </div>
          ) : (
            <>
              <div className="slides-grid">
                {currentBrands.map(brand => (
                  <div key={brand._id} className="slide-card">
                    <img src={brand.imageUrl} alt={brand.name} className="slide-image" />
                    <div className="slide-content">
                      <h3 className="slide-title">{brand.name}</h3>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', background: brand.isActive ? '#dcfce7' : '#f1f5f9', color: brand.isActive ? '#166534' : '#64748b' }}>
                        {brand.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="slide-actions">
                      <button 
                        onClick={() => handleToggleStatus(brand._id)} 
                        className={`btn-action ${brand.isActive ? 'btn-toggle-active' : 'btn-toggle-inactive'}`}
                      >
                        {brand.isActive ? <FiCheck /> : <FiX />} {brand.isActive ? 'Active' : 'Hidden'}
                      </button>
                      <button onClick={() => handleDelete(brand._id)} className="btn-action btn-delete">
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBrands.length)} of {filteredBrands.length} brands
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#94a3b8' : '#1e293b' }}
                    >
                      <FiChevronLeft />
                    </button>
                    <span style={{ padding: '6px 12px', border: '1px solid #4f46e5', background: '#eef2ff', color: '#4f46e5', borderRadius: '6px', fontWeight: 600 }}>
                      {currentPage}
                    </span>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: currentPage >= totalPages ? '#f8fafc' : 'white', borderRadius: '6px', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', color: currentPage >= totalPages ? '#94a3b8' : '#1e293b' }}
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBrands;
