import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FiTrash2, FiPlus, FiEdit2, FiSearch, FiRefreshCw, 
  FiPackage, FiCheckCircle, FiAlertCircle, FiFolder,
  FiChevronLeft, FiChevronRight, FiX, FiInfo,
  FiUploadCloud, FiStar, FiLink, FiArrowLeft, FiArrowRight, FiCheck
} from 'react-icons/fi';

const AdminProducts = () => {
  const { token } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  // Unified image list: { type: 'existing', url } or { type: 'new', id, file, preview }
  const [imageList, setImageList] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef(null);
  const [tags, setTags] = useState([]);

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('All'); // 'All', 'InStock', 'OutOfStock'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchProducts = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
      setProducts(res.data);
      if (showToast) toast.success('Products refreshed');
    } catch (err) {
      console.error('Failed to fetch products', err);
      toast.error('Failed to load products');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Metrics computation
  const metrics = useMemo(() => {
    const total = products.length;
    const inStock = products.filter(p => (p.stock || 0) > 0).length;
    const outOfStock = products.filter(p => (p.stock || 0) <= 0).length;
    const totalCats = categories.length;
    return { total, inStock, outOfStock, totalCats };
  }, [products, categories]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory ? p.category?._id === filterCategory : true;
      const matchesStock = 
        stockFilter === 'All' ? true :
        stockFilter === 'InStock' ? (p.stock || 0) > 0 :
        (p.stock || 0) <= 0;
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, filterCategory, stockFilter]);

  // Reset to page 1 on filter or limit change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, stockFilter, itemsPerPage]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleFilesAdded = (filesList) => {
    if (!filesList || filesList.length === 0) return;
    const currentCount = imageList.length;
    const remainingSlots = 10 - currentCount;
    if (remainingSlots <= 0) {
      toast.error('Maximum 10 images allowed per product');
      return;
    }

    const filesArray = Array.from(filesList).slice(0, remainingSlots);
    const validItems = [];

    for (const file of filesArray) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 8MB size limit`);
        continue;
      }
      validItems.push({
        type: 'new',
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file)
      });
    }

    if (validItems.length > 0) {
      setImageList(prev => [...prev, ...validItems]);
      toast.success(`Added ${validItems.length} image${validItems.length > 1 ? 's' : ''}`);
    }
  };

  const handleAddUrl = (e) => {
    e?.preventDefault();
    const url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error('Please enter a valid image URL (http:// or https://)');
      return;
    }
    if (imageList.length >= 10) {
      toast.error('Maximum 10 images allowed per product');
      return;
    }
    setImageList(prev => [...prev, { type: 'existing', url }]);
    setUrlInput('');
    setShowUrlInput(false);
    toast.success('Image URL added');
  };

  const handleRemoveImage = (index) => {
    setImageList(prev => {
      const item = prev[index];
      if (item?.type === 'new' && item?.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSetMainImage = (index) => {
    if (index === 0) return;
    setImageList(prev => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
    toast.success('Set as Primary Cover Image');
  };

  const handleMoveImage = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= imageList.length) return;
    setImageList(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageList.length === 0) {
      toast.error('Please add at least one product image');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('slug', slug);
      formData.append('price', Number(price));
      if (originalPrice) {
        formData.append('originalPrice', Number(originalPrice));
      } else {
        formData.append('originalPrice', '');
      }
      formData.append('stock', Number(stock));
      formData.append('category', category);
      formData.append('description', description || '');
      formData.append('tags', JSON.stringify(tags));

      // Separate existing retained image URLs and newly selected file objects
      const existingUrls = imageList
        .filter(item => item.type === 'existing')
        .map(item => item.url);
      formData.append('existingImages', JSON.stringify(existingUrls));

      imageList.forEach(item => {
        if (item.type === 'new') {
          formData.append('images', item.file);
        }
      });

      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/products/${editingId}`, formData, {
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/products`, formData, {
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Product added successfully');
      }
      
      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prod) => {
    setEditingId(prod._id);
    setName(prod.name);
    setSlug(prod.slug);
    setPrice(prod.price);
    setOriginalPrice(prod.originalPrice || '');
    setStock(prod.stock);
    setCategory(prod.category?._id || '');
    setDescription(prod.description || '');
    setTags(prod.tags || []);
    
    // Revoke previous object URLs
    imageList.forEach(item => {
      if (item.type === 'new' && item.preview) URL.revokeObjectURL(item.preview);
    });

    if (prod.images && Array.isArray(prod.images) && prod.images.length > 0) {
      setImageList(prod.images.map(url => ({ type: 'existing', url })));
    } else {
      setImageList([]);
    }
    setUrlInput('');
    setShowUrlInput(false);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName(''); setSlug(''); setPrice(''); setOriginalPrice(''); setStock(''); setCategory(''); setDescription(''); setTags([]);
    
    // Revoke previews to prevent memory leak
    imageList.forEach(item => {
      if (item.type === 'new' && item.preview) URL.revokeObjectURL(item.preview);
    });
    setImageList([]);
    setUrlInput('');
    setShowUrlInput(false);
    setShowAddForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Error deleting product');
    }
  };

  return (
    <div className="admin-products-page">
      <style>{`
        /* Exact match to AdminOrders typography and scale */
        .admin-products-page {
          padding-bottom: 3rem;
          color: #0f172a;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .header-section {
          margin-bottom: 1.5rem;
        }
        .page-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .page-title-group h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.15rem 0;
          letter-spacing: -0.01em;
        }
        .page-title-group p {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }

        .header-actions-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
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
          font-family: inherit;
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

        .add-product-btn-official {
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
          font-family: inherit;
        }
        .add-product-btn-official:hover {
          background: #4338ca;
          border-color: #4338ca;
        }

        /* KPI Metric Cards */
        .metrics-grid-official {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
        .metric-icon-bubble.blue { background: #eff6ff; color: #2563eb; }
        .metric-icon-bubble.green { background: #ecfdf5; color: #059669; }
        .metric-icon-bubble.red { background: #fef2f2; color: #dc2626; }
        .metric-icon-bubble.purple { background: #faf5ff; color: #7c3aed; }

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

        /* Enterprise Table Card */
        .table-enterprise-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
          overflow: hidden;
        }

        /* Filter Toolbar */
        .table-filter-bar {
          padding: 0.85rem 1.25rem;
          background: #ffffff;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .search-field-wrapper {
          position: relative;
          min-width: 240px;
          flex: 1;
          max-width: 320px;
        }
        .search-field-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 0.85rem;
        }
        .search-field-input {
          width: 100%;
          padding: 0.45rem 2rem 0.45rem 2rem;
          font-size: 0.8rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #0f172a;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
          box-sizing: border-box;
        }
        .search-field-input:focus {
          border-color: #4f46e5;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        .search-clear-btn {
          position: absolute;
          right: 0.6rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 0.8rem;
          padding: 2px;
          display: flex;
          align-items: center;
        }
        .search-clear-btn:hover {
          color: #334155;
        }

        .filter-controls-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .filter-pill {
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          background: #ffffff;
          color: #64748b;
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
          font-family: inherit;
        }

        /* Modern Official Table */
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

        .prod-image-cell {
          width: 44px;
          height: 44px;
          border-radius: 6px;
          object-fit: cover;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: #94a3b8;
          flex-shrink: 0;
        }

        .cat-chip-tag {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #0f172a;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 0.15rem 0.45rem;
        }

        .stock-badge-pill {
          font-size: 0.68rem;
          font-weight: 600;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .stock-badge-pill.in {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .stock-badge-pill.out {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        .stock-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .btn-table-action {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          border-radius: 6px;
          padding: 0.35rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .btn-action-edit {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
        }
        .btn-action-edit:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        .btn-action-delete {
          background: #fff5f5;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
        .btn-action-delete:hover {
          background: #fee2e2;
          color: #b91c1c;
        }

        /* Pagination Footer */
        .table-pagination-footer {
          padding: 0.75rem 1.25rem;
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .pagination-meta-info {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
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

        /* Slide-over Drawer (Add/Edit) */
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }
        .drawer-panel {
          background: #ffffff;
          width: 100%;
          max-width: 600px;
          height: 100vh;
          overflow-y: auto;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
          animation: drawerSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }
        @keyframes drawerSlide {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .drawer-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .drawer-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .drawer-header p {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0.15rem 0 0 0;
        }
        .drawer-close-btn {
          background: #f1f5f9;
          border: none;
          font-size: 1.1rem;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.15s ease;
        }
        .drawer-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        .drawer-body {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .drawer-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
          position: sticky;
          bottom: 0;
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          z-index: 10;
        }
        .drawer-btn-cancel {
          padding: 0.45rem 1rem;
          background: #ffffff;
          color: #475569;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }
        .drawer-btn-submit {
          padding: 0.45rem 1.2rem;
          background: #4f46e5;
          color: #ffffff;
          border: 1px solid #4f46e5;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
        }
        .drawer-btn-submit:hover:not(:disabled) {
          background: #4338ca;
          border-color: #4338ca;
        }
        .drawer-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .drawer-field-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .drawer-field-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #334155;
        }
        .drawer-field-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #0f172a;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .drawer-field-input:focus {
          border-color: #4f46e5;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .aspect-ratio-notice {
          padding: 0.5rem 0.75rem;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          font-size: 0.72rem;
          color: #1e40af;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          line-height: 1.4;
          margin-top: 0.35rem;
        }

        /* Modern Amazon-Grade Multi-Image Uploader */
        .multi-image-uploader-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .uploader-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .image-count-indicator {
          font-size: 0.75rem;
          font-weight: 700;
          color: #4f46e5;
          background: #eef2ff;
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid #e0e7ff;
        }
        .uploader-dropzone-box {
          border: 2px dashed #cbd5e1;
          border-radius: 10px;
          background: #f8fafc;
          padding: 1.25rem 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }
        .uploader-dropzone-box:hover {
          border-color: #4f46e5;
          background: #f1f5f9;
        }
        .uploader-dropzone-box.drag-active {
          border-color: #4f46e5;
          background: #eff6ff;
          transform: scale(1.01);
        }
        .uploader-drop-icon {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #eef2ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          margin-bottom: 0.15rem;
        }
        .uploader-drop-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0f172a;
        }
        .uploader-drop-hint {
          font-size: 0.72rem;
          color: #64748b;
        }
        .uploader-actions-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }
        .url-toggle-btn {
          background: transparent;
          border: none;
          color: #4f46e5;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          font-family: inherit;
        }
        .url-toggle-btn:hover {
          text-decoration: underline;
        }
        .url-input-container {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          background: #f8fafc;
          padding: 0.5rem;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .url-input-field {
          flex: 1;
          padding: 0.4rem 0.6rem;
          font-size: 0.78rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          outline: none;
          background: #ffffff;
        }
        .url-input-field:focus {
          border-color: #4f46e5;
        }
        .url-add-btn {
          padding: 0.4rem 0.8rem;
          background: #4f46e5;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }
        .image-preview-mosaic {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 0.6rem;
          margin-top: 0.35rem;
        }
        .preview-tile {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          background: #f1f5f9;
          border: 2px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: all 0.2s ease;
        }
        .preview-tile.is-primary {
          border-color: #f59e0b;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.25);
        }
        .preview-tile-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .primary-badge {
          position: absolute;
          top: 4px;
          left: 4px;
          background: #f59e0b;
          color: #ffffff;
          font-size: 0.58rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          padding: 2px 5px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 3px;
          z-index: 2;
          box-shadow: 0 1px 2px rgba(0,0,0,0.25);
        }
        .tile-number-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(15, 23, 42, 0.75);
          color: #ffffff;
          font-size: 0.6rem;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 4px;
          z-index: 2;
        }
        .tile-action-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.7);
          opacity: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 6px;
          transition: opacity 0.2s ease;
          z-index: 3;
        }
        .preview-tile:hover .tile-action-overlay {
          opacity: 1;
        }
        .overlay-nav-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2px;
        }
        .tile-icon-btn {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: none;
          background: rgba(255, 255, 255, 0.9);
          color: #1e293b;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .tile-icon-btn:hover:not(:disabled) {
          background: #ffffff;
          color: #0f172a;
          transform: scale(1.1);
        }
        .tile-icon-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .tile-icon-btn.delete-btn:hover {
          background: #fee2e2;
          color: #dc2626;
        }
        .tile-make-primary-btn {
          background: #f59e0b;
          color: #ffffff;
          border: none;
          border-radius: 4px;
          padding: 3px 6px;
          font-size: 0.62rem;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          text-align: center;
          transition: all 0.15s ease;
        }
        .tile-make-primary-btn:hover {
          background: #d97706;
        }
      `}</style>

      {/* Header section */}
      <div className="header-section">
        <div className="page-title-row">
          <div className="page-title-group">
            <h2>Product Catalog</h2>
            <p>Manage product inventory, pricing tiers, descriptions, and storefront visibility.</p>
          </div>
          <div className="header-actions-group">
            <button 
              className="refresh-btn" 
              onClick={() => fetchProducts(true)} 
              disabled={refreshing}
              title="Refresh product list"
            >
              <FiRefreshCw className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button 
              className="add-product-btn-official" 
              onClick={() => { resetForm(); setShowAddForm(true); }}
            >
              <FiPlus />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="metrics-grid-official">
        <div className="metric-card-official">
          <div className="metric-icon-bubble blue">
            <FiPackage />
          </div>
          <div>
            <div className="metric-title">Total Products</div>
            <div className="metric-value">{metrics.total}</div>
          </div>
        </div>
        <div className="metric-card-official">
          <div className="metric-icon-bubble green">
            <FiCheckCircle />
          </div>
          <div>
            <div className="metric-title">In Stock</div>
            <div className="metric-value">{metrics.inStock}</div>
          </div>
        </div>
        <div className="metric-card-official">
          <div className="metric-icon-bubble red">
            <FiAlertCircle />
          </div>
          <div>
            <div className="metric-title">Out of Stock</div>
            <div className="metric-value">{metrics.outOfStock}</div>
          </div>
        </div>
        <div className="metric-card-official">
          <div className="metric-icon-bubble purple">
            <FiFolder />
          </div>
          <div>
            <div className="metric-title">Categories</div>
            <div className="metric-value">{metrics.totalCats}</div>
          </div>
        </div>
      </div>

      {/* Enterprise Products Table Card */}
      <div className="table-enterprise-card">
        {/* Table Filters Toolbar */}
        <div className="table-filter-bar">
          <div className="search-field-wrapper">
            <FiSearch className="search-field-icon" />
            <input 
              type="text" 
              placeholder="Search products by title..." 
              className="search-field-input"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            {searchTerm && (
              <button className="search-clear-btn" onClick={() => setSearchTerm('')}>
                <FiX />
              </button>
            )}
          </div>

          <div className="filter-controls-group">
            <button 
              className={`filter-pill ${stockFilter === 'All' ? 'active' : ''}`}
              onClick={() => { setStockFilter('All'); setCurrentPage(1); }}
            >
              All <span className="filter-pill-badge">{products.length}</span>
            </button>
            <button 
              className={`filter-pill ${stockFilter === 'InStock' ? 'active' : ''}`}
              onClick={() => { setStockFilter('InStock'); setCurrentPage(1); }}
            >
              In Stock <span className="filter-pill-badge">{metrics.inStock}</span>
            </button>
            <button 
              className={`filter-pill ${stockFilter === 'OutOfStock' ? 'active' : ''}`}
              onClick={() => { setStockFilter('OutOfStock'); setCurrentPage(1); }}
            >
              Out of Stock <span className="filter-pill-badge">{metrics.outOfStock}</span>
            </button>

            <select 
              className="filter-select-official" 
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="official-table-wrapper">
          <table className="official-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>MRP (₹)</th>
                <th>Selling Price (₹)</th>
                <th>Stock Units</th>
                <th style={{ textAlign: 'right', width: '130px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem', color: '#334155' }}>No products match your criteria</p>
                    <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Try clearing your search keyword or changing the category filter</small>
                  </td>
                </tr>
              ) : (
                currentProducts.map(prod => (
                  <tr key={prod._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ position: 'relative' }}>
                          {prod.images && prod.images.length > 0 ? (
                            <img src={prod.images[0]} alt={prod.name} className="prod-image-cell" />
                          ) : (
                            <div className="prod-image-cell">📦</div>
                          )}
                          {prod.images && prod.images.length > 1 && (
                            <span 
                              title={`${prod.images.length} images available`}
                              style={{
                                position: 'absolute',
                                bottom: '-3px',
                                right: '-3px',
                                background: '#4f46e5',
                                color: '#ffffff',
                                fontSize: '0.62rem',
                                fontWeight: '700',
                                padding: '1px 5px',
                                borderRadius: '999px',
                                border: '1.5px solid #ffffff',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.15)'
                              }}>
                              +{prod.images.length - 1}
                            </span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem', marginBottom: '0.15rem' }}>
                            {prod.name}
                          </div>
                          {prod.originalPrice && prod.originalPrice > prod.price && (
                            <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700 }}>
                              {Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="cat-chip-tag">
                        {prod.category?.name || 'General'}
                      </span>
                    </td>
                    <td>
                      {prod.originalPrice ? (
                        <span style={{ color: '#94a3b8', textDecoration: 'line-through', fontWeight: 500, fontSize: '0.78rem' }}>
                          ₹{prod.originalPrice.toLocaleString('en-IN')}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                        ₹{prod.price?.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-start' }}>
                        <span className={`stock-badge-pill ${prod.stock > 0 ? 'in' : 'out'}`}>
                          <span className="stock-dot"></span>
                          {prod.stock > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                          {prod.stock || 0} units
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button onClick={() => handleEdit(prod)} className="btn-table-action btn-action-edit">
                          <FiEdit2 /> Edit
                        </button>
                        <button onClick={() => handleDelete(prod._id)} className="btn-table-action btn-action-delete">
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="table-pagination-footer">
          <div className="pagination-meta-info">
            <span>
              Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Rows per page:</span>
              <select 
                className="rows-select" 
                value={itemsPerPage} 
                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
                <option value={8}>8</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="pagination-controls-row">
            <button 
              className="pagination-nav-btn" 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              title="Previous page"
            >
              <FiChevronLeft />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <React.Fragment key={page}>
                    {prev && page - prev > 1 && (
                      <span style={{ padding: '0 0.25rem', color: '#94a3b8', fontSize: '0.8rem' }}>…</span>
                    )}
                    <button 
                      className={`page-pill-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button 
              className="pagination-nav-btn" 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              title="Next page"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Side-over Drawer Modal for Add/Edit Product */}
      {showAddForm && (
        <div className="drawer-overlay" onClick={resetForm}>
          <div className="drawer-panel" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                <p>{editingId ? 'Update product specifications and pricing' : 'Create a new catalog item'}</p>
              </div>
              <button className="drawer-close-btn" onClick={resetForm}>
                <FiX />
              </button>
            </div>

            <form id="product-form-official" onSubmit={handleSubmit} className="drawer-body">
              <div className="drawer-field-group">
                <label className="drawer-field-label">Product Name *</label>
                <input 
                  type="text" 
                  className="drawer-field-input" 
                  value={name} 
                  onChange={e => {
                    setName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                  }} 
                  placeholder="e.g. 55-inch 4K OLED Smart TV" 
                  required 
                />
              </div>

              <div className="drawer-field-group">
                <label className="drawer-field-label">Slug Identifier *</label>
                <input 
                  type="text" 
                  className="drawer-field-input" 
                  value={slug} 
                  onChange={e => setSlug(e.target.value)} 
                  placeholder="e.g. 55-inch-4k-oled-smart-tv" 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="drawer-field-group">
                  <label className="drawer-field-label">Selling Price (₹) *</label>
                  <input 
                    type="number" 
                    className="drawer-field-input" 
                    value={price} 
                    onChange={e => setPrice(e.target.value)} 
                    placeholder="e.g. 45000" 
                    required 
                  />
                </div>
                <div className="drawer-field-group">
                  <label className="drawer-field-label">MRP / Original Price (₹)</label>
                  <input 
                    type="number" 
                    className="drawer-field-input" 
                    value={originalPrice} 
                    onChange={e => setOriginalPrice(e.target.value)} 
                    placeholder="e.g. 59990" 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="drawer-field-group">
                  <label className="drawer-field-label">Stock Quantity *</label>
                  <input 
                    type="number" 
                    className="drawer-field-input" 
                    value={stock} 
                    onChange={e => setStock(e.target.value)} 
                    placeholder="e.g. 25" 
                    required 
                  />
                </div>
                <div className="drawer-field-group">
                  <label className="drawer-field-label">Category *</label>
                  <select 
                    className="drawer-field-input" 
                    value={category} 
                    onChange={e => setCategory(e.target.value)} 
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="drawer-field-group">
                <label className="drawer-field-label">Product Description</label>
                <textarea 
                  className="drawer-field-input" 
                  rows={3} 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Provide detailed specifications, features, and warranty details..."
                />
              </div>

              <div className="drawer-field-group">
                <div className="multi-image-uploader-wrapper">
                  <div className="uploader-header-row">
                    <label className="drawer-field-label" style={{ margin: 0 }}>
                      Product Images (Upload Multiple) *
                    </label>
                    <span className="image-count-indicator">
                      {imageList.length} / 10 images
                    </span>
                  </div>

                  {/* Hidden multi-file input */}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    multiple 
                    onChange={e => {
                      handleFilesAdded(e.target.files);
                      e.target.value = ''; // allow selecting the same file again if needed
                    }} 
                    accept="image/*"
                    style={{ display: 'none' }}
                  />

                  {/* Drag and Drop Zone */}
                  {imageList.length < 10 && (
                    <div 
                      className={`uploader-dropzone-box ${isDragging ? 'drag-active' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
                      onDrop={e => {
                        e.preventDefault();
                        setIsDragging(false);
                        handleFilesAdded(e.dataTransfer.files);
                      }}
                    >
                      <div className="uploader-drop-icon">
                        <FiUploadCloud />
                      </div>
                      <div className="uploader-drop-title">
                        Click to select images or drag & drop files here
                      </div>
                      <div className="uploader-drop-hint">
                        Select multiple images (PNG, JPG, WEBP up to 8MB). Up to 10 photos.
                      </div>
                    </div>
                  )}

                  <div className="uploader-actions-bar">
                    <button 
                      type="button" 
                      className="url-toggle-btn"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                    >
                      <FiLink /> {showUrlInput ? 'Hide URL Input' : '+ Add Image by Web URL'}
                    </button>
                    {imageList.length > 0 && (
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Tip: First image is Primary Cover image
                      </span>
                    )}
                  </div>

                  {/* Optional Image URL Input */}
                  {showUrlInput && (
                    <div className="url-input-container">
                      <input 
                        type="url"
                        className="url-input-field"
                        placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(); } }}
                      />
                      <button 
                        type="button" 
                        className="url-add-btn"
                        onClick={handleAddUrl}
                      >
                        Add URL
                      </button>
                    </div>
                  )}

                  {/* Image Preview Mosaic */}
                  {imageList.length > 0 && (
                    <div className="image-preview-mosaic">
                      {imageList.map((item, index) => {
                        const imgSrc = item.type === 'new' ? item.preview : item.url;
                        const isMain = index === 0;

                        return (
                          <div 
                            key={item.id || item.url || index} 
                            className={`preview-tile ${isMain ? 'is-primary' : ''}`}
                          >
                            <img 
                              src={imgSrc} 
                              alt={`Product image ${index + 1}`} 
                              className="preview-tile-img"
                              onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=Invalid'; }}
                            />

                            {isMain ? (
                              <div className="primary-badge">
                                <FiStar /> Main Cover
                              </div>
                            ) : (
                              <div className="tile-number-badge">
                                #{index + 1}
                              </div>
                            )}

                            {/* Hover Overlay Controls */}
                            <div className="tile-action-overlay">
                              <div className="overlay-nav-row">
                                <button 
                                  type="button"
                                  className="tile-icon-btn"
                                  title="Move Left"
                                  disabled={index === 0}
                                  onClick={() => handleMoveImage(index, -1)}
                                >
                                  <FiArrowLeft />
                                </button>
                                <button 
                                  type="button"
                                  className="tile-icon-btn"
                                  title="Move Right"
                                  disabled={index === imageList.length - 1}
                                  onClick={() => handleMoveImage(index, 1)}
                                >
                                  <FiArrowRight />
                                </button>
                                <button 
                                  type="button"
                                  className="tile-icon-btn delete-btn"
                                  title="Remove image"
                                  onClick={() => handleRemoveImage(index)}
                                >
                                  <FiTrash2 />
                                </button>
                              </div>

                              {!isMain && (
                                <button 
                                  type="button"
                                  className="tile-make-primary-btn"
                                  onClick={() => handleSetMainImage(index)}
                                >
                                  Make Main
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="aspect-ratio-notice">
                    <FiInfo style={{ fontSize: '0.95rem', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Amazon Display Standard:</strong> Upload multiple high-res angles (Front, Side, Details). Square 1:1 ratio is recommended for best catalog presentation.</span>
                  </div>
                </div>
              </div>
            </form>

            <div className="drawer-footer">
              <button type="button" className="drawer-btn-cancel" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" form="product-form-official" className="drawer-btn-submit" disabled={loading}>
                {loading ? 'Saving...' : (editingId ? 'Save Changes' : 'Publish Product')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
