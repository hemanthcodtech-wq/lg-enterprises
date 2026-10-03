import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { ALL_PRODUCTS, CATEGORY_DATA } from '../utils/data';
import { IMAGES } from '../utils/images';
import {
  FiTruck, FiRefreshCcw, FiShield, FiCheckCircle,
  FiBox, FiMapPin, FiHeadphones, FiLayout, FiChevronRight
} from 'react-icons/fi';

const catTiles = [
  { name:'Electronics',      slug:'electronics', img: IMAGES.electronics },
  { name:'Furniture',        slug:'furniture',   img: IMAGES.furniture   },
  { name:'Grocery',          slug:'grocery',     img: IMAGES.grocery     },
  { name:'Cloth & Fashion',  slug:'fashion',     img: IMAGES.fashion     },
  { name:'Home & Kitchen',   slug:'kitchen',     img: IMAGES.kitchen     },
  { name:'Beauty & Care',    slug:'beauty',      img: IMAGES.beauty      },
];

const features = [
  { icon:<FiTruck/>,       title:'Free Shipping',     sub:'On orders above ₹499' },
  { icon:<FiRefreshCcw/>,  title:'Easy Returns',      sub:'7 Days Return Policy'  },
  { icon:<FiShield/>,      title:'Secure Payments',   sub:'UPI, Cards, COD'       },
  { icon:<FiCheckCircle/>, title:'Genuine Products',  sub:'100% Authentic'        },
  { icon:<FiLayout/>,      title:'Wide Variety',      sub:'All Categories'        },
  { icon:<FiBox/>,         title:'Retail & Wholesale',sub:'Best Prices'           },
  { icon:<FiMapPin/>,      title:'Physical Store',    sub:'Visit & Shop'          },
  { icon:<FiHeadphones/>,  title:'24/7 Support',      sub:"We're Here to Help"    },
];

const heroSlides = [
  {
    bg: IMAGES.hero1,
    tag: '⚡ Mega Sale — Up to 50% OFF',
    heading: <>Everything You Need<br/><span>Under One Roof</span></>,
    sub: 'Electronics · Furniture · Grocery · Clothing & much more — delivered to your door.',
    cta: 'Shop Now',
    cta2: 'View Deals',
  },
  {
    bg: IMAGES.hero2,
    tag: '🛒 Fresh Grocery Daily',
    heading: <>Freshness You Can<br/><span>Trust Every Day</span></>,
    sub: 'Farm-fresh produce, staples & daily essentials at the best prices.',
    cta: 'Shop Grocery',
    cta2: 'View Offers',
  },
];

const featuredTabs = ['All','Electronics','Furniture','Grocery','Fashion','Appliances'];

const Home = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [slideIdx, setSlideIdx] = useState(0);
  const [apiSlides, setApiSlides] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryFilter = params.get('category') || '';
  const searchFilter   = params.get('search')   || '';

  useEffect(() => {
    axios.get('http://localhost:5000/api/carousel')
      .then(res => setApiSlides(res.data))
      .catch(err => console.error('Error fetching carousel:', err));
  }, []);

  const activeCarousel = apiSlides.length > 0 ? apiSlides.map(s => ({
    bg: s.imageUrl,
    tag: s.badgeText,
    heading: <span>{s.title}</span>,
    sub: s.subtitle,
    cta: s.buttonText,
    cta2: 'View Deals'
  })) : heroSlides;

  // Auto-advance hero carousel
  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % activeCarousel.length), 4500);
    return () => clearInterval(t);
  }, [activeCarousel.length]);

  // Derive visible products
  const visibleProducts = ALL_PRODUCTS.filter(p => {
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (searchFilter && !p.title.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    if (activeTab !== 'All' && p.category !== activeTab.toLowerCase()) return false;
    return true;
  });

  const dealProducts = ALL_PRODUCTS.filter(p => p.discount >= 25);
  const slide = activeCarousel[slideIdx % activeCarousel.length];

  return (
    <div>
      {/* ─── Category Banner (when a category is selected) ─── */}
      {categoryFilter && CATEGORY_DATA[categoryFilter] && (
        <div className="category-banner-bar" style={{
          backgroundImage: `url(${CATEGORY_DATA[categoryFilter].image})`,
        }}>
          <div className="category-banner-overlay">
            <h2>{CATEGORY_DATA[categoryFilter].label}</h2>
            <p>{CATEGORY_DATA[categoryFilter].desc}</p>
          </div>
        </div>
      )}

      {/* ─── Hero (only on home) ─── */}
      {!categoryFilter && !searchFilter && (
        <>
          <div className="hero-layout">
            <div className="hero-main" style={{ backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 40%, rgba(255, 255, 255, 0) 100%), url(${slide.bg})` }}>
              <div className="hero-content">
                <div className="hero-tag">{slide.tag}</div>
                <h1>{slide.heading}</h1>
                <p>{slide.sub}</p>
                <div className="hero-cta">
                  <button className="btn-primary" onClick={() => navigate('/?category=electronics')}>
                    {slide.cta} <FiChevronRight />
                  </button>
                  <button className="btn-outline-primary" onClick={() => navigate('/?deals=true')}>
                    {slide.cta2}
                  </button>
                </div>
              </div>
              <div className="carousel-dots-hero">
                {heroSlides.map((_, i) => (
                  <span key={i} className={`dot ${i === slideIdx ? 'active' : ''}`} onClick={() => setSlideIdx(i)} />
                ))}
              </div>
            </div>
          </div>



          {/* ─── Category Image Tiles ─── */}
          <div className="section-pad">
            <div className="section-title-row">
              <h2 className="section-title">Shop by Category <span className="section-title-badge">NEW</span></h2>
              <button className="view-all-btn">View All <FiChevronRight /></button>
            </div>
            <div className="cat-img-tiles">
              {catTiles.map((c, i) => (
                <div key={i} className="cat-img-tile" onClick={() => navigate(`/?category=${c.slug}`)}>
                  <img src={c.img} alt={c.name} />
                  <div className="cat-img-label">{c.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Deals of the Day ─── */}
          <div className="deals-section">
            <div className="deals-header">
              <h2 className="section-title">
                ⚡ Deals of the Day
              </h2>
              <button className="view-all-btn">View All Deals <FiChevronRight /></button>
            </div>
            <div className="products-row">
              {dealProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>

          {/* ─── Promo Banners ─── */}
          <div className="promo-grid">
            <div className="promo-card promo-card-blue" style={{ backgroundImage: `url(${IMAGES.electronics})`, backgroundSize:'cover', backgroundPosition:'center' }}>
              <div className="promo-overlay">
                <h3>Latest Electronics</h3>
                <p>Smart Technology for a Smarter Life</p>
                <div className="promo-actions">
                  <button className="btn-promo-yellow">Up to 50% OFF</button>
                  <button className="btn-promo-dark" onClick={() => navigate('/?category=electronics')}>Shop Electronics →</button>
                </div>
              </div>
            </div>
            <div className="promo-card promo-card-brown" style={{ backgroundImage: `url(${IMAGES.furniture})`, backgroundSize:'cover', backgroundPosition:'center' }}>
              <div className="promo-overlay">
                <h3>Premium Furniture</h3>
                <p>Style Your Home Beautifully</p>
                <div className="promo-actions">
                  <button className="btn-promo-yellow">Up to 40% OFF</button>
                  <button className="btn-promo-dark" onClick={() => navigate('/?category=furniture')}>Shop Furniture →</button>
                </div>
              </div>
            </div>
            <div className="promo-card promo-card-green" style={{ backgroundImage: `url(${IMAGES.grocery})`, backgroundSize:'cover', backgroundPosition:'center' }}>
              <div className="promo-overlay">
                <h3>Fresh Groceries</h3>
                <p>Daily Essentials at Best Prices</p>
                <div className="promo-actions">
                  <button className="btn-promo-yellow">Up to 30% OFF</button>
                  <button className="btn-promo-dark" onClick={() => navigate('/?category=grocery')}>Shop Grocery →</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── Products (filterable) ─── */}
      <div className="section-pad">
        {!categoryFilter && !searchFilter && (
          <div className="section-title-row" style={{ flexWrap:'wrap', gap:'0.5rem', marginBottom:'1rem' }}>
            <h2 className="section-title">👑 Featured Products</h2>
            <div className="featured-tabs">
              {featuredTabs.map(t => (
                <button
                  key={t}
                  className={`featured-tab${activeTab === t ? ' active' : ''}`}
                  onClick={() => setActiveTab(t)}
                >{t}</button>
              ))}
            </div>
            <button className="view-all-btn">View All <FiChevronRight /></button>
          </div>
        )}

        {(categoryFilter || searchFilter) && (
          <div className="section-title-row" style={{ marginBottom:'1rem' }}>
            <h2 className="section-title">
              {searchFilter ? `Search results for "${searchFilter}"` : CATEGORY_DATA[categoryFilter]?.label}
              <span style={{ fontSize:'0.9rem', fontWeight:500, color:'var(--text-muted)', marginLeft:'0.8rem' }}>({visibleProducts.length} products)</span>
            </h2>
            <button className="view-all-btn" onClick={() => navigate('/')}>← Back to All</button>
          </div>
        )}

        {visibleProducts.length > 0 ? (
          <div className="products-grid">
            {visibleProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="empty-state">
            <p>😕 No products found</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Browse All Products</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
