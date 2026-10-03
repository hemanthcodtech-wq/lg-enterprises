import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const AdminProducts = () => {
  const { token } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

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
        'http://localhost:5000/api/products',
        { 
          name, slug, price: Number(price), stock: Number(stock), category, description 
        },
        { headers: { 'x-auth-token': token } }
      );
      // Reset form
      setName(''); setSlug(''); setPrice(''); setStock(''); setCategory(''); setDescription('');
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating product');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchProducts();
    } catch (err) {
      alert('Error deleting product');
    }
  };

  return (
    <div className="admin-tab-content">
      
      <div className="admin-stack-grid">
        <div className="form-card">
          <h3>Add New Product</h3>
          <form onSubmit={handleSubmit} className="admin-form admin-form-grid">
            <div className="form-group">
              <label>Product Name</label>
              <input type="text" value={name} onChange={e => {
                setName(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/ /g, '-'));
              }} required />
            </div>
            
            <div className="form-group">
              <label>Slug</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Stock Quantity</label>
              <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} required />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} required>
                <option value="">Select a Category</option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Description</label>
              <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)}></textarea>
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>

        <div className="table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod._id}>
                  <td>
                    <strong>{prod.name}</strong><br/>
                    <small style={{ color: '#64748b' }}>{prod.slug}</small>
                  </td>
                  <td>{prod.category?.name || 'Unknown'}</td>
                  <td>₹{prod.price}</td>
                  <td>
                    <span className={`status-badge ${prod.stock > 0 ? 'success' : 'pending'}`}>
                      {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(prod._id)} className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
