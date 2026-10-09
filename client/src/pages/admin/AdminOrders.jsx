import { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FiSearch, FiDownload, FiChevronLeft, FiChevronRight,
  FiRefreshCw, FiCopy, FiCheck, FiShoppingBag, FiClock,
  FiX, FiArrowUpRight, FiLayers
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

const AdminOrders = () => {
  const { token } = useOutletContext();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  
  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchOrders = useCallback(async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/orders`, {
        headers: { 'x-auth-token': token }
      });
      setOrders(res.data);
      if (showToast) {
        toast.success('Orders refreshed successfully');
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/orders`, {
          headers: { 'x-auth-token': token }
        });
        if (!ignore) {
          setOrders(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to fetch orders', err);
          setLoading(false);
        }
      }
    };
    load();
    return () => { ignore = true; };
  }, [token]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { 'x-auth-token': token } }
      );
      toast.success(`Order status updated to ${newStatus}`);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('Order ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalCommission = orders.reduce((sum, o) => sum + (o.totalCommission || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

    return { totalOrders, totalRevenue, totalCommission, pendingOrders, deliveredOrders };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const idMatch = o._id.toLowerCase().includes(searchTerm.toLowerCase());
      const nameMatch = (o.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = (o.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = idMatch || nameMatch || emailMatch;
      const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
      
      let matchesDate = true;
      if (startDate || endDate) {
        const orderDate = new Date(o.createdAt);
        orderDate.setHours(0, 0, 0, 0); // normalize to start of day for accurate comparison
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (orderDate < start) matchesDate = false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (orderDate > end) matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, startDate, endDate]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const exportToExcel = () => {
    const headers = [
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Items Count',
      'Total Amount (INR)',
      'Total Commission (INR)',
      'Order Status',
      'Payment Status',
      'Date Created'
    ];
    
    const csvRows = [headers.join(',')];
    filteredOrders.forEach(o => {
      const row = [
        o._id,
        `"${(o.user?.name || '').replace(/"/g, '""')}"`,
        `"${(o.user?.email || '').replace(/"/g, '""')}"`,
        o.items?.length || 0,
        o.totalAmount || 0,
        (o.totalCommission || 0).toFixed(2),
        o.status,
        o.paymentStatus,
        new Date(o.createdAt).toLocaleString()
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    let fileName = `LG_Orders_${new Date().toISOString().slice(0, 10)}`;
    if (startDate && endDate) fileName += `_${startDate}_to_${endDate}`;
    else if (startDate) fileName += `_from_${startDate}`;
    else if (endDate) fileName += `_until_${endDate}`;
    
    a.setAttribute('download', `${fileName}.csv`);
    a.click();
    toast.success('Filtered Order CSV report downloaded');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
      case 'Shipped':
        return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
      case 'Processing':
        return { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' };
      case 'Pending':
        return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
      case 'Cancelled':
      case 'Returned':
        return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
      default:
        return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return { date: 'N/A', time: '' };
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="admin-orders-page">
      <style>{`
        .admin-orders-page {
          padding-bottom: 3rem;
          color: #0f172a;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* Top Header & Metrics */
        .orders-header-section {
          margin-bottom: 1.75rem;
        }
        .orders-page-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .orders-page-title-group h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.15rem 0;
          letter-spacing: -0.01em;
        }
        .orders-page-title-group p {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }

        .header-actions-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
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
          background: #0f172a;
          color: #ffffff;
          border: 1px solid #0f172a;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(15, 23, 42, 0.1);
        }
        .export-btn-official:hover {
          background: #1e293b;
          box-shadow: 0 4px 8px rgba(15, 23, 42, 0.15);
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
        .metric-icon-bubble.blue {
          background: #eff6ff;
          color: #2563eb;
        }
        .metric-icon-bubble.green {
          background: #ecfdf5;
          color: #059669;
        }
        .metric-icon-bubble.emerald {
          background: #f0fdf4;
          color: #16a34a;
        }
        .metric-icon-bubble.amber {
          background: #fffbeb;
          color: #d97706;
        }
        .metric-details {
          display: flex;
          flex-direction: column;
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

        /* Unified Table Container */
        .table-enterprise-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
          overflow: hidden;
        }

        /* Filter Controls Bar */
        .table-filter-bar {
          padding: 0.8rem 1.25rem;
          background: #ffffff;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .date-filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .date-input-official {
          padding: 0.4rem 0.6rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #f8fafc;
          font-size: 0.75rem;
          color: #334155;
          outline: none;
          transition: all 0.2s ease;
        }
        .date-input-official:focus {
          background: #ffffff;
          border-color: #6366f1;
        }
        .search-field-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 240px;
          max-width: 320px;
        }
        .search-field-icon {
          position: absolute;
          left: 0.8rem;
          color: #94a3b8;
          font-size: 0.9rem;
          pointer-events: none;
        }
        .search-field-input {
          width: 100%;
          padding: 0.45rem 2rem 0.45rem 2.2rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
          font-size: 0.8rem;
          color: #0f172a;
          transition: all 0.2s ease;
        }
        .search-field-input:focus {
          outline: none;
          background: #ffffff;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }
        .search-field-clear {
          position: absolute;
          right: 0.75rem;
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

        /* Status Tabs / Filter Chips */
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
        }
        .filter-pill:hover {
          background: #f1f5f9;
          color: #334155;
        }
        .filter-pill.active {
          background: #f8fafc;
          color: #0f172a;
          border-color: #e2e8f0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
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
          background: #e2e8f0;
          color: #0f172a;
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
          transition: background-color 0.15s ease;
        }
        .official-table tr:last-child td {
          border-bottom: none;
        }
        .official-table tr:hover td {
          background: #f8fafc;
        }

        /* Order ID badge */
        .order-id-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.75rem;
          font-weight: 600;
          color: #334155;
          background: transparent;
          padding: 0;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .order-id-tag:hover {
          color: #0f172a;
          text-decoration: underline;
        }
        .order-id-tag .copy-icon {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        /* Customer Cell */
        .customer-cell {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .customer-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.7rem;
          flex-shrink: 0;
          text-transform: uppercase;
        }
        .customer-name {
          font-weight: 500;
          font-size: 0.8rem;
          color: #0f172a;
          line-height: 1.2;
        }
        .customer-email {
          font-size: 0.7rem;
          color: #64748b;
          line-height: 1.2;
        }

        /* Items Pill */
        .items-count-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          color: #475569;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
        }

        /* Currency Amounts */
        .amount-figure {
          font-weight: 600;
          font-size: 0.8rem;
          color: #0f172a;
          white-space: nowrap;
        }
        .commission-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .commission-badge.active {
          color: #059669;
        }
        .commission-badge.zero {
          color: #94a3b8;
        }

        /* Order Status Custom Select Badge */
        .status-dropdown-wrapper {
          position: relative;
          display: inline-block;
        }
        .status-select-official {
          appearance: none;
          -webkit-appearance: none;
          padding: 0.2rem 1.4rem 0.2rem 0.5rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          outline: none;
        }
        .status-select-official:hover {
          filter: brightness(0.97);
        }
        .status-select-official:disabled {
          opacity: 0.6;
          cursor: wait;
        }
        .status-dropdown-arrow {
          position: absolute;
          right: 0.4rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          font-size: 0.6rem;
        }

        /* Payment Badge */
        .payment-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
          white-space: nowrap;
        }
        .payment-pill.completed {
          color: #059669;
        }
        .payment-pill.pending {
          color: #d97706;
        }
        .payment-pill.failed {
          color: #dc2626;
        }
        .payment-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Action View Details Button */
        .view-details-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.3rem 0.6rem;
          background: transparent;
          color: #475569;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .view-details-action-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }
        .view-details-action-btn svg {
          font-size: 0.8rem;
        }

        /* Loading Skeleton */
        .loading-shimmer-row {
          height: 52px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
          margin: 0.5rem 0;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Empty State */
        .empty-orders-view {
          padding: 4rem 2rem;
          text-align: center;
        }
        .empty-icon-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin: 0 auto 1rem auto;
        }
        .empty-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.35rem;
        }
        .empty-subtitle {
          font-size: 0.875rem;
          color: #64748b;
          max-width: 380px;
          margin: 0 auto 1.5rem auto;
        }
        .reset-filter-btn {
          padding: 0.5rem 1.25rem;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          color: #334155;
          font-size: 0.825rem;
          font-weight: 600;
          cursor: pointer;
        }
        .reset-filter-btn:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        /* Pagination Footer */
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
          font-size: 0.825rem;
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
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }

        @media (max-width: 768px) {
          .orders-page-title-row {
            flex-direction: column;
            align-items: stretch;
          }
          .header-actions-group {
            width: 100%;
            justify-content: flex-end;
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

      {/* Top Header & Page Actions */}
      <div className="orders-header-section">
        <div className="orders-page-title-row">
          <div className="orders-page-title-group">
            <h2>Order History & Management</h2>
            <p>Manage customer orders, track shipping logistics, and review affiliate commissions.</p>
          </div>
          <div className="header-actions-group">
            <button 
              className="refresh-btn" 
              onClick={() => fetchOrders(true)} 
              disabled={refreshing}
              title="Refresh order records"
            >
              <FiRefreshCw className={refreshing ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="export-btn-official" onClick={exportToExcel} title="Export filtered list to CSV">
              <FiDownload size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Executive Metric Cards */}
        <div className="metrics-grid-official">
          <div className="metric-card-official">
            <div className="metric-icon-bubble blue">
              <FiShoppingBag />
            </div>
            <div className="metric-details">
              <span className="metric-title">Total Orders</span>
              <span className="metric-value">{metrics.totalOrders}</span>
            </div>
          </div>

          <div className="metric-card-official">
            <div className="metric-icon-bubble green">
              <FaRupeeSign />
            </div>
            <div className="metric-details">
              <span className="metric-title">Gross Revenue</span>
              <span className="metric-value">₹{metrics.totalRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="metric-card-official">
            <div className="metric-icon-bubble emerald">
              <FiLayers />
            </div>
            <div className="metric-details">
              <span className="metric-title">Commissions Settled</span>
              <span className="metric-value">₹{metrics.totalCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="metric-card-official">
            <div className="metric-icon-bubble amber">
              <FiClock />
            </div>
            <div className="metric-details">
              <span className="metric-title">Pending Dispatch</span>
              <span className="metric-value">{metrics.pendingOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Table Container */}
      <div className="table-enterprise-card">
        {/* Table Filters & Search */}
        <div className="table-filter-bar">
          <div className="search-field-wrapper">
            <FiSearch className="search-field-icon" />
            <input 
              type="text" 
              className="search-field-input"
              placeholder="Search by Order ID, customer, email..." 
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            {searchTerm && (
              <button className="search-field-clear" onClick={() => { setSearchTerm(''); setCurrentPage(1); }}>
                <FiX size={16} />
              </button>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="date-filter-group">
            <input 
              type="date" 
              className="date-input-official"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
              title="Start Date"
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>to</span>
            <input 
              type="date" 
              className="date-input-official"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
              title="End Date"
            />
          </div>

          {/* Status Segmented Filter Pills */}
          <div className="status-filter-pills">
            {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].map(status => {
              const count = status === 'All' 
                ? orders.length 
                : orders.filter(o => o.status === status).length;
              return (
                <button
                  key={status}
                  className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                >
                  <span>{status}</span>
                  <span className="filter-pill-badge">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Table */}
        <div className="official-table-wrapper">
          <table className="official-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Commission</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '2rem 1.5rem' }}>
                    <div className="loading-shimmer-row"></div>
                    <div className="loading-shimmer-row"></div>
                    <div className="loading-shimmer-row"></div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map(o => {
                  const statusStyle = getStatusColor(o.status);
                  const { date, time } = formatTimestamp(o.createdAt);
                  const customerInitials = (o.user?.name || 'U').charAt(0).toUpperCase();

                  return (
                    <tr key={o._id}>
                      {/* Order ID */}
                      <td>
                        <button 
                          className="order-id-tag" 
                          onClick={(e) => handleCopyId(e, o._id)}
                          title="Click to copy full ID"
                        >
                          <span>#{o._id.substring(o._id.length - 8).toUpperCase()}</span>
                          {copiedId === o._id ? (
                            <FiCheck className="copy-icon" style={{ color: '#10b981' }} />
                          ) : (
                            <FiCopy className="copy-icon" />
                          )}
                        </button>
                      </td>

                      {/* Customer */}
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {customerInitials}
                          </div>
                          <div>
                            <div className="customer-name">{o.user?.name || 'Guest User'}</div>
                            <div className="customer-email">{o.user?.email || 'No email attached'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td>
                        <span className="items-count-badge">
                          <FiShoppingBag size={12} />
                          {o.items?.length || 0} {o.items?.length === 1 ? 'item' : 'items'}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td>
                        <span className="amount-figure">
                          ₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Total Commission */}
                      <td>
                        {o.totalCommission > 0 ? (
                          <span className="commission-badge active">
                            ₹{o.totalCommission.toFixed(2)}
                          </span>
                        ) : (
                          <span className="commission-badge zero">
                            ₹0.00
                          </span>
                        )}
                      </td>

                      {/* Order Status Selector */}
                      <td>
                        <div className="status-dropdown-wrapper">
                          <select 
                            className="status-select-official"
                            value={o.status}
                            onChange={(e) => handleStatusChange(o._id, e.target.value)}
                            disabled={updatingId === o._id}
                            style={{
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.text,
                              borderColor: statusStyle.border,
                            }}
                          >
                            <option value="Pending">● Pending</option>
                            <option value="Processing">● Processing</option>
                            <option value="Shipped">● Shipped</option>
                            <option value="Delivered">● Delivered</option>
                            <option value="Cancelled">● Cancelled</option>
                            <option value="Returned">● Returned</option>
                          </select>
                          <span className="status-dropdown-arrow" style={{ color: statusStyle.text }}>▼</span>
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td>
                        <span className={`payment-pill ${o.paymentStatus === 'Completed' ? 'completed' : o.paymentStatus === 'Failed' ? 'failed' : 'pending'}`}>
                          <span className="payment-dot"></span>
                          {o.paymentStatus || 'Pending'}
                        </span>
                      </td>

                      {/* Date */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#334155' }}>{date}</span>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{time}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="view-details-action-btn"
                          onClick={() => navigate(`/admin/dashboard/orders/${o._id}`)}
                          title="View order details, commissions & invoice"
                        >
                          <span>View</span>
                          <FiArrowUpRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Empty state */}
              {!loading && paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan="9">
                    <div className="empty-orders-view">
                      <div className="empty-icon-circle">
                        <FiSearch />
                      </div>
                      <div className="empty-title">No orders match your criteria</div>
                      <div className="empty-subtitle">
                        {searchTerm || statusFilter !== 'All' || startDate || endDate
                          ? `We couldn't find any orders matching your filters. Try clearing them.`
                          : 'No order records are currently available in the database.'}
                      </div>
                      {(searchTerm || statusFilter !== 'All' || startDate || endDate) && (
                        <button 
                          className="reset-filter-btn" 
                          onClick={() => { setSearchTerm(''); setStatusFilter('All'); setStartDate(''); setEndDate(''); }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Enterprise Pagination Controls */}
        <div className="table-pagination-footer">
          <div className="pagination-meta">
            <span>
              Showing <strong>{filteredOrders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</strong> of{' '}
              <strong>{filteredOrders.length}</strong> orders
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Rows per page:</span>
              <select 
                className="rows-select" 
                value={itemsPerPage} 
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
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
                onClick={() => setCurrentPage(p => p - 1)}
                title="Previous page"
              >
                <FiChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) {
                    acc.push('ellipsis-' + p);
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map(item => {
                  if (typeof item === 'string') {
                    return <span key={item} style={{ padding: '0 0.25rem', color: '#94a3b8' }}>...</span>;
                  }
                  return (
                    <button
                      key={item}
                      className={`page-pill-btn ${currentPage === item ? 'active' : ''}`}
                      onClick={() => setCurrentPage(item)}
                    >
                      {item}
                    </button>
                  );
                })}

              <button 
                className="pagination-nav-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                title="Next page"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
