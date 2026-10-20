import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FiSearch, FiDownload, FiChevronLeft, FiChevronRight,
  FiRefreshCw, FiCopy, FiCheck, FiClock, FiX, 
  FiDollarSign, FiCheckCircle, FiXCircle, FiFilter,
  FiAlertCircle
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

const AdminWithdrawals = () => {
  const { token } = useOutletContext();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal for Mark as Paid / Reject
  const [actionModal, setActionModal] = useState({
    open: false,
    withdrawal: null,
    status: 'Paid', // 'Paid' | 'Rejected'
    adminNote: '',
    submitting: false
  });

  const fetchWithdrawals = useCallback(async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/withdrawals`, {
        headers: { 'x-auth-token': token }
      });
      setWithdrawals(res.data);
      if (showToast) {
        toast.success('Withdrawals refreshed successfully');
      }
    } catch (err) {
      console.error('Failed to fetch withdrawals', err);
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/withdrawals`, {
          headers: { 'x-auth-token': token }
        });
        if (!ignore) {
          setWithdrawals(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to fetch withdrawals', err);
          setLoading(false);
        }
      }
    };
    load();
    return () => { ignore = true; };
  }, [token]);

  const openActionModal = (withdrawal, status) => {
    setActionModal({
      open: true,
      withdrawal,
      status,
      adminNote: status === 'Paid' ? 'Paid via UPI / Bank transfer' : 'Details invalid / Balance issue',
      submitting: false
    });
  };

  const handleConfirmAction = async (e) => {
    e.preventDefault();
    if (!actionModal.withdrawal) return;

    setActionModal(prev => ({ ...prev, submitting: true }));
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/withdrawals/${actionModal.withdrawal._id}/status`,
        { 
          status: actionModal.status, 
          adminNote: actionModal.adminNote 
        },
        { headers: { 'x-auth-token': token } }
      );
      
      toast.success(actionModal.status === 'Paid' ? 'Payout completed and wallet updated!' : 'Withdrawal rejected');
      setActionModal({ open: false, withdrawal: null, status: 'Paid', adminNote: '', submitting: false });
      await fetchWithdrawals(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update withdrawal');
      setActionModal(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleCopy = (e, text, key) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const totalCount = withdrawals.length;
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'Pending');
    const paidWithdrawals = withdrawals.filter(w => w.status === 'Paid' || w.status === 'Completed' || w.status === 'Approved');
    const rejectedWithdrawals = withdrawals.filter(w => w.status === 'Rejected');

    const totalPendingAmount = pendingWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
    const totalPaidAmount = paidWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

    return {
      totalCount,
      pendingCount: pendingWithdrawals.length,
      paidCount: paidWithdrawals.length,
      rejectedCount: rejectedWithdrawals.length,
      totalPendingAmount,
      totalPaidAmount
    };
  }, [withdrawals]);

  // Filtering
  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter(w => {
      const idMatch = (w._id || '').toLowerCase().includes(searchTerm.toLowerCase());
      const nameMatch = (w.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = (w.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const detailsMatch = (w.details || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = idMatch || nameMatch || emailMatch || detailsMatch;

      const isPaid = w.status === 'Paid' || w.status === 'Completed' || w.status === 'Approved';
      const matchesStatus = statusFilter === 'All' 
        ? true 
        : statusFilter === 'Paid' 
          ? isPaid 
          : w.status === statusFilter;

      let matchesDate = true;
      if (startDate || endDate) {
        const itemDate = new Date(w.createdAt);
        itemDate.setHours(0, 0, 0, 0);
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (itemDate < start) matchesDate = false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (itemDate > end) matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [withdrawals, searchTerm, statusFilter, startDate, endDate]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage) || 1;
  const paginatedWithdrawals = useMemo(() => {
    return filteredWithdrawals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredWithdrawals, currentPage, itemsPerPage]);

  const exportToCSV = () => {
    const headers = [
      'Withdrawal ID',
      'User Name',
      'User Email',
      'Amount (INR)',
      'Payout Method',
      'Payment Details',
      'Status',
      'Admin Note',
      'Date Created'
    ];
    
    const rows = filteredWithdrawals.map(w => [
      `"${w._id}"`,
      `"${w.user?.name || 'N/A'}"`,
      `"${w.user?.email || 'N/A'}"`,
      (w.amount || 0).toFixed(2),
      `"${w.method}"`,
      `"${(w.details || '').replace(/"/g, '""')}"`,
      `"${w.status}"`,
      `"${(w.adminNote || '').replace(/"/g, '""')}"`,
      `"${new Date(w.createdAt).toLocaleString('en-IN')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.setAttribute('href', encodedUri);
    a.setAttribute('download', `LG_Withdrawals_${new Date().toISOString().slice(0, 10)}.csv`);
    a.click();
    toast.success('Filtered Withdrawals CSV report downloaded');
  };

  const getStatusColor = (status) => {
    if (status === 'Paid' || status === 'Completed' || status === 'Approved') {
      return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
    }
    if (status === 'Pending') {
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
    }
    if (status === 'Rejected') {
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
    }
    return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
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
        .metric-icon-bubble.amber {
          background: #fffbeb;
          color: #d97706;
        }
        .metric-icon-bubble.green {
          background: #ecfdf5;
          color: #059669;
        }
        .metric-icon-bubble.blue {
          background: #eff6ff;
          color: #2563eb;
        }
        .metric-icon-bubble.emerald {
          background: #f0fdf4;
          color: #16a34a;
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

        /* ID tag */
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

        /* Status & Payment Badge (matches Orders page) */
        .official-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.6rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid;
          white-space: nowrap;
        }
        .status-dot-circle {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .payment-pill-official {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .payment-pill-official.paid {
          color: #059669;
        }
        .payment-pill-official.pending {
          color: #d97706;
        }
        .payment-pill-official.rejected {
          color: #dc2626;
        }
        .payment-pill-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .settled-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.55rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #64748b;
          white-space: nowrap;
        }
        .settled-badge.paid {
          background: #f0fdf4;
          border-color: #bbf7d0;
          color: #16a34a;
        }
        .settled-badge.rejected {
          background: #fef2f2;
          border-color: #fecaca;
          color: #dc2626;
        }

        /* Payment Details box */
        .details-pill-box {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #334155;
          max-width: 240px;
        }
        .details-pill-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .mini-copy-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 0.7rem;
        }
        .mini-copy-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        /* Method Badge */
        .method-badge {
          display: inline-block;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-align: center;
          white-space: nowrap;
        }
        .method-badge.upi {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        .method-badge.bank {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        /* Action buttons */
        .action-mark-paid-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.35rem 0.65rem;
          background: #10b981;
          color: #ffffff;
          border: 1px solid #10b981;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 1px 2px rgba(16, 185, 129, 0.2);
          white-space: nowrap;
        }
        .action-mark-paid-btn:hover {
          background: #059669;
          border-color: #059669;
        }
        .action-reject-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.35rem 0.65rem;
          background: #ffffff;
          color: #ef4444;
          border: 1px solid #fca5a5;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .action-reject-btn:hover {
          background: #fef2f2;
          border-color: #ef4444;
          color: #dc2626;
        }

        /* Loading Skeleton */
        .loading-shimmer-row {
          height: 48px;
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
          background: #4f46e5;
          color: #ffffff;
          border-color: #4f46e5;
        }
      `}</style>

      {/* Top Header & Page Actions */}
      <div className="orders-header-section">
        <div className="orders-page-title-row">
          <div className="orders-page-title-group">
            <h2>Wallet Withdrawal Requests</h2>
            <p>Review customer payout requests, execute manual UPI/Bank transfer, and mark as completed.</p>
          </div>
          <div className="header-actions-group">
            <button 
              className="refresh-btn" 
              onClick={() => fetchWithdrawals(true)} 
              disabled={refreshing}
              title="Refresh withdrawal records"
            >
              <FiRefreshCw className={refreshing ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="export-btn-official" onClick={exportToCSV} title="Export filtered list to CSV">
              <FiDownload size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Executive Metric Cards */}
        <div className="metrics-grid-official">
          <div className="metric-card-official">
            <div className="metric-icon-bubble amber">
              <FiClock />
            </div>
            <div className="metric-details">
              <span className="metric-title">Needs Payout</span>
              <span className="metric-value">₹{metrics.totalPendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="metric-card-official">
            <div className="metric-icon-bubble green">
              <FaRupeeSign />
            </div>
            <div className="metric-details">
              <span className="metric-title">Total Paid Out</span>
              <span className="metric-value">₹{metrics.totalPaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="metric-card-official">
            <div className="metric-icon-bubble blue">
              <FiDollarSign />
            </div>
            <div className="metric-details">
              <span className="metric-title">Total Requests</span>
              <span className="metric-value">{metrics.totalCount}</span>
            </div>
          </div>

          <div className="metric-card-official">
            <div className="metric-icon-bubble emerald">
              <FiCheckCircle />
            </div>
            <div className="metric-details">
              <span className="metric-title">Settled Count</span>
              <span className="metric-value">{metrics.paidCount}</span>
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
              placeholder="Search by ID, customer, email, UPI..." 
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
            {[
              { label: 'All', key: 'All', count: withdrawals.length },
              { label: 'Pending', key: 'Pending', count: metrics.pendingCount },
              { label: 'Paid', key: 'Paid', count: metrics.paidCount },
              { label: 'Rejected', key: 'Rejected', count: metrics.rejectedCount }
            ].map(tab => (
              <button
                key={tab.key}
                className={`filter-pill ${statusFilter === tab.key ? 'active' : ''}`}
                onClick={() => { setStatusFilter(tab.key); setCurrentPage(1); }}
              >
                <span>{tab.label}</span>
                <span className="filter-pill-badge">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="official-table-wrapper">
          <table className="official-table">
            <thead>
              <tr>
                <th>Withdrawal ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Payment Info Provided</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && withdrawals.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '2rem 1.5rem' }}>
                    <div className="loading-shimmer-row"></div>
                    <div className="loading-shimmer-row"></div>
                    <div className="loading-shimmer-row"></div>
                  </td>
                </tr>
              ) : paginatedWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: '#94a3b8' }}>
                    <FiAlertCircle style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }} />
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>No withdrawal requests found</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Try adjusting your search query or filter settings</div>
                  </td>
                </tr>
              ) : (
                paginatedWithdrawals.map(w => {
                  const isPending = w.status === 'Pending';
                  const isPaid = w.status === 'Paid' || w.status === 'Completed' || w.status === 'Approved';
                  const statusStyle = getStatusColor(w.status);
                  const { date, time } = formatTimestamp(w.createdAt);
                  const customerInitials = (w.user?.name || 'C').charAt(0).toUpperCase();

                  return (
                    <tr key={w._id}>
                      {/* Withdrawal ID */}
                      <td>
                        <button 
                          className="order-id-tag" 
                          onClick={(e) => handleCopy(e, w._id, `id_${w._id}`)}
                          title="Click to copy full ID"
                        >
                          <span>#{w._id.substring(w._id.length - 8).toUpperCase()}</span>
                          {copiedId === `id_${w._id}` ? (
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
                            <div className="customer-name">{w.user?.name || 'Customer'}</div>
                            <div className="customer-email">{w.user?.email || 'No email attached'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#059669', whiteSpace: 'nowrap' }}>
                          ₹{Number(w.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Method */}
                      <td>
                        <span className={`method-badge ${w.method === 'UPI' ? 'upi' : 'bank'}`}>
                          {w.method}
                        </span>
                      </td>

                      {/* Payment Info Details */}
                      <td>
                        <div className="details-pill-box">
                          <span className="details-pill-text" title={w.details}>
                            {w.details}
                          </span>
                          <button
                            type="button"
                            className="mini-copy-btn"
                            onClick={(e) => handleCopy(e, w.details, `det_${w._id}`)}
                            title="Copy details"
                          >
                            {copiedId === `det_${w._id}` ? <FiCheck style={{ color: '#10b981' }} /> : <FiCopy />}
                            <span>{copiedId === `det_${w._id}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        {w.adminNote && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px', fontStyle: 'italic' }}>
                            Ref: {w.adminNote}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        {isPaid ? (
                          <span className="payment-pill-official paid">
                            <span className="payment-pill-dot"></span>
                            <span>Paid</span>
                          </span>
                        ) : w.status === 'Rejected' ? (
                          <span className="payment-pill-official rejected">
                            <span className="payment-pill-dot"></span>
                            <span>Rejected</span>
                          </span>
                        ) : (
                          <span 
                            className="official-status-badge"
                            style={{
                              background: statusStyle.bg,
                              color: statusStyle.text,
                              borderColor: statusStyle.border
                            }}
                          >
                            <span className="status-dot-circle"></span>
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#1e293b' }}>{date}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>{time}</div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        {isPending ? (
                          <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button 
                              className="action-mark-paid-btn"
                              onClick={() => openActionModal(w, 'Paid')}
                              title="Mark as paid after manual transfer"
                            >
                              Mark as Paid
                            </button>
                            <button 
                              className="action-reject-btn"
                              onClick={() => openActionModal(w, 'Rejected')}
                              title="Reject withdrawal"
                            >
                              Reject
                            </button>
                          </div>
                        ) : isPaid ? (
                          <span className="settled-badge paid" title={w.adminNote ? `Ref: ${w.adminNote}` : 'Payment Completed'}>
                            Completed
                          </span>
                        ) : (
                          <span className="settled-badge rejected" title={w.adminNote ? `Reason: ${w.adminNote}` : 'Rejected'}>
                            Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredWithdrawals.length > 0 && (
          <div className="table-pagination-footer">
            <div className="pagination-meta">
              <span>
                Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredWithdrawals.length)}</strong> of <strong>{filteredWithdrawals.length}</strong> entries
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Rows per page:</span>
                <select 
                  className="rows-select"
                  value={itemsPerPage}
                  onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="pagination-controls-row">
              <button 
                className="pagination-nav-btn" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <FiChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal (Mark as Paid / Reject) */}
      {actionModal.open && actionModal.withdrawal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.75rem',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: 700 }}>
              {actionModal.status === 'Paid' ? 'Confirm Manual Payment' : 'Reject Withdrawal Request'}
            </h3>
            
            <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.8rem' }}>
              {actionModal.status === 'Paid' 
                ? 'After paying manually through UPI/Bank, click confirm to mark as Paid and deduct wallet balance.' 
                : 'Reject this request. The funds will remain in their wallet.'}
            </p>

            {/* Recipient & Payment Info Box */}
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.85rem 1rem', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Recipient:</span>
                <strong style={{ fontSize: '0.8rem', color: '#0f172a' }}>{actionModal.withdrawal.user?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Amount to Pay:</span>
                <strong style={{ fontSize: '1.05rem', color: '#059669' }}>₹{actionModal.withdrawal.amount.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Method:</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5' }}>{actionModal.withdrawal.method}</span>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '6px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '3px' }}>Pay To Details:</div>
                <div style={{ 
                  background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', 
                  fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span>{actionModal.withdrawal.details}</span>
                  <button 
                    type="button" 
                    onClick={(e) => handleCopy(e, actionModal.withdrawal.details, 'modal')}
                    style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {copiedId === 'modal' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmAction}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                  {actionModal.status === 'Paid' ? 'Payment Reference / Transaction ID (Optional):' : 'Reason for Rejection:'}
                </label>
                <input
                  type="text"
                  required={actionModal.status === 'Rejected'}
                  value={actionModal.adminNote}
                  onChange={e => setActionModal({ ...actionModal, adminNote: e.target.value })}
                  placeholder={actionModal.status === 'Paid' ? 'e.g. UPI Ref / UTR: 40982390123' : 'e.g. Invalid UPI ID provided'}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setActionModal({ open: false, withdrawal: null, status: 'Paid', adminNote: '', submitting: false })}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionModal.submitting}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                    background: actionModal.status === 'Paid' ? '#10b981' : '#ef4444',
                    color: '#fff', fontWeight: 700, cursor: actionModal.submitting ? 'not-allowed' : 'pointer', fontSize: '0.8rem'
                  }}
                >
                  {actionModal.submitting ? 'Processing...' : (actionModal.status === 'Paid' ? 'Confirm & Mark Paid' : 'Confirm Rejection')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;
