import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  LuCrown, LuTrophy, LuMedal, LuFlame, LuMagnet, LuRadar,
  LuPackageX, LuPackageCheck, LuBoxes, LuLayers, LuChartColumnIncreasing,
  LuChartPie, LuTrendingUp, LuTrendingDown, LuTriangleAlert, LuShieldAlert,
  LuSparkles, LuStar, LuArrowUpRight, LuFilter, LuSearch,
  LuSlidersHorizontal, LuChevronsLeft, LuChevronsRight, LuChevronLeft,
  LuChevronRight, LuArrowUpDown, LuShoppingBag, LuEye, LuRefreshCw,
  LuDownload, LuCircleCheck, LuCircleX, LuClock, LuZap, LuActivity,
  LuAward, LuTag, LuX
} from 'react-icons/lu';
import { FaRupeeSign } from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import * as XLSX from 'xlsx';

const AdminInventoryAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('all'); // 'all', '7d', '30d', '90d'
  const [activeTab, setActiveTab] = useState('categories'); // 'categories', 'bestsellers', 'attraction', 'deadstock', 'allproducts'

  // ─── 1. Category Tab: Search, Filter, Sort, Pagination ───
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'top2', 'least2', 'compare', 'active', 'coming_soon'
  const [categorySearch, setCategorySearch] = useState('');
  const [categorySort, setCategorySort] = useState('revenue_desc');
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryPageSize, setCategoryPageSize] = useState(4); // 2, 4, 6, 0 (all)

  // ─── 2. Bestsellers Tab: Filter, Search, Sort, Pagination ───
  const [bestsellerFilter, setBestsellerFilter] = useState('all'); // 'all', 'top2', 'least2', 'compare'
  const [bestsellerCategory, setBestsellerCategory] = useState('all');
  const [bestsellerStatus, setBestsellerStatus] = useState('all');
  const [bestsellerSearch, setBestsellerSearch] = useState('');
  const [bestsellerSort, setBestsellerSort] = useState('units_desc');
  const [bestsellerPage, setBestsellerPage] = useState(1);
  const [bestsellerPageSize, setBestsellerPageSize] = useState(5);

  // ─── 3. Customer Attraction Radar Tab: Filter, Search, Sort, Pagination ───
  const [attractionSearch, setAttractionSearch] = useState('');
  const [attractionCategory, setAttractionCategory] = useState('all');
  const [attractionSort, setAttractionSort] = useState('score_desc');
  const [attractionPage, setAttractionPage] = useState(1);
  const [attractionPageSize, setAttractionPageSize] = useState(6);

  // ─── 4. Dead Stock Tab: Filter, Search, Sort, Pagination ───
  const [deadStockCategory, setDeadStockCategory] = useState('all');
  const [deadStockSearch, setDeadStockSearch] = useState('');
  const [deadStockSort, setDeadStockSort] = useState('capital_desc');
  const [deadStockPage, setDeadStockPage] = useState(1);
  const [deadStockPageSize, setDeadStockPageSize] = useState(5);

  // ─── 5. All Products Tab: Search, Filters, Sort, Pagination ───
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('sold_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchInventoryAnalysis = useCallback(async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/inventory-analysis?timeRange=${timeRange}`, {
        headers: { 'x-auth-token': token }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load inventory analysis:', err);
      toast.error('Failed to load inventory analysis data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchInventoryAnalysis();
  }, [fetchInventoryAnalysis]);

  // Export full inventory analysis to Excel
  const handleExportExcel = () => {
    if (!data || !data.allProducts) return;
    try {
      const exportRows = data.allProducts.map(p => ({
        'Product Name': p.name,
        'Category': p.category?.name || 'Uncategorized',
        'Price (₹)': p.price,
        'Stock Count': p.stock,
        'Stock Status': p.stockStatus?.toUpperCase(),
        'Tied Capital (₹)': p.tiedCapital,
        'Units Sold': p.unitsSold,
        'Total Revenue (₹)': p.revenue,
        'Order Count': p.orderCount,
        'Views': p.views,
        'Rating': p.rating,
        'Review Count': p.numReviews,
        'Conversion Rate (%)': `${p.conversionRate}%`
      }));

      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inventory Stats');
      XLSX.writeFile(wb, `LG_Inventory_Analysis_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Inventory report exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Export failed');
    }
  };

  const { summary, topCategories, topSellingProducts, neverOrderedProducts, mostAttractedProducts, highInterestLowConversion } = data || {};

  // ─── Top 2 and Least 2 Categories ───
  const top2Categories = useMemo(() => {
    if (!topCategories || topCategories.length === 0) return [];
    return topCategories.slice(0, 2);
  }, [topCategories]);

  const least2Categories = useMemo(() => {
    if (!topCategories || topCategories.length <= 2) return [];
    return [...topCategories].slice(-2).reverse();
  }, [topCategories]);

  // ─── Filtered & Paginated Categories ───
  const filteredCategories = useMemo(() => {
    if (!topCategories) return [];
    let list = [...topCategories];

    if (categoryFilter === 'top2') {
      list = list.slice(0, 2);
    } else if (categoryFilter === 'least2') {
      list = list.slice(-2).reverse();
    } else if (categoryFilter === 'compare') {
      const top2 = list.slice(0, 2);
      const least2 = list.slice(-2).reverse();
      const seen = new Set();
      list = [...top2, ...least2].filter(c => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
    } else if (categoryFilter === 'active') {
      list = list.filter(c => c.status !== 'coming_soon');
    } else if (categoryFilter === 'coming_soon') {
      list = list.filter(c => c.status === 'coming_soon');
    }

    if (categorySearch.trim()) {
      list = list.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase().trim()));
    }

    if (categorySort === 'revenue_desc') {
      list.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } else if (categorySort === 'revenue_asc') {
      list.sort((a, b) => a.totalRevenue - b.totalRevenue);
    } else if (categorySort === 'sold_desc') {
      list.sort((a, b) => b.totalSold - a.totalSold);
    } else if (categorySort === 'stock_desc') {
      list.sort((a, b) => b.totalStock - a.totalStock);
    } else if (categorySort === 'capital_desc') {
      list.sort((a, b) => b.tiedCapital - a.tiedCapital);
    }

    return list;
  }, [topCategories, categoryFilter, categorySearch, categorySort]);

  const totalCategoryPages = categoryPageSize === 0 ? 1 : (Math.ceil(filteredCategories.length / categoryPageSize) || 1);
  const paginatedCategories = useMemo(() => {
    if (categoryPageSize === 0) return filteredCategories;
    const start = (categoryPage - 1) * categoryPageSize;
    return filteredCategories.slice(start, start + categoryPageSize);
  }, [filteredCategories, categoryPage, categoryPageSize]);

  // ─── Filtered & Paginated Bestsellers ───
  const filteredBestsellers = useMemo(() => {
    if (!topSellingProducts) return [];
    let list = [...topSellingProducts];

    if (bestsellerFilter === 'top2') {
      list = list.slice(0, 2);
    } else if (bestsellerFilter === 'least2') {
      list = list.slice(-2).reverse();
    } else if (bestsellerFilter === 'compare') {
      const top2 = list.slice(0, 2);
      const least2 = list.slice(-2).reverse();
      const seen = new Set();
      list = [...top2, ...least2].filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    }

    if (bestsellerCategory !== 'all') {
      list = list.filter(p => p.category?.id === bestsellerCategory);
    }

    if (bestsellerStatus === 'in_stock') {
      list = list.filter(p => p.stock > 5);
    } else if (bestsellerStatus === 'low_stock') {
      list = list.filter(p => p.stock > 0 && p.stock <= 5);
    } else if (bestsellerStatus === 'out_of_stock') {
      list = list.filter(p => p.stock <= 0);
    }

    if (bestsellerSearch.trim()) {
      list = list.filter(p => p.name.toLowerCase().includes(bestsellerSearch.toLowerCase().trim()));
    }

    if (bestsellerSort === 'units_desc') {
      list.sort((a, b) => b.unitsSold - a.unitsSold);
    } else if (bestsellerSort === 'revenue_desc') {
      list.sort((a, b) => b.revenue - a.revenue);
    } else if (bestsellerSort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (bestsellerSort === 'stock_desc') {
      list.sort((a, b) => b.stock - a.stock);
    }

    return list;
  }, [topSellingProducts, bestsellerFilter, bestsellerCategory, bestsellerStatus, bestsellerSearch, bestsellerSort]);

  const totalBestsellerPages = bestsellerPageSize === 0 ? 1 : (Math.ceil(filteredBestsellers.length / bestsellerPageSize) || 1);
  const paginatedBestsellers = useMemo(() => {
    if (bestsellerPageSize === 0) return filteredBestsellers;
    const start = (bestsellerPage - 1) * bestsellerPageSize;
    return filteredBestsellers.slice(start, start + bestsellerPageSize);
  }, [filteredBestsellers, bestsellerPage, bestsellerPageSize]);

  // ─── Filtered & Paginated Attraction Radar ───
  const filteredAttraction = useMemo(() => {
    if (!mostAttractedProducts) return [];
    let list = [...mostAttractedProducts];

    if (attractionCategory !== 'all') {
      list = list.filter(p => p.category?.id === attractionCategory);
    }

    if (attractionSearch.trim()) {
      list = list.filter(p => p.name.toLowerCase().includes(attractionSearch.toLowerCase().trim()));
    }

    if (attractionSort === 'score_desc') {
      list.sort((a, b) => b.attractionScore - a.attractionScore);
    } else if (attractionSort === 'views_desc') {
      list.sort((a, b) => b.views - a.views);
    } else if (attractionSort === 'rating_desc') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (attractionSort === 'sold_desc') {
      list.sort((a, b) => b.unitsSold - a.unitsSold);
    }

    return list;
  }, [mostAttractedProducts, attractionCategory, attractionSearch, attractionSort]);

  const totalAttractionPages = attractionPageSize === 0 ? 1 : (Math.ceil(filteredAttraction.length / attractionPageSize) || 1);
  const paginatedAttraction = useMemo(() => {
    if (attractionPageSize === 0) return filteredAttraction;
    const start = (attractionPage - 1) * attractionPageSize;
    return filteredAttraction.slice(start, start + attractionPageSize);
  }, [filteredAttraction, attractionPage, attractionPageSize]);

  // ─── Filtered & Paginated Dead Stock ───
  const filteredDeadStock = useMemo(() => {
    if (!neverOrderedProducts) return [];
    let list = [...neverOrderedProducts];

    if (deadStockCategory !== 'all') {
      list = list.filter(p => p.category?.id === deadStockCategory);
    }

    if (deadStockSearch.trim()) {
      list = list.filter(p => p.name.toLowerCase().includes(deadStockSearch.toLowerCase().trim()));
    }

    if (deadStockSort === 'capital_desc') {
      list.sort((a, b) => b.tiedCapital - a.tiedCapital);
    } else if (deadStockSort === 'stock_desc') {
      list.sort((a, b) => b.stock - a.stock);
    } else if (deadStockSort === 'views_desc') {
      list.sort((a, b) => b.views - a.views);
    } else if (deadStockSort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [neverOrderedProducts, deadStockCategory, deadStockSearch, deadStockSort]);

  const totalDeadStockPages = deadStockPageSize === 0 ? 1 : (Math.ceil(filteredDeadStock.length / deadStockPageSize) || 1);
  const paginatedDeadStock = useMemo(() => {
    if (deadStockPageSize === 0) return filteredDeadStock;
    const start = (deadStockPage - 1) * deadStockPageSize;
    return filteredDeadStock.slice(start, start + deadStockPageSize);
  }, [filteredDeadStock, deadStockPage, deadStockPageSize]);

  // ─── Filtered & Sorted All Products ───
  const filteredProducts = useMemo(() => {
    if (!data?.allProducts) return [];
    return data.allProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category?.id === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || p.stockStatus === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'sold_desc') return b.unitsSold - a.unitsSold;
      if (sortBy === 'sold_asc') return a.unitsSold - b.unitsSold;
      if (sortBy === 'revenue_desc') return b.revenue - a.revenue;
      if (sortBy === 'stock_desc') return b.stock - a.stock;
      if (sortBy === 'stock_asc') return a.stock - b.stock;
      if (sortBy === 'capital_desc') return b.tiedCapital - a.tiedCapital;
      if (sortBy === 'views_desc') return b.views - a.views;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });
  }, [data?.allProducts, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        <div className="custom-loader"></div>
        <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>
          Analyzing inventory metrics & sales velocity...
        </p>
        <style>{`
          .custom-loader {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: 3px solid #e2e8f0;
            border-top-color: #0f172a;
            border-right-color: #334155;
            animation: loader-spin 0.8s linear infinite;
          }
          @keyframes loader-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const barChartColors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

  const pieChartData = topCategories?.filter(c => c.totalRevenue > 0).map((c, idx) => ({
    name: c.name,
    value: c.totalRevenue,
    share: c.revenueShare,
    color: barChartColors[idx % barChartColors.length]
  })) || [];

  return (
    <div className="inventory-analysis-page">
      <style>{`
        /* Match AdminOrders typography, font family, and scale exactly */
        .inventory-analysis-page {
          padding-bottom: 3rem;
          color: #0f172a;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* Top Header & Page Actions */
        .inventory-header-section {
          margin-bottom: 1.5rem;
        }
        .inventory-page-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .inventory-page-title-group h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.15rem 0;
          letter-spacing: -0.01em;
        }
        .inventory-page-title-group p {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }

        .header-actions-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.8rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #475569;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .refresh-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .refresh-btn .spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .export-btn-official {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.8rem;
          background: #4f46e5;
          color: #ffffff;
          border: 1px solid #4f46e5;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
        }
        .export-btn-official:hover {
          background: #4338ca;
          border-color: #4338ca;
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
        }

        .time-range-group {
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.2rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .time-pill-btn {
          padding: 0.3rem 0.65rem;
          border: none;
          background: transparent;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .time-pill-btn.active {
          background: #4f46e5;
          color: #ffffff;
        }

        /* KPI Metric Cards (Identical scale to AdminOrders) */
        .metrics-grid-official {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .metric-card-official {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .metric-card-official:hover {
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
          border-color: #cbd5e1;
        }
        .metric-icon-bubble {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .metric-icon-bubble.blue {
          background: #eff6ff;
          color: #2563eb;
        }
        .metric-icon-bubble.green {
          background: #ecfdf5;
          color: #059669;
        }
        .metric-icon-bubble.red {
          background: #fef2f2;
          color: #dc2626;
        }
        .metric-icon-bubble.amber {
          background: #fffbeb;
          color: #d97706;
        }
        .metric-details {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .metric-title {
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.15rem;
        }
        .metric-value {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }
        .metric-submeta {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 0.15rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Tabs Bar */
        .tabs-scroll-bar {
          display: flex;
          gap: 0.35rem;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 1.5rem;
          overflow-x: auto;
          padding-bottom: 0;
          -webkit-overflow-scrolling: touch;
        }
        .tabs-scroll-bar::-webkit-scrollbar {
          display: none;
        }
        .tab-btn-item {
          padding: 0.65rem 0.95rem;
          border: none;
          background: none;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.15s ease;
          margin-bottom: -1px;
        }
        .tab-btn-item:hover {
          color: #0f172a;
        }
        .tab-btn-item.active {
          color: #4f46e5;
          font-weight: 700;
          border-bottom-color: #4f46e5;
        }
        .tab-icon-box {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          flex-shrink: 0;
        }
        .tab-badge {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.08rem 0.45rem;
          border-radius: 9999px;
          background: #f1f5f9;
          color: #64748b;
        }
        .tab-btn-item.active .tab-badge {
          background: #4f46e5;
          color: #ffffff;
        }

        /* Unified Enterprise Card Container */
        .table-enterprise-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .card-title-header {
          padding: 1.1rem 1.25rem 0.75rem 1.25rem;
        }
        .card-title-header h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.15rem 0;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .card-title-header p {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }

        /* Filter Controls Bar (Exact match to AdminOrders) */
        .table-filter-bar {
          padding: 0.75rem 1.25rem;
          background: #ffffff;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .search-field-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          min-width: 200px;
          max-width: 280px;
          flex: 1;
        }
        .search-field-icon {
          position: absolute;
          left: 0.75rem;
          color: #94a3b8;
          font-size: 0.85rem;
          pointer-events: none;
        }
        .search-field-input {
          width: 100%;
          padding: 0.45rem 1.8rem 0.45rem 2.1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
          font-size: 0.8rem;
          color: #0f172a;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .search-field-input:focus {
          outline: none;
          background: #ffffff;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }
        .search-field-clear {
          position: absolute;
          right: 0.7rem;
          color: #94a3b8;
          cursor: pointer;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          padding: 0.2rem;
        }
        .search-field-clear:hover {
          color: #475569;
        }

        .filter-select-official {
          padding: 0.4rem 0.65rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #f8fafc;
          font-size: 0.75rem;
          color: #334155;
          font-weight: 500;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .filter-select-official:focus {
          background: #ffffff;
          border-color: #6366f1;
        }

        /* Status & Tier Segmented Filter Pills (Exact match to AdminOrders) */
        .status-filter-pills {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex-wrap: wrap;
        }
        .filter-pill {
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-family: inherit;
        }
        .filter-pill:hover {
          background: #f1f5f9;
          color: #334155;
        }
        .filter-pill.active {
          background: #4f46e5;
          color: #ffffff;
          border-color: #4f46e5;
          box-shadow: 0 1px 2px rgba(79, 70, 229, 0.2);
          font-weight: 600;
        }
        .filter-pill-badge {
          font-size: 0.65rem;
          padding: 0.05rem 0.35rem;
          border-radius: 999px;
          background: #e2e8f0;
          color: #475569;
        }
        .filter-pill.active .filter-pill-badge {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        /* Modern Official Table (Exact match to AdminOrders) */
        .official-table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          width: 100%;
        }
        .official-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          text-align: left;
        }
        .official-table th {
          background: #f8fafc;
          padding: 0.65rem 1rem;
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }
        .official-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
          background: #ffffff;
          font-size: 0.8rem;
          transition: background-color 0.15s ease;
        }
        .official-table tr:last-child td {
          border-bottom: none;
        }
        .official-table tr:hover td {
          background: #f8fafc;
        }

        /* Ranks & Badges */
        .rank-circle-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .rank-circle-badge.gold {
          background: #fef3c7;
          color: #b45309;
        }
        .rank-circle-badge.silver {
          background: #f1f5f9;
          color: #334155;
        }
        .rank-circle-badge.least {
          background: #fef2f2;
          color: #b91c1c;
        }
        .rank-circle-badge.default {
          background: #f8fafc;
          color: #64748b;
        }

        .category-chip-tag {
          display: inline-block;
          background: #f1f5f9;
          color: #475569;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .amount-figure {
          font-weight: 600;
          font-size: 0.8rem;
          color: #0f172a;
          white-space: nowrap;
        }
        .revenue-figure {
          font-weight: 700;
          font-size: 0.8rem;
          color: #059669;
          white-space: nowrap;
        }
        .units-sold-figure {
          font-weight: 600;
          font-size: 0.75rem;
          color: #047857;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 0.15rem 0.5rem;
          border-radius: 6px;
          display: inline-block;
          white-space: nowrap;
        }

        .status-badge-official {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          display: inline-block;
          white-space: nowrap;
        }
        .status-badge-official.healthy {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }
        .status-badge-official.low {
          background: #fffbeb;
          color: #b45309;
          border: 1px solid #fde68a;
        }
        .status-badge-official.out {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        /* Pagination Footer (Exact match to AdminOrders) */
        .table-pagination-footer {
          padding: 0.8rem 1.25rem;
          background: #ffffff;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .pagination-meta {
          font-size: 0.75rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .rows-select {
          padding: 0.15rem 0.4rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          background: #f8fafc;
          font-size: 0.75rem;
          color: #334155;
          cursor: pointer;
          outline: none;
          font-family: inherit;
        }
        .pagination-controls-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .pagination-nav-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pagination-nav-btn:hover:not(:disabled) {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }
        .pagination-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .page-pill-btn {
          min-width: 32px;
          height: 32px;
          padding: 0 0.5rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid transparent;
          background: transparent;
          color: #475569;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .page-pill-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .page-pill-btn.active {
          background: #4f46e5;
          color: #ffffff;
          border-color: #4f46e5;
        }

        /* Category Card V2 with refined Inter font-sizes */
        .category-card-official {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02);
        }
        .category-card-official:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
        }

        .category-rank-pill {
          position: absolute;
          top: -10px;
          right: 14px;
          padding: 0.2rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }
        .category-rank-pill.gold {
          background: #0f172a;
          color: #ffffff;
        }
        .category-rank-pill.silver {
          background: #059669;
          color: #ffffff;
        }
        .category-rank-pill.least {
          background: #ea580c;
          color: #ffffff;
        }

        .stat-chip-pill-refined {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          padding: 0.6rem 0.75rem;
        }
        .stat-chip-label {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.68rem;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 0.2rem;
        }
        .stat-chip-value {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        @media (max-width: 768px) {
          .inventory-page-title-row {
            flex-direction: column;
            align-items: stretch;
          }
          .header-actions-group {
            width: 100%;
            justify-content: flex-start;
          }
          .table-filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .search-field-wrapper {
            max-width: 100%;
          }
          .status-filter-pills {
            overflow-x: auto;
            padding-bottom: 0.25rem;
          }
          .table-pagination-footer {
            flex-direction: column;
            align-items: stretch;
          }
          .pagination-controls-row {
            justify-content: center;
          }
        }
      `}</style>
      
      {/* ─── Top Header & Controls (Exact match to AdminOrders style) ─── */}
      <div className="inventory-header-section">
        <div className="inventory-page-title-row">
          <div className="inventory-page-title-group">
            <h2>Inventory & Sales Analysis</h2>
            <p>Track category velocity, product bestsellers, dead inventory stock, and customer attraction radar.</p>
          </div>

          <div className="header-actions-group">
            {/* Time range selector */}
            <div className="time-range-group">
              {[
                { id: 'all', label: 'All Time' },
                { id: '90d', label: '90D' },
                { id: '30d', label: '30D' },
                { id: '7d', label: '7D' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setTimeRange(tab.id)}
                  className={`time-pill-btn ${timeRange === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Export to Excel */}
            <button
              onClick={handleExportExcel}
              className="export-btn-official"
            >
              <LuDownload size={14} /> Export Report
            </button>

            {/* Refresh button */}
            <button
              onClick={fetchInventoryAnalysis}
              disabled={refreshing}
              className="refresh-btn"
              title="Refresh inventory analytics"
            >
              <LuRefreshCw size={14} className={refreshing ? 'spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* ─── Top KPI Metric Cards (Identical scale to AdminOrders) ─── */}
        <div className="metrics-grid-official">
          
          {/* Card 1: Total Inventory Value */}
          <div className="metric-card-official">
            <div className="metric-icon-bubble blue">
              <FaRupeeSign size={15} />
            </div>
            <div className="metric-details">
              <span className="metric-title">Total Inventory Value</span>
              <span className="metric-value">₹{summary?.totalInventoryValue?.toLocaleString('en-IN') || 0}</span>
              <span className="metric-submeta">{summary?.totalInventoryUnits || 0} units · {summary?.totalProducts || 0} products</span>
            </div>
          </div>

          {/* Card 2: Realized Sales Revenue */}
          <div className="metric-card-official">
            <div className="metric-icon-bubble green">
              <LuTrendingUp size={16} />
            </div>
            <div className="metric-details">
              <span className="metric-title">Realized Revenue</span>
              <span className="metric-value">₹{summary?.totalRevenue?.toLocaleString('en-IN') || 0}</span>
              <span className="metric-submeta">{summary?.totalUnitsSold || 0} units sold in {summary?.totalOrders || 0} orders</span>
            </div>
          </div>

          {/* Card 3: Dead Stock Tied Capital */}
          <div className="metric-card-official">
            <div className="metric-icon-bubble red">
              <LuTriangleAlert size={16} />
            </div>
            <div className="metric-details">
              <span className="metric-title">Dead Stock Capital</span>
              <span className="metric-value">₹{summary?.totalDeadStockValue?.toLocaleString('en-IN') || 0}</span>
              <span className="metric-submeta">{summary?.neverOrderedCount || 0} products with zero orders</span>
            </div>
          </div>

          {/* Card 4: Inventory Health Alerts */}
          <div className="metric-card-official">
            <div className="metric-icon-bubble amber">
              <LuBoxes size={16} />
            </div>
            <div className="metric-details">
              <span className="metric-title">Warehouse Stock Health</span>
              <span className="metric-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span style={{ color: '#dc2626' }}>{summary?.outOfStockCount || 0} Out</span>
                <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>/</span>
                <span style={{ color: '#d97706', fontSize: '1rem' }}>{summary?.lowStockCount || 0} Low</span>
              </span>
              <span className="metric-submeta">Replenish low stock items</span>
            </div>
          </div>

        </div>
      </div>

      {/* ─── Navigation Tabs Bar (Exact typography to AdminOrders) ─── */}
      <div className="tabs-scroll-bar">
        {[
          { 
            id: 'categories', 
            icon: <LuChartColumnIncreasing />, 
            label: 'Category Performance & Charts', 
            count: topCategories?.length,
            iconColor: '#2563eb'
          },
          { 
            id: 'bestsellers', 
            icon: <LuFlame />, 
            label: 'Top Selling Products', 
            count: topSellingProducts?.length,
            iconColor: '#ea580c'
          },
          { 
            id: 'attraction', 
            icon: <LuMagnet />, 
            label: 'Customer Attraction Radar', 
            count: mostAttractedProducts?.length,
            iconColor: '#7c3aed'
          },
          { 
            id: 'deadstock', 
            icon: <LuTriangleAlert />, 
            label: 'Never Ordered (Dead Stock)', 
            count: neverOrderedProducts?.length, 
            iconColor: '#ef4444'
          },
          { 
            id: 'allproducts', 
            icon: <LuLayers />, 
            label: 'All Products Stats Ledger', 
            count: filteredProducts.length,
            iconColor: '#334155'
          }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); }}
            className={`tab-btn-item ${activeTab === tab.id ? 'active' : ''}`}
          >
            <div 
              className="tab-icon-box"
              style={{
                color: activeTab === tab.id ? '#4f46e5' : tab.iconColor
              }}
            >
              {tab.icon}
            </div>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="tab-badge">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: CATEGORY SALES PERFORMANCE & CHARTS
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'categories' && (
        <div>

          {/* Dual Charts: Bar Chart + Market Share Donut Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            
            {/* Chart 1: Revenue & Volume */}
            <div className="table-enterprise-card" style={{ padding: '1.25rem', marginBottom: 0 }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <LuActivity style={{ color: '#2563eb' }} size={15} /> Category Revenue & Volume
                </h3>
                <p style={{ margin: '0.15rem 0 0 0', color: '#64748b', fontSize: '0.75rem' }}>
                  Revenue generated (₹) and physical units sold per category
                </p>
              </div>

              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCategories} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 500 }} interval={0} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <RechartsTooltip 
                      formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Total Revenue']}
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.75rem', padding: '0.5rem 0.8rem' }}
                    />
                    <Bar dataKey="totalRevenue" radius={[6, 6, 0, 0]}>
                      {topCategories.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={barChartColors[index % barChartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Category Revenue Share Donut Chart */}
            <div className="table-enterprise-card" style={{ padding: '1.25rem', marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <LuChartPie style={{ color: '#10b981' }} size={15} /> Market Share Distribution
                </h3>
                <p style={{ margin: '0.15rem 0 0 0', color: '#64748b', fontSize: '0.75rem' }}>
                  Percentage breakdown of total store revenue
                </p>
              </div>

              <div style={{ width: '100%', height: 240, position: 'relative' }}>
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(val, name, item) => [`₹${Number(val).toLocaleString('en-IN')} (${item.payload.share}%)`, name]}
                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.75rem' }}
                      />
                      <Legend verticalAlign="bottom" height={32} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 500 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center' }}>
                    No recorded sales to visualize pie chart yet
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ─── Top 2 and Least 2 Executive Highlights Panel ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            
            {/* Left: Top 2 Revenue Drivers */}
            <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ background: '#059669', color: 'white', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <LuCrown size={12} /> TOP 2 PERFORMERS
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>High Velocity Leaders</span>
                </div>
                <button 
                  onClick={() => { setCategoryFilter(categoryFilter === 'top2' ? 'all' : 'top2'); setCategoryPage(1); }}
                  style={{ 
                    background: categoryFilter === 'top2' ? '#4f46e5' : '#f1f5f9', 
                    color: categoryFilter === 'top2' ? '#ffffff' : '#334155',
                    border: categoryFilter === 'top2' ? '1px solid #4f46e5' : '1px solid #e2e8f0', 
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem', 
                    fontWeight: 600, 
                    cursor: 'pointer'
                  }}
                >
                  {categoryFilter === 'top2' ? 'Top 2 Active' : 'Filter Top 2'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {top2Categories.map((cat, idx) => (
                  <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span className={`rank-circle-badge ${idx === 0 ? 'gold' : 'silver'}`}>
                        {idx === 0 ? <LuCrown size={12} /> : <LuMedal size={12} />}
                      </span>
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} style={{ width: '34px', height: '34px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                      ) : (
                        <div style={{ width: '34px', height: '34px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{cat.name.charAt(0)}</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.825rem', color: '#0f172a' }}>{cat.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{cat.revenueShare}% share · {cat.totalSold} sold</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="revenue-figure">₹{cat.totalRevenue.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{cat.totalStock} in stock</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Least 2 Revenue Drivers (Needs Push) */}
            <div style={{ background: '#ffffff', border: '1px solid #fed7aa', borderRadius: '12px', padding: '1.1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ background: '#ea580c', color: 'white', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <LuTrendingDown size={12} /> LEAST 2 PERFORMERS
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#9a3412', fontWeight: 600 }}>Needs Clearance Push</span>
                </div>
                <button 
                  onClick={() => { setCategoryFilter(categoryFilter === 'least2' ? 'all' : 'least2'); setCategoryPage(1); }}
                  style={{ 
                    background: categoryFilter === 'least2' ? '#4f46e5' : '#f1f5f9', 
                    color: categoryFilter === 'least2' ? '#ffffff' : '#334155',
                    border: categoryFilter === 'least2' ? '1px solid #4f46e5' : '1px solid #e2e8f0', 
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem', 
                    fontWeight: 600, 
                    cursor: 'pointer'
                  }}
                >
                  {categoryFilter === 'least2' ? 'Least 2 Active' : 'Filter Least 2'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {least2Categories.map((cat, idx) => (
                  <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span className="rank-circle-badge least">
                        ↓{idx + 1}
                      </span>
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} style={{ width: '34px', height: '34px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                      ) : (
                        <div style={{ width: '34px', height: '34px', borderRadius: '6px', background: '#ffedd5', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{cat.name.charAt(0)}</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.825rem', color: '#0f172a' }}>{cat.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#b45309' }}>Tied Capital: ₹{cat.tiedCapital.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="amount-figure">₹{cat.totalRevenue.toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>{cat.totalSold} sold</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ─── Category Filter & Search Bar ─── */}
          <div className="table-enterprise-card">
            <div className="table-filter-bar">
              
              {/* Segmented Filter Pills (Exact AdminOrders style) */}
              <div className="status-filter-pills">
                {[
                  { id: 'all', label: 'All Categories', count: topCategories.length },
                  { id: 'top2', label: 'Top 2 Leaders' },
                  { id: 'least2', label: 'Least 2 Attention' },
                  { id: 'compare', label: 'Compare Top 2 vs Least 2' },
                  { id: 'active', label: 'Active Store' },
                  { id: 'coming_soon', label: 'Coming Soon' }
                ].map(f => (
                  <button
                    key={f.id}
                    className={`filter-pill ${categoryFilter === f.id ? 'active' : ''}`}
                    onClick={() => { setCategoryFilter(f.id); setCategoryPage(1); }}
                  >
                    <span>{f.label}</span>
                    {f.count !== undefined && <span className="filter-pill-badge">{f.count}</span>}
                  </button>
                ))}
              </div>

              {/* Search & Sort Dropdowns */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div className="search-field-wrapper">
                  <LuSearch className="search-field-icon" />
                  <input 
                    type="text" 
                    className="search-field-input"
                    placeholder="Search category..." 
                    value={categorySearch}
                    onChange={e => { setCategorySearch(e.target.value); setCategoryPage(1); }}
                  />
                  {categorySearch && (
                    <button className="search-field-clear" onClick={() => { setCategorySearch(''); setCategoryPage(1); }}>
                      <LuX size={14} />
                    </button>
                  )}
                </div>

                <select
                  value={categorySort}
                  onChange={e => setCategorySort(e.target.value)}
                  className="filter-select-official"
                >
                  <option value="revenue_desc">Revenue: High to Low</option>
                  <option value="revenue_asc">Revenue: Low to High</option>
                  <option value="sold_desc">Units Sold: High to Low</option>
                  <option value="stock_desc">Stock: High to Low</option>
                  <option value="capital_desc">Tied Capital: High to Low</option>
                </select>

                <select
                  value={categoryPageSize}
                  onChange={e => { setCategoryPageSize(Number(e.target.value)); setCategoryPage(1); }}
                  className="filter-select-official"
                >
                  <option value="2">2 / page</option>
                  <option value="4">4 / page</option>
                  <option value="6">6 / page</option>
                  <option value="0">Show All</option>
                </select>
              </div>

            </div>

            {/* ─── Category Cards Grid ─── */}
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {paginatedCategories.map((cat) => {
                  const globalIdx = topCategories.findIndex(c => c.id === cat.id);
                  const isRank1 = globalIdx === 0 && cat.totalRevenue > 0;
                  const isRank2 = globalIdx === 1 && cat.totalRevenue > 0;
                  const isLeast = globalIdx >= topCategories.length - 2 && topCategories.length > 2;
                  const leastRank = topCategories.length - globalIdx;

                  return (
                    <div 
                      key={cat.id} 
                      className="category-card-official"
                      style={{ 
                        borderColor: isRank1 ? '#0f172a' : isRank2 ? '#10b981' : isLeast ? '#fdba74' : '#e2e8f0'
                      }}
                    >
                      {isRank1 && (
                        <div className="category-rank-pill gold">
                          <LuCrown size={11} /> #1 TOP SELLER
                        </div>
                      )}

                      {!isRank1 && isRank2 && (
                        <div className="category-rank-pill silver">
                          <LuMedal size={11} /> #2 TOP PERFORMER
                        </div>
                      )}

                      {!isRank1 && !isRank2 && isLeast && (
                        <div className="category-rank-pill least">
                          <LuTrendingDown size={11} /> LEAST #{leastRank} SLOW MOVING
                        </div>
                      )}

                      <div>
                        {/* Header: Image, Name, Status, Revenue */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            {cat.image ? (
                              <img 
                                src={cat.image} 
                                alt={cat.name} 
                                style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} 
                              />
                            ) : (
                              <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem' }}>
                                {cat.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{cat.name}</h4>
                              <span style={{ 
                                fontSize: '0.7rem', 
                                fontWeight: 600, 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.3rem',
                                color: cat.status === 'coming_soon' ? '#d97706' : '#059669'
                              }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cat.status === 'coming_soon' ? '#d97706' : '#10b981' }}></span>
                                {cat.status === 'coming_soon' ? 'COMING SOON' : 'ACTIVE STORE'}
                              </span>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div className="amount-figure" style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                              ₹{cat.totalRevenue.toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                              {cat.revenueShare}% revenue
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar of Revenue Share */}
                        <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1rem' }}>
                          <div 
                            style={{ 
                              width: `${Math.max(4, Math.min(100, cat.revenueShare))}%`, 
                              height: '100%', 
                              background: isRank1 ? '#0f172a' : isRank2 ? '#10b981' : isLeast ? '#ea580c' : '#64748b',
                              borderRadius: '9999px'
                            }}
                          ></div>
                        </div>

                        {/* Key Stats Chips */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                          
                          <div className="stat-chip-pill-refined">
                            <div className="stat-chip-label">
                              <LuTrendingUp size={12} style={{ color: '#059669' }} /> Units Sold
                            </div>
                            <div className="stat-chip-value">{cat.totalSold}</div>
                          </div>

                          <div className="stat-chip-pill-refined">
                            <div className="stat-chip-label">
                              <LuBoxes size={12} style={{ color: '#2563eb' }} /> Available Stock
                            </div>
                            <div className="stat-chip-value">{cat.totalStock}</div>
                          </div>

                          <div className="stat-chip-pill-refined">
                            <div className="stat-chip-label">
                              <LuLayers size={12} style={{ color: '#7c3aed' }} /> Catalog Items
                            </div>
                            <div className="stat-chip-value">{cat.totalProducts}</div>
                          </div>

                          <div className="stat-chip-pill-refined">
                            <div className="stat-chip-label">
                              <FaRupeeSign size={10} style={{ color: '#d97706' }} /> Unsold Capital
                            </div>
                            <div className="stat-chip-value" style={{ fontSize: '0.85rem' }}>
                              ₹{cat.tiedCapital.toLocaleString('en-IN')}
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Top Product preview in this category */}
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                          {cat.topProduct ? (
                            <>
                              <img 
                                src={cat.topProduct.image} 
                                alt={cat.topProduct.name} 
                                style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain', background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                                onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }}
                              />
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Top Selling Product</div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {cat.topProduct.name}
                                </div>
                              </div>
                            </>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>No sales recorded yet</span>
                          )}
                        </div>
                        {cat.topProduct && (
                          <span className="units-sold-figure">
                            {cat.topProduct.unitsSold} sold
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="table-pagination-footer">
              <div className="pagination-meta">
                <span>
                  Showing <strong>{categoryPageSize === 0 ? filteredCategories.length : Math.min(filteredCategories.length, (categoryPage - 1) * categoryPageSize + 1)}</strong> to{' '}
                  <strong>{categoryPageSize === 0 ? filteredCategories.length : Math.min(filteredCategories.length, categoryPage * categoryPageSize)}</strong> of{' '}
                  <strong>{filteredCategories.length}</strong> categories
                </span>
              </div>

              {totalCategoryPages > 1 && categoryPageSize > 0 && (
                <div className="pagination-controls-row">
                  <button 
                    className="pagination-nav-btn"
                    disabled={categoryPage === 1}
                    onClick={() => setCategoryPage(p => Math.max(1, p - 1))}
                    title="Previous page"
                  >
                    <LuChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalCategoryPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`page-pill-btn ${categoryPage === page ? 'active' : ''}`}
                      onClick={() => setCategoryPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    className="pagination-nav-btn"
                    disabled={categoryPage === totalCategoryPages}
                    onClick={() => setCategoryPage(p => Math.min(totalCategoryPages, p + 1))}
                    title="Next page"
                  >
                    <LuChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: BESTSELLERS & VELOCITY LEADERBOARD (Exact Table Match)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'bestsellers' && (
        <div className="table-enterprise-card">
          
          <div className="card-title-header">
            <h3>
              <LuFlame style={{ color: '#ea580c' }} size={16} /> Top Selling Products Leaderboard
            </h3>
            <p>
              Highest velocity products ranked by units sold and generated revenue
            </p>
          </div>

          {/* Table Filters & Search (Exact match to AdminOrders style) */}
          <div className="table-filter-bar">
            <div className="status-filter-pills">
              {[
                { id: 'all', label: 'All Products', count: topSellingProducts?.length || 0 },
                { id: 'top2', label: 'Top 2 Leaders' },
                { id: 'least2', label: 'Least 2 Moving' },
                { id: 'compare', label: 'Compare Top 2 vs Least 2' }
              ].map(f => (
                <button
                  key={f.id}
                  className={`filter-pill ${bestsellerFilter === f.id ? 'active' : ''}`}
                  onClick={() => { setBestsellerFilter(f.id); setBestsellerPage(1); }}
                >
                  <span>{f.label}</span>
                  {f.count !== undefined && <span className="filter-pill-badge">{f.count}</span>}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="search-field-wrapper">
                <LuSearch className="search-field-icon" />
                <input 
                  type="text" 
                  className="search-field-input"
                  placeholder="Search product..." 
                  value={bestsellerSearch}
                  onChange={e => { setBestsellerSearch(e.target.value); setBestsellerPage(1); }}
                />
                {bestsellerSearch && (
                  <button className="search-field-clear" onClick={() => { setBestsellerSearch(''); setBestsellerPage(1); }}>
                    <LuX size={14} />
                  </button>
                )}
              </div>

              <select
                value={bestsellerCategory}
                onChange={e => { setBestsellerCategory(e.target.value); setBestsellerPage(1); }}
                className="filter-select-official"
              >
                <option value="all">All Categories</option>
                {topCategories?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={bestsellerStatus}
                onChange={e => { setBestsellerStatus(e.target.value); setBestsellerPage(1); }}
                className="filter-select-official"
              >
                <option value="all">All Stock Statuses</option>
                <option value="in_stock">Healthy (&gt;5)</option>
                <option value="low_stock">Low Stock (≤5)</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>

              <select
                value={bestsellerPageSize}
                onChange={e => { setBestsellerPageSize(Number(e.target.value)); setBestsellerPage(1); }}
                className="filter-select-official"
              >
                <option value="5">5 / page</option>
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
                <option value="0">Show All</option>
              </select>
            </div>
          </div>

          {filteredBestsellers.length === 0 ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: '#64748b' }}>
              <LuPackageX size={40} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>No products match your criteria</div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>Try clearing filters or search query.</p>
            </div>
          ) : (
            <div className="official-table-wrapper">
              <table className="official-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>Rank</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'center' }}>Units Sold</th>
                    <th style={{ textAlign: 'right' }}>Total Revenue</th>
                    <th style={{ textAlign: 'center' }}>Current Stock</th>
                    <th style={{ textAlign: 'center' }}>Stock Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBestsellers.map((p) => {
                    const overallRank = topSellingProducts.findIndex(item => item.id === p.id);
                    const isTop1 = overallRank === 0;
                    const isTop2 = overallRank === 1;
                    const isLeast = overallRank >= topSellingProducts.length - 2 && topSellingProducts.length > 2;

                    return (
                      <tr key={p.id}>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`rank-circle-badge ${isTop1 ? 'gold' : isTop2 ? 'silver' : isLeast ? 'least' : 'default'}`}>
                            {isTop1 ? <LuCrown size={12} /> : isTop2 ? <LuMedal size={12} /> : `#${overallRank + 1}`}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <img 
                              src={p.image} 
                              alt={p.name} 
                              style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'contain', background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                              onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8rem' }}>{p.name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
                                <span>{p.views} views</span>
                                <span>·</span>
                                <span style={{ color: '#d97706', fontWeight: 600 }}>{p.rating}★ ({p.numReviews})</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-chip-tag">
                            {p.category.name}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="amount-figure">₹{p.price.toLocaleString('en-IN')}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="units-sold-figure">
                            {p.unitsSold}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="revenue-figure">₹{p.revenue.toLocaleString('en-IN')}</span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.8rem', color: p.stock <= 5 ? '#dc2626' : '#0f172a' }}>
                          {p.stock}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {p.stock <= 0 ? (
                            <span className="status-badge-official out">
                              OUT OF STOCK
                            </span>
                          ) : p.stock <= 5 ? (
                            <span className="status-badge-official low">
                              LOW ({p.stock})
                            </span>
                          ) : (
                            <span className="status-badge-official healthy">
                              HEALTHY ({p.stock})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls (Exact match to AdminOrders style) */}
          <div className="table-pagination-footer">
            <div className="pagination-meta">
              <span>
                Showing <strong>{bestsellerPageSize === 0 ? filteredBestsellers.length : (filteredBestsellers.length === 0 ? 0 : (bestsellerPage - 1) * bestsellerPageSize + 1)}</strong> to{' '}
                <strong>{bestsellerPageSize === 0 ? filteredBestsellers.length : Math.min(filteredBestsellers.length, bestsellerPage * bestsellerPageSize)}</strong> of{' '}
                <strong>{filteredBestsellers.length}</strong> products
              </span>
            </div>

            {totalBestsellerPages > 1 && bestsellerPageSize > 0 && (
              <div className="pagination-controls-row">
                <button 
                  className="pagination-nav-btn"
                  disabled={bestsellerPage === 1}
                  onClick={() => setBestsellerPage(p => Math.max(1, p - 1))}
                  title="Previous page"
                >
                  <LuChevronLeft size={16} />
                </button>
                {Array.from({ length: totalBestsellerPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`page-pill-btn ${bestsellerPage === page ? 'active' : ''}`}
                    onClick={() => setBestsellerPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  className="pagination-nav-btn"
                  disabled={bestsellerPage === totalBestsellerPages}
                  onClick={() => setBestsellerPage(p => Math.min(totalBestsellerPages, p + 1))}
                  title="Next page"
                >
                  <LuChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: CUSTOMER ATTRACTION RADAR
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'attraction' && (
        <div>
          {/* Opportunity Banner: High interest, low conversion */}
          {highInterestLowConversion?.length > 0 && (
            <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.1rem', marginBottom: '1.25rem', boxShadow: '0 1px 3px rgba(37, 99, 235, 0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ background: '#2563eb', color: 'white', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <LuSparkles size={12} /> CONVERSION OPPORTUNITY
                </span>
                <span style={{ color: '#1e3a8a', fontSize: '0.85rem', fontWeight: 700 }}>
                  High Customer Visits · Low Purchase Conversion
                </span>
              </div>
              <p style={{ margin: '0 0 0.85rem 0', color: '#64748b', fontSize: '0.78rem' }}>
                Customers are viewing these products repeatedly, but have not checked out yet. Consider a targeted discount or carousel spotlight.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {highInterestLowConversion.map(p => (
                  <div key={p.id} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                    <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px', background: '#ffffff', border: '1px solid #f1f5f9' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.1rem' }}>₹{p.price.toLocaleString('en-IN')} · {p.views} Views · {p.unitsSold} Sold</div>
                      <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600, marginTop: '0.15rem' }}>
                        Suggest: 10% promo campaign
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attraction Ranking Grid with Filters & Pagination */}
          <div className="table-enterprise-card">
            <div className="card-title-header">
              <h3>
                <LuMagnet style={{ color: '#7c3aed' }} size={16} /> Customer Attraction & Engagement Leaderboard
              </h3>
              <p>
                Calculated from verified customer page visits, review ratings, and order conversion
              </p>
            </div>

            {/* Attraction Filter Bar */}
            <div className="table-filter-bar">
              <div className="search-field-wrapper">
                <LuSearch className="search-field-icon" />
                <input 
                  type="text" 
                  className="search-field-input"
                  placeholder="Search attraction products..." 
                  value={attractionSearch}
                  onChange={e => { setAttractionSearch(e.target.value); setAttractionPage(1); }}
                />
                {attractionSearch && (
                  <button className="search-field-clear" onClick={() => { setAttractionSearch(''); setAttractionPage(1); }}>
                    <LuX size={14} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={attractionCategory}
                  onChange={e => { setAttractionCategory(e.target.value); setAttractionPage(1); }}
                  className="filter-select-official"
                >
                  <option value="all">All Categories</option>
                  {topCategories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={attractionSort}
                  onChange={e => setAttractionSort(e.target.value)}
                  className="filter-select-official"
                >
                  <option value="score_desc">Attraction Score: High to Low</option>
                  <option value="views_desc">Page Views: High to Low</option>
                  <option value="rating_desc">Rating: High to Low</option>
                  <option value="sold_desc">Units Sold: High to Low</option>
                </select>

                <select
                  value={attractionPageSize}
                  onChange={e => { setAttractionPageSize(Number(e.target.value)); setAttractionPage(1); }}
                  className="filter-select-official"
                >
                  <option value="6">6 / page</option>
                  <option value="12">12 / page</option>
                  <option value="24">24 / page</option>
                  <option value="0">Show All</option>
                </select>
              </div>
            </div>

            {filteredAttraction.length === 0 ? (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: '#64748b' }}>
                <LuRadar size={40} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>No attraction products found</div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>Try clearing filters or search query.</p>
              </div>
            ) : (
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {paginatedAttraction.map((p) => {
                    const globalRank = mostAttractedProducts.findIndex(item => item.id === p.id);
                    return (
                      <div key={p.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                            <span className={`rank-circle-badge ${globalRank === 0 ? 'gold' : globalRank === 1 ? 'silver' : 'default'}`}>
                              {globalRank === 0 ? <LuCrown size={12} /> : globalRank === 1 ? <LuMedal size={12} /> : `#${globalRank + 1}`}
                            </span>
                            <span style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600 }}>
                              Score: {p.attractionScore}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.85rem' }}>
                            <img src={p.image} alt={p.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'contain', background: '#f8fafc', border: '1px solid #e2e8f0' }} />
                            <div style={{ minWidth: 0 }}>
                              <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                              <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 500 }}>{p.category.name}</span>
                              <div className="amount-figure" style={{ marginTop: '0.15rem' }}>₹{p.price.toLocaleString('en-IN')}</div>
                            </div>
                          </div>
                        </div>

                        <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '0.65rem', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', gap: '0.25rem' }}>
                          <div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>VIEWS</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{p.views}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>RATING</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#d97706' }}>{p.rating}★</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>SOLD</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>{p.unitsSold}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="table-pagination-footer">
              <div className="pagination-meta">
                <span>
                  Showing <strong>{attractionPageSize === 0 ? filteredAttraction.length : (filteredAttraction.length === 0 ? 0 : (attractionPage - 1) * attractionPageSize + 1)}</strong> to{' '}
                  <strong>{attractionPageSize === 0 ? filteredAttraction.length : Math.min(filteredAttraction.length, attractionPage * attractionPageSize)}</strong> of{' '}
                  <strong>{filteredAttraction.length}</strong> products
                </span>
              </div>

              {totalAttractionPages > 1 && attractionPageSize > 0 && (
                <div className="pagination-controls-row">
                  <button 
                    className="pagination-nav-btn"
                    disabled={attractionPage === 1}
                    onClick={() => setAttractionPage(p => Math.max(1, p - 1))}
                    title="Previous page"
                  >
                    <LuChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalAttractionPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`page-pill-btn ${attractionPage === page ? 'active' : ''}`}
                      onClick={() => setAttractionPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    className="pagination-nav-btn"
                    disabled={attractionPage === totalAttractionPages}
                    onClick={() => setAttractionPage(p => Math.min(totalAttractionPages, p + 1))}
                    title="Next page"
                  >
                    <LuChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: NEVER ORDERED PRODUCTS (DEAD STOCK)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'deadstock' && (
        <div className="table-enterprise-card">
          
          <div className="card-title-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                <span className="status-badge-official out" style={{ padding: '0.15rem 0.5rem', fontSize: '0.68rem' }}>
                  ATTENTION REQUIRED
                </span>
              </div>
              <h3>
                Never-Ordered Products (Zero Sales)
              </h3>
              <p>
                Catalog products with 0 recorded purchases. Review locked warehouse capital to plan promotions.
              </p>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.65rem 1rem', borderRadius: '8px', textAlign: 'right' }}>
              <div style={{ fontSize: '0.68rem', color: '#991b1b', fontWeight: 700, textTransform: 'uppercase' }}>
                Locked Warehouse Capital
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626' }}>
                ₹{summary?.totalDeadStockValue?.toLocaleString('en-IN') || 0}
              </div>
            </div>
          </div>

          {/* Filter Bar for Dead Stock */}
          <div className="table-filter-bar">
            <div className="search-field-wrapper">
              <LuSearch className="search-field-icon" />
              <input 
                type="text" 
                className="search-field-input"
                placeholder="Search dead stock..." 
                value={deadStockSearch}
                onChange={e => { setDeadStockSearch(e.target.value); setDeadStockPage(1); }}
              />
              {deadStockSearch && (
                <button className="search-field-clear" onClick={() => { setDeadStockSearch(''); setDeadStockPage(1); }}>
                  <LuX size={14} />
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={deadStockCategory}
                onChange={e => { setDeadStockCategory(e.target.value); setDeadStockPage(1); }}
                className="filter-select-official"
              >
                <option value="all">All Categories</option>
                {topCategories?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={deadStockSort}
                onChange={e => setDeadStockSort(e.target.value)}
                className="filter-select-official"
              >
                <option value="capital_desc">Tied Capital: High to Low</option>
                <option value="stock_desc">Unsold Stock: High to Low</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="views_desc">Views: High to Low</option>
              </select>

              <select
                value={deadStockPageSize}
                onChange={e => { setDeadStockPageSize(Number(e.target.value)); setDeadStockPage(1); }}
                className="filter-select-official"
              >
                <option value="5">5 / page</option>
                <option value="10">10 / page</option>
                <option value="25">25 / page</option>
                <option value="0">Show All</option>
              </select>
            </div>
          </div>

          {filteredDeadStock.length === 0 ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: '#059669' }}>
              <LuCircleCheck size={40} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Outstanding! No products found in dead stock</div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>Try clearing filters or search query.</p>
            </div>
          ) : (
            <div className="official-table-wrapper">
              <table className="official-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Selling Price</th>
                    <th style={{ textAlign: 'center' }}>Unsold Stock</th>
                    <th style={{ textAlign: 'right' }}>Locked Capital</th>
                    <th style={{ textAlign: 'center' }}>Views</th>
                    <th style={{ textAlign: 'center' }}>Days Listed</th>
                    <th style={{ textAlign: 'center' }}>Suggested Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDeadStock.map(p => {
                    const daysListed = p.createdAt ? Math.floor((new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24)) : 0;
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <img 
                              src={p.image} 
                              alt={p.name} 
                              style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'contain', background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                              onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8rem' }}>{p.name}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Stock: {p.stock} units</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-chip-tag">
                            {p.category.name}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="amount-figure">₹{p.price.toLocaleString('en-IN')}</span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: p.stock > 0 ? '#dc2626' : '#64748b' }}>
                          {p.stock}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                          ₹{p.tiedCapital.toLocaleString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 500 }}>
                          {p.views}
                        </td>
                        <td style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                          {daysListed}d
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`status-badge-official ${p.tiedCapital > 10000 ? 'out' : 'low'}`}>
                            {p.tiedCapital > 20000 ? 'Run 25% Promo' : p.views > 5 ? 'Discount Price' : 'Carousel Feature'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="table-pagination-footer">
            <div className="pagination-meta">
              <span>
                Showing <strong>{deadStockPageSize === 0 ? filteredDeadStock.length : (filteredDeadStock.length === 0 ? 0 : (deadStockPage - 1) * deadStockPageSize + 1)}</strong> to{' '}
                <strong>{deadStockPageSize === 0 ? filteredDeadStock.length : Math.min(filteredDeadStock.length, deadStockPage * deadStockPageSize)}</strong> of{' '}
                <strong>{filteredDeadStock.length}</strong> products
              </span>
            </div>

            {totalDeadStockPages > 1 && deadStockPageSize > 0 && (
              <div className="pagination-controls-row">
                <button 
                  className="pagination-nav-btn"
                  disabled={deadStockPage === 1}
                  onClick={() => setDeadStockPage(p => Math.max(1, p - 1))}
                  title="Previous page"
                >
                  <LuChevronLeft size={16} />
                </button>
                {Array.from({ length: totalDeadStockPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`page-pill-btn ${deadStockPage === page ? 'active' : ''}`}
                    onClick={() => setDeadStockPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  className="pagination-nav-btn"
                  disabled={deadStockPage === totalDeadStockPages}
                  onClick={() => setDeadStockPage(p => Math.min(totalDeadStockPages, p + 1))}
                  title="Next page"
                >
                  <LuChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: FULL PRODUCT STATS LEDGER & FILTERS
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'allproducts' && (
        <div className="table-enterprise-card">
          
          <div className="card-title-header">
            <h3>
              <LuLayers style={{ color: '#2563eb' }} size={16} /> Full Product Inventory & Sales Ledger
            </h3>
            <p>
              Search, filter, and review all products in your catalog with granular inventory velocity and revenue stats
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="table-filter-bar">
            <div className="search-field-wrapper" style={{ minWidth: '220px', maxWidth: '300px' }}>
              <LuSearch className="search-field-icon" />
              <input 
                type="text" 
                className="search-field-input"
                placeholder="Search products or category..." 
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
              {searchQuery && (
                <button className="search-field-clear" onClick={() => { setSearchQuery(''); setCurrentPage(1); }}>
                  <LuX size={14} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={selectedCategory}
                onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="filter-select-official"
              >
                <option value="all">All Categories</option>
                {topCategories?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="filter-select-official"
              >
                <option value="all">All Stock Statuses</option>
                <option value="healthy">Healthy Stock (&gt;5)</option>
                <option value="low_stock">Low Stock (1-5)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
                <option value="dead_stock">Dead Stock (0 Sales)</option>
              </select>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="filter-select-official"
              >
                <option value="sold_desc">Units Sold (High to Low)</option>
                <option value="revenue_desc">Revenue (High to Low)</option>
                <option value="stock_asc">Stock (Low to High - Restock)</option>
                <option value="stock_desc">Stock (High to Low)</option>
                <option value="capital_desc">Tied Capital (High to Low)</option>
                <option value="views_desc">Views (High to Low)</option>
                <option value="price_desc">Price (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="official-table-wrapper">
            <table className="official-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'center' }}>Stock Status</th>
                  <th style={{ textAlign: 'right' }}>Tied Capital</th>
                  <th style={{ textAlign: 'center' }}>Units Sold</th>
                  <th style={{ textAlign: 'right' }}>Revenue</th>
                  <th style={{ textAlign: 'center' }}>Attraction</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'contain', background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                          onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-chip-tag">
                        {p.category.name}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="amount-figure">₹{p.price.toLocaleString('en-IN')}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {p.stock <= 0 ? (
                        <span className="status-badge-official out">
                          OUT OF STOCK (0)
                        </span>
                      ) : p.stock <= 5 ? (
                        <span className="status-badge-official low">
                          LOW ({p.stock})
                        </span>
                      ) : p.unitsSold === 0 ? (
                        <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>
                          DEAD ({p.stock})
                        </span>
                      ) : (
                        <span className="status-badge-official healthy">
                          HEALTHY ({p.stock})
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 500, color: '#475569', fontSize: '0.8rem' }}>
                        ₹{p.tiedCapital.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="units-sold-figure">
                        {p.unitsSold}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="revenue-figure">
                        ₹{p.revenue.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>
                        {p.views} views · <span style={{ color: '#d97706', fontWeight: 600 }}>{p.rating}★</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls with Page Numbers (Exact match to AdminOrders style) */}
          <div className="table-pagination-footer">
            <div className="pagination-meta">
              <span>
                Showing <strong>{filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
                <strong>{Math.min(currentPage * pageSize, filteredProducts.length)}</strong> of{' '}
                <strong>{filteredProducts.length}</strong> products
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Rows per page:</span>
                <select 
                  className="rows-select" 
                  value={pageSize} 
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="pagination-controls-row">
                <button 
                  className="pagination-nav-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  title="Previous page"
                >
                  <LuChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map(page => (
                  <button
                    key={page}
                    className={`page-pill-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  className="pagination-nav-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  title="Next page"
                >
                  <LuChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default AdminInventoryAnalysis;
