import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiMessageCircle, FiCheckCircle } from 'react-icons/fi';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    role: 'Customer',
    message: '',
    rating: 5,
    isActive: true
  });
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/testimonials/admin`, {
        headers: { 'x-auth-token': token }
      });
      setTestimonials(res.data);
    } catch (err) {
      toast.error('Failed to load testimonials');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t) => {
    setFormData({
      id: t._id,
      name: t.name,
      role: t.role || 'Customer',
      message: t.message,
      rating: t.rating || 5,
      isActive: t.isActive
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${import.meta.env.VITE_API_URL}/testimonials/${id}`, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Testimonial deleted');
      fetchTestimonials();
    } catch (err) {
      toast.error('Failed to delete testimonial');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        name: formData.name,
        role: formData.role,
        message: formData.message,
        rating: Number(formData.rating),
        isActive: formData.isActive
      };

      if (formData.id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/testimonials/${formData.id}`, payload, {
          headers: { 'x-auth-token': token }
        });
        toast.success('Testimonial updated');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/testimonials`, payload, {
          headers: { 'x-auth-token': token }
        });
        toast.success('Testimonial added');
      }
      
      resetForm();
      fetchTestimonials();
    } catch (err) {
      toast.error('Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '', name: '', role: 'Customer', message: '', rating: 5, isActive: true
    });
  };

  return (
    <div className="admin-tab-content">
      <style>{`
        .admin-tab-content {
          position: relative;
          min-height: 100%;
        }

        .glass-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          position: relative;
          overflow: hidden;
        }

        .promo-split-grid {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 2rem;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 950px) {
          .promo-split-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 0.95rem;
          color: #1e293b;
          transition: 0.2s;
          background: #f8fafc;
        }
        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .promo-table-container {
          overflow-x: auto;
          width: 100%;
        }
        .promo-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }
        .promo-table th {
          background: #f8fafc;
          padding: 1rem 1.5rem;
          text-align: left;
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }
        .promo-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          font-size: 0.95rem;
          vertical-align: middle;
        }
        .promo-table tr:hover td {
          background: #f8fafc;
        }
        .promo-table tr:last-child td {
          border-bottom: none;
        }

        .active-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
          background: rgba(16, 185, 129, 0.12);
          color: #047857;
          border: 1px solid rgba(16, 185, 129, 0.28);
        }
        .inactive-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
          background: rgba(239, 68, 68, 0.12);
          color: #b91c1c;
          border: 1px solid rgba(239, 68, 68, 0.28);
        }

        .cat-icon-chip {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #f1f5f9;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          border: 1px solid #e2e8f0;
        }
      `}</style>

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '0.5rem', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 0.25rem 0', fontWeight: '800', letterSpacing: '-0.5px' }}>Manage Testimonials</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Showcase customer reviews on your store's homepage</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 1rem', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.25)', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5', boxShadow: '0 0 8px #4f46e5' }}></span>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#4f46e5', letterSpacing: '0.3px' }}>
            {testimonials.length} TOTAL REVIEWS
          </span>
        </div>
      </div>

      <div className="promo-split-grid">
        {/* Left Form: Create/Edit Testimonial */}
        <div className="glass-card" style={{ padding: '2rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
            <div className="cat-icon-chip">
              <FiMessageCircle />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>
                {formData.id ? 'Edit Testimonial' : 'New Testimonial'}
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Configure customer feedback</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                Customer Name *
              </label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. John Doe"
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                Role/Location
              </label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. Verified Buyer"
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                Review Message *
              </label>
              <textarea 
                className="form-input"
                rows="4"
                style={{ resize: 'vertical' }}
                placeholder="Write the customer's feedback here..."
                value={formData.message} 
                onChange={e => setFormData({...formData, message: e.target.value})} 
                required 
              ></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                  Rating (1-5) *
                </label>
                <input 
                  type="number" 
                  min="1" max="5" step="1"
                  className="form-input"
                  value={formData.rating} 
                  onChange={e => setFormData({...formData, rating: e.target.value})} 
                  required 
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                  />
                  Show Active
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              {formData.id && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  style={{ flex: 1, padding: '0.8rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" 
                disabled={saving}
                style={{ flex: formData.id ? 2 : 1, padding: '0.8rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)', fontSize: '0.9rem' }}
              >
                {saving ? 'Saving...' : formData.id ? 'Update Testimonial' : 'Add Testimonial'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Table: Active Testimonials */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem 1.5rem 1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '800' }}>Active Feedback</h3>
          </div>
          
          <div className="promo-table-container">
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading testimonials...</div>
            ) : testimonials.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: '#94a3b8' }}>
                  <FiMessageCircle size={28} />
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.1rem' }}>No testimonials yet</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Add your first customer review using the form.</p>
              </div>
            ) : (
              <table className="promo-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Feedback</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials.map(t => (
                    <tr key={t._id}>
                      <td style={{ width: '25%' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{t.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{t.role}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <span style={{ color: '#fbbf24', fontSize: '1rem', letterSpacing: '2px' }}>
                            {'★'.repeat(t.rating)}<span style={{ color: '#e2e8f0' }}>{'★'.repeat(5 - t.rating)}</span>
                          </span>
                          <span style={{ color: '#475569', fontSize: '0.85rem', lineHeight: '1.4', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            "{t.message}"
                          </span>
                        </div>
                      </td>
                      <td style={{ width: '15%' }}>
                        {t.isActive ? (
                          <span className="active-pill"><FiCheckCircle size={12}/> Active</span>
                        ) : (
                          <span className="inactive-pill">Hidden</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', width: '15%' }}>
                        <button 
                          onClick={() => handleEdit(t)} 
                          style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', marginRight: '0.3rem', transition: 'background 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
                          onMouseOut={e => e.currentTarget.style.background = 'none'}
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(t._id)} 
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', transition: 'background 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
                          onMouseOut={e => e.currentTarget.style.background = 'none'}
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTestimonials;
