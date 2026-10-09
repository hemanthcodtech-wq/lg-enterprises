import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
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

const Products = () => {
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
  const dealsFilter    = params.get('deals') === 'true';
  const newFilter      = params.get('new') === 'true';
  const wholesaleFilter= params.get('wholesale') === 'true';
  const limitedFilter  = location.pathname === '/limited';

  useEffect(() => {
    // Fetch carousel
    axios.get(`${import.meta.env.VITE_API_URL}/carousel`)
      .then(res => setApiSlides(res.data))
      .catch(err => console.error('Error fetching carousel:', err));

    axios.get(`${import.meta.env.VITE_API_URL}/brands`)
      .then(res => setApiBrands(res.data))
      .catch(err => console.error('Error fetching brands:', err));

    axios.get(`${import.meta.env.VITE_API_URL}/categories`)
      .then(res => setApiCategories(res.data))
      .catch(err => console.error('Error fetching categories:', err));

    // Fetch products
    axios.get(`${import.meta.env.VITE_API_URL}/products`)
      .then(res => {
        const formatted = res.data.map(p => ({
          id: p._id,
          title: p.name,
          price: p.price,
          originalPrice: p.originalPrice || Math.round(p.price * 1.2),
          image: p.images?.[0] || 'https://via.placeholder.com/300',
          category: p.category?.name?.toLowerCase() || 'other',
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
    if (dealsFilter && p.discount < 25) return false;
    // mock 'new' by taking top products
    if (newFilter && p.discount > 10) return false; 
    // mock 'wholesale' by limiting to grocery or bulk
    if (wholesaleFilter && p.category !== 'grocery' && p.category !== 'electronics') return false; 
    
    if (limitedFilter && !p.tags.includes('Limited')) return false;

    if (activeTab !== 'All' && p.category !== activeTab.toLowerCase()) return false;
    return true;
  });

  return (
    <div>
      <div className="section-pad">
        <div className="section-title-row" style={{ flexWrap:'wrap', gap:'0.5rem', marginBottom:'1rem' }}>
          <h2 className="section-title">All Products</h2>
          <div className="featured-tabs">
            {['All', ...apiCategories.map(c => c.name)].map(t => (
              <button
                key={t}
                className={`featured-tab${activeTab === t ? ' active' : ''}`}
                onClick={() => setActiveTab(t)}
              >{t}</button>
            ))}
          </div>
        </div>



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

      {/* ─── Top Brands ─── */}
      {apiBrands.length > 0 && (
        <div className="brands-section">
          <div className="brands-header">
            <h2>Top Brands</h2>
            <button className="view-all-btn">Explore All <FiChevronRight /></button>
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

    </div>
  );
};

export default Products;
