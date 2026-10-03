import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const AdminCarousel = () => {
  const { token } = useOutletContext();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badgeText: 'Trending',
    buttonText: 'Shop Now',
    buttonLink: '/#products',
    image: null
  });

  const fetchSlides = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/carousel/admin', {
        headers: { 'x-auth-token': token }
      });
      setSlides(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchSlides();
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
      data.append('title', formData.title);
      data.append('subtitle', formData.subtitle);
      data.append('badgeText', formData.badgeText);
      data.append('buttonText', formData.buttonText);
      data.append('buttonLink', formData.buttonLink);
      data.append('image', formData.image);

      await axios.post('http://localhost:5000/api/carousel', data, {
        headers: { 
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFormData({
        title: '', subtitle: '', badgeText: 'Trending', buttonText: 'Shop Now', buttonLink: '/#products', image: null
      });
      fetchSlides();
    } catch (err) {
      alert(err.response?.data?.error || 'Error adding slide');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/carousel/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchSlides();
    } catch (err) {
      alert('Error deleting slide');
    }
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-split-grid">
        <div className="form-card">
          <h3>Add New Carousel Slide</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Subtitle</label>
              <textarea name="subtitle" value={formData.subtitle} onChange={handleChange} required rows={3}></textarea>
            </div>
            <div className="form-group">
              <label>Badge Text</label>
              <input type="text" name="badgeText" value={formData.badgeText} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>Button Text</label>
                <input type="text" name="buttonText" value={formData.buttonText} onChange={handleChange} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Button Link</label>
                <input type="text" name="buttonLink" value={formData.buttonLink} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Slide Image</label>
              <input type="file" name="image" onChange={handleChange} required accept="image/*" />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Add Slide'}
            </button>
          </form>
        </div>

        <div className="table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slides.length === 0 ? (
                <tr><td colSpan="3">No slides found.</td></tr>
              ) : (
                slides.map(slide => (
                  <tr key={slide._id}>
                    <td>
                      <img src={slide.imageUrl} alt={slide.title} style={{ width: '80px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    </td>
                    <td>{slide.title}</td>
                    <td>
                      <button className="btn-delete" onClick={() => handleDelete(slide._id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCarousel;
