import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const AdminCategories = () => {
  const { token } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        'http://localhost:5000/api/categories',
        { name, slug, image: '' },
        { headers: { 'x-auth-token': token } }
      );
      setName('');
      setSlug('');
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating category');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/categories/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchCategories();
    } catch (err) {
      alert('Error deleting category');
    }
  };

  return (
    <div className="admin-tab-content">
      
      <div className="admin-split-grid">
        <div className="form-card">
          <h3>Add New Category</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Category Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/ /g, '-'));
                }} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Slug URL</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Category'}
            </button>
          </form>
        </div>

        <div className="table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id}>
                  <td>{cat.name}</td>
                  <td>{cat.slug}</td>
                  <td>
                    <button onClick={() => handleDelete(cat._id)} className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center' }}>No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
