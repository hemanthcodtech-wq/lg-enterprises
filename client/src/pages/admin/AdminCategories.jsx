import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FiTag, FiFolder, FiPlus, FiTrash2, FiLayers } from 'react-icons/fi';

const AdminCategories = () => {
  const { token } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

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
      formData.append('description', description);
      if (image) {
        formData.append('image', image);
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/categories`,
        formData,
        { headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } }
      );
      setName('');
      setSlug('');
      setDescription('');
      setImage(null);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating category');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/categories/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchCategories();
    } catch (err) {
      alert('Error deleting category');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

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

        .category-split-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 2rem;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 900px) {
          .category-split-grid {
            grid-template-columns: 1fr;
          }
        }

        .glass-input {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.7rem 1rem;
          width: 100%;
          outline: none;
          font-family: inherit;
          font-size: 0.9rem;
          color: #0f172a;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }
        .glass-input:focus {
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .btn-indigo-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #4f46e5;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }
        .btn-indigo-submit:hover:not(:disabled) {
          background: #4338ca;
        }
        .btn-indigo-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-action-delete {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: #fee2e2;
          color: #b91c1c;
          border: none;
          border-radius: 6px;
          padding: 0.4rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-action-delete:hover {
          background: #f87171;
          color: white;
        }

        .cat-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          text-align: left;
        }
        .cat-table th {
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
        .cat-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
          font-size: 0.85rem;
          vertical-align: middle;
        }
        .cat-table tr:hover td {
          background: #f8fafc;
        }
        .cat-table tr:last-child td {
          border-bottom: none;
        }

        .cat-icon-chip {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(79, 70, 229, 0.1);
          color: #4f46e5;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          border: 1px solid rgba(79, 70, 229, 0.2);
        }

        .cat-slug-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.65rem;
          background: rgba(79, 70, 229, 0.08);
          color: #4f46e5;
          border: 1px solid rgba(79, 70, 229, 0.2);
          border-radius: 6px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.8rem;
          font-weight: 600;
        }
      `}</style>

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '0.5rem', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 0.25rem 0', fontWeight: '800', letterSpacing: '-0.5px' }}>Category Management</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Organize products into intuitive categories and clean URL slugs</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 1rem', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.25)', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5', boxShadow: '0 0 8px #4f46e5' }}></span>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#4f46e5', letterSpacing: '0.3px' }}>
            {categories.length} CATEGORIES LIVE
          </span>
        </div>
      </div>

      <div className="category-split-grid">
        {/* Left Form: Add Category */}
        <div className="glass-card" style={{ padding: '2rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
            <div className="cat-icon-chip">
              <FiTag />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>Add Category</h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Create a new product group</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                Category Name *
              </label>
              <input 
                type="text" 
                className="glass-input"
                placeholder="e.g. Electronics, Fashion"
                value={name} 
                onChange={e => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/ /g, '-'));
                }} 
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                Slug Identifier *
              </label>
              <input 
                type="text" 
                className="glass-input"
                placeholder="e.g. electronics"
                value={slug} 
                onChange={e => setSlug(e.target.value)} 
                required 
              />
              <small style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                Auto-generated URL identifier for routing
              </small>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                Description
              </label>
              <textarea 
                className="glass-input"
                placeholder="Category description..."
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows="3"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                Banner Image (Cloudinary)
              </label>
              <input 
                type="file" 
                className="glass-input"
                accept="image/*"
                onChange={e => setImage(e.target.files[0])} 
                style={{ padding: '0.5rem' }}
              />
            </div>

            <button type="submit" className="btn-indigo-submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
              <FiPlus style={{ fontSize: '1.15rem' }} />
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Right Table: Categories List */}
        <div className="glass-card">
          <div style={{ padding: '1.5rem 1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FiLayers style={{ color: '#4f46e5', fontSize: '1.2rem' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>Directory List</h3>
            </div>
            <div style={{ width: '220px' }}>
              <input 
                type="text" 
                className="glass-input" 
                style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
                placeholder="Search categories..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto', position: 'relative', zIndex: 1 }}>
            <table className="cat-table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Category Name</th>
                  <th style={{ width: '35%' }}>Slug Path</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map(cat => (
                  <tr key={cat._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                        ) : (
                          <div className="cat-icon-chip" style={{ width: '36px', height: '36px', fontSize: '0.95rem' }}>
                            <FiFolder />
                          </div>
                        )}
                        <div>
                          <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem', display: 'block' }}>{cat.name}</span>
                          {cat.description && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{cat.description.substring(0, 30)}{cat.description.length > 30 ? '...' : ''}</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="cat-slug-pill">
                        /{cat.slug}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDelete(cat._id)} className="btn-action-delete">
                        <FiTrash2 style={{ fontSize: '0.9rem' }} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📂</div>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem', color: '#475569' }}>No categories found</p>
                      <small style={{ color: '#94a3b8' }}>Try adjusting your search or add a new category on the left</small>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
