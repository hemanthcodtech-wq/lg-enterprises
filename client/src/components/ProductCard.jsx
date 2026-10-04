import React from 'react';
import { FiHeart, FiShoppingCart, FiCheckCircle } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, isLoading }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="product-card loading">
        <div className="pcard-img skeleton">
          <div className="skeleton-img"></div>
        </div>
        <div className="pcard-info">
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text short"></div>
          <div className="skeleton skeleton-text short" style={{ marginTop: '12px' }}></div>
          <div className="skeleton skeleton-btn"></div>
        </div>
      </div>
    );
  }

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    // Wishlist logic can go here later
  };

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="pcard-img">
        {product.discount && <span className="pcard-badge">{product.discount}% OFF</span>}
        <button className="pcard-wish" onClick={handleWishlist}><FiHeart /></button>
        <img
          src={product.image}
          alt={product.title}
          style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.4s ease' }}
          className="pcard-img-el"
          onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=Product'; }}
        />
      </div>
      
      <div className="pcard-info">
        <h4 className="pcard-title">{product.title}</h4>
        
        <div className="pcard-rating">
          <span className="stars">★★★★☆</span>
        </div>
        
        <div className="pcard-price">
          <span className="pcard-price-current">₹{product.price}</span>
          {product.oldPrice && <span className="pcard-price-old">₹{product.oldPrice}</span>}
        </div>
        
        <button className="pcard-btn" onClick={handleAdd}>
          <FiShoppingCart /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
