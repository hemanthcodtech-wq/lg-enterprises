import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import TestimonialSlider from '../components/TestimonialSlider';
import { ALL_PRODUCTS, CATEGORY_DATA } from '../utils/data';
import { IMAGES } from '../utils/images';
import {
  FiTruck, FiRefreshCcw, FiShield, FiCheckCircle,
  FiBox, FiMapPin, FiHeadphones, FiLayout, FiChevronRight,
  FiUsers, FiUserPlus, FiShare2, FiDollarSign
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
  const [apiBrands, setApiBrands] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [dbProducts, setDbProducts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryFilter = params.get('category') || '';
  const searchFilter   = params.get('search')   || '';

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/carousel`)
      .then(res => setApiSlides(res.data))
      .catch(err => console.error('Error fetching carousel:', err));

    axios.get(`${import.meta.env.VITE_API_URL}/brands`)
      .then(res => setApiBrands(res.data))
      .catch(err => console.error('Error fetching brands:', err));

    axios.get(`${import.meta.env.VITE_API_URL}/categories`)
      .then(res => setApiCategories(res.data))
      .catch(err => console.error('Error fetching categories:', err));

    axios.get(`${import.meta.env.VITE_API_URL}/products`)
      .then(res => {
        const formatted = res.data.map(p => ({
          id: p._id,
          title: p.name,
          price: p.price,
          originalPrice: p.originalPrice || Math.round(p.price * 1.2),
          image: p.images?.[0] || 'https://via.placeholder.com/300',
          category: p.category?.slug || p.category?.name?.toLowerCase() || 'other',
          discount: p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
          tags: p.tags || [],
          rating: 4.5,
          reviews: Math.floor(Math.random() * 200) + 10
        }));
        setDbProducts(formatted);
      })
      .catch(err => console.error('Error fetching products:', err));
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
  const visibleProducts = dbProducts.filter(p => {
    if (categoryFilter && p.category !== categoryFilter) return false;
    if (searchFilter && !p.title.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    if (activeTab !== 'All' && p.category !== activeTab.toLowerCase()) return false;
    return true;
  });

  const dealProducts = dbProducts.filter(p => p.tags.includes('Deal of the Day'));
  const trendingProducts = dbProducts.filter(p => p.tags.includes('Trending'));
  const topSellingProducts = dbProducts.filter(p => p.tags.includes('Top Seller'));
  const limitedProducts = dbProducts.filter(p => p.tags.includes('Limited'));
  const slide = activeCarousel[slideIdx % activeCarousel.length];

  return (
    <div>
      {/* ─── Category Banner (when a category is selected) ─── */}
      {categoryFilter && apiCategories.find(c => c.slug === categoryFilter) && (() => {
        const catData = apiCategories.find(c => c.slug === categoryFilter);
        return (
          <div className="category-banner-bar" style={{
            backgroundImage: `url(${catData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80'})`,
          }}>
            <div className="category-banner-overlay">
              <h2>{catData.name}</h2>
              <p>{catData.description || 'Explore our wide range of products'}</p>
            </div>
          </div>
        );
      })()}

      {/* ─── Hero (only on home) ─── */}
      {!categoryFilter && !searchFilter && (
        <>
          <div className="hero-layout">
            <div className="hero-main dark-hero" style={{ 
              backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.4) 100%), url(${slide.bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
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
          <div className="section-pad" style={{ paddingTop: '3rem' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '2.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Top Category
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div className="cat-img-tiles">
                {apiCategories.map((c, i) => (
                  <div key={i} className="cat-img-tile" onClick={() => navigate(`/?category=${c.slug}`)}>
                    <div className="cat-img-bg" style={{ backgroundImage: `url(${c.image || 'https://via.placeholder.com/300'})` }}>
                      <div className="cat-img-overlay"></div>
                    </div>
                    <div className="cat-img-label">{c.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Deals of the Day ─── */}
          <div className="deals-section">
            <div className="deals-header">
              <h2 className="section-title">
                ⚡ Deals of the Day
              </h2>
              <button className="view-all-btn" onClick={() => navigate('/products')}>View All Deals <FiChevronRight /></button>
            </div>
            <div className="products-row">
              {dealProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>

          {/* ─── Limited Edition ─── */}
          <div className="deals-section" style={{ marginTop: '3rem' }}>
            <div className="deals-header">
              <h2 className="section-title">
                ⏳ Limited Edition
              </h2>
              <button className="view-all-btn" onClick={() => navigate('/products')}>View All <FiChevronRight /></button>
            </div>
            <div className="products-row">
              {limitedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>

          {/* ─── Trending Now ─── */}
          <div className="deals-section" style={{ marginTop: '3rem' }}>
            <div className="deals-header">
              <h2 className="section-title">
                🔥 Trending Now
              </h2>
              <button className="view-all-btn" onClick={() => navigate('/products')}>View All <FiChevronRight /></button>
            </div>
            <div className="products-row">
              {trendingProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>

          {/* ─── Top Selling ─── */}
          <div className="deals-section" style={{ marginTop: '3rem' }}>
            <div className="deals-header">
              <h2 className="section-title">
                🏆 Top Selling
              </h2>
              <button className="view-all-btn" onClick={() => navigate('/products')}>View All <FiChevronRight /></button>
            </div>
            <div className="products-row">
              {topSellingProducts.map(p => <ProductCard key={p.id} product={p} />)}
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
              {['All', ...apiCategories.map(c => c.name)].map(t => (
                <button
                  key={t}
                  className={`featured-tab${activeTab === t ? ' active' : ''}`}
                  onClick={() => setActiveTab(t)}
                >{t}</button>
              ))}
            </div>
            <button className="view-all-btn" onClick={() => navigate('/products')}>View All <FiChevronRight /></button>
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
            {visibleProducts.slice(0, 10).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="empty-state">
            <p>😕 No products found</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Browse All Products</button>
          </div>
        )}
      </div>

      {/* ─── Top Brands ─── */}
      {apiBrands.length > 0 && (
        <div className="brands-section">
          <div className="brands-header">
            <h2>Top Brands</h2>
            <button className="view-all-btn" onClick={() => navigate('/products')}>Explore All <FiChevronRight /></button>
          </div>
          <div className="brands-marquee-wrapper">
            <div className="brands-marquee">
              {apiBrands.map((brand, i) => (
                <div key={brand._id} className="brand-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={brand.imageUrl} alt={brand.name} style={{ maxWidth: '100%', maxHeight: '60px', objectFit: 'contain' }} />
                </div>
              ))}
              {/* Duplicate for seamless scrolling */}
              {apiBrands.map((brand, i) => (
                <div key={`dup-${brand._id}`} className="brand-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={brand.imageUrl} alt={brand.name} style={{ maxWidth: '100%', maxHeight: '60px', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Partner Section ─── */}
      <div className="partner-section">
        <div className="partner-content">
          <h2>Become a partner in <span>3 easy steps</span></h2>
          <div className="partner-stats">
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <FiUsers size={24} color="#64748b" /> 20,954 +
            </div>
            <span>Ours Team</span>
          </div>

          <div className="partner-steps">
            <div className="step-connector">
              <div className="step-connector-fill"></div>
            </div>
            <div className="partner-step">
              <div className="step-number">1</div>
              <div className="step-title"><FiUserPlus /> Sign up</div>
              <p className="step-desc">Create your Agent account instantly with zero upfront investment.</p>
            </div>
            <div className="partner-step">
              <div className="step-number">2</div>
              <div className="step-title"><FiShare2 /> Share Links</div>
              <p className="step-desc">Get unique referral links and share them with your network easily.</p>
            </div>
            <div className="partner-step">
              <div className="step-number">3</div>
              <div className="step-title"><FiDollarSign /> Earn</div>
              <p className="step-desc">Get paid commissions directly to your account for every successful purchase.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Testimonial Slider (Positioned at bottom on top of Footer) ─── */}
      <TestimonialSlider />

    </div>
  );
};

export default Home;
