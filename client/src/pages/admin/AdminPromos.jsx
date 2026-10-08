import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { FiTag, FiPercent, FiPlus, FiTrash2, FiGift, FiSearch, FiCheckCircle } from 'react-icons/fi';

const AdminPromos = () => {
  const { token } = useOutletContext();
  const [promos, setPromos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('');

  useEffect(() => {
    fetchPromos();
  }, [token]);

  const fetchPromos = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/promos`, {
        headers: { 'x-auth-token': token }
      });
      setPromos(res.data);
    } catch (err) {
      console.error('Failed to fetch promos', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/promos`,
        { 
          code, 
          discountType, 
          discountValue: Number(discountValue), 
          maxUses: maxUses ? Number(maxUses) : null,
          isActive: true
        },
        { headers: { 'x-auth-token': token } }
      );
      setCode(''); setDiscountValue(''); setMaxUses('');
      fetchPromos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating promo code');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/promos/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchPromos();
    } catch (err) {
      alert('Error deleting promo code');
    }
  };

  const filteredPromos = promos.filter(p => 
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-tab-content">
      <style>{`
        .admin-tab-content {
          position: relative;
          min-height: 100%;
        }
        .ambient-glow-1 {
          position: absolute;
          top: 30px;
          right: 8%;
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(79, 70, 229, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(55px);
        }
        .ambient-glow-2 {
          position: absolute;
          top: 340px;
          left: 5%;
          width: 340px;
          height: 340px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(236, 72, 153, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(55px);
        }

        .glass-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.45) 100%);
          backdrop-filter: blur(24px) saturate(190%);
          -webkit-backdrop-filter: blur(24px) saturate(190%);
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 20px;
          box-shadow: 
            0 10px 30px -5px rgba(15, 23, 42, 0.05),
            0 2px 6px -1px rgba(15, 23, 42, 0.03),
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.95);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .glass-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%);
          pointer-events: none;
          z-index: 0;
        }

        .promo-split-grid {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 2rem;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 950px) {
          .promo-split-grid {
            grid-template-columns: 1fr;
          }
        }

        .glass-input {
          background: rgba(255, 255, 255, 0.85);
          border: 1.5px solid rgba(226, 232, 240, 0.9);
          border-radius: 12px;
          padding: 0.8rem 1.1rem;
          width: 100%;
          outline: none;
          font-family: inherit;
          font-size: 0.95rem;
          color: #0f172a;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }
        .glass-input:focus {
          border-color: #4f46e5;
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
        }

        .btn-indigo-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 12px;
          padding: 0.85rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.32), inset 0 1px 1px rgba(255, 255, 255, 0.4);
        }
        .btn-indigo-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(79, 70, 229, 0.45);
        }
        .btn-indigo-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-action-delete {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 0.45rem 0.9rem;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
        }
        .btn-action-delete:hover {
          background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(79, 70, 229, 0.4);
        }

        .promo-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          text-align: left;
        }
        .promo-table th {
          background: rgba(248, 250, 252, 0.7);
          color: #475569;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 1rem 1.4rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }
        .promo-table td {
          padding: 1.1rem 1.4rem;
          border-bottom: 1px solid rgba(241, 245, 249, 0.8);
          color: #1e293b;
          font-size: 0.92rem;
          vertical-align: middle;
          transition: background 0.2s ease;
        }
        .promo-table tr:hover td {
          background: rgba(255, 255, 255, 0.6);
        }
        .promo-table tr:last-child td {
          border-bottom: none;
        }

        .promo-code-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(79, 70, 229, 0.08);
          color: #4f46e5;
          border: 1.5px dashed rgba(79, 70, 229, 0.35);
          border-radius: 8px;
          padding: 0.35rem 0.75rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.88rem;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .discount-pill {
          display: inline-flex;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
        }
        .discount-pill.pct {
          background: rgba(16, 185, 129, 0.12);
          color: #047857;
          border: 1px solid rgba(16, 185, 129, 0.28);
        }
        .discount-pill.fixed {
          background: rgba(245, 158, 11, 0.12);
          color: #b45309;
          border: 1px solid rgba(245, 158, 11, 0.28);
        }

        .active-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
          background: rgba(16, 185, 129, 0.12);
          color: #047857;
          border: 1px solid rgba(16, 185, 129, 0.28);
        }
        .inactive-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
          background: rgba(239, 68, 68, 0.12);
          color: #b91c1c;
          border: 1px solid rgba(239, 68, 68, 0.28);
        }

        .cat-icon-chip {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(79, 70, 229, 0.1);
          color: #4f46e5;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          border: 1px solid rgba(79, 70, 229, 0.2);
        }
      `}</style>

      {/* Ambient background glows */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '0.5rem', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 0.25rem 0', fontWeight: '800', letterSpacing: '-0.5px' }}>Promo Codes</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Create promotional voucher discounts and redemption limits</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 1rem', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.25)', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5', boxShadow: '0 0 8px #4f46e5' }}></span>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#4f46e5', letterSpacing: '0.3px' }}>
            {promos.length} PROMOS ACTIVE
          </span>
        </div>
      </div>

      <div className="promo-split-grid">
        {/* Left Form: Create Promo */}
        <div className="glass-card" style={{ padding: '2rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
            <div className="cat-icon-chip">
              <FiGift />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>New Promo Code</h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Configure discount voucher rules</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                Promo Voucher Code *
              </label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="e.g. SUMMER50" 
                value={code} 
                onChange={e => setCode(e.target.value.toUpperCase())} 
                required 
                style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                Discount Type *
              </label>
              <select className="glass-input" value={discountType} onChange={e => setDiscountType(e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                Discount Value ({discountType === 'percentage' ? '%' : '₹'}) *
              </label>
              <input 
                type="number" 
                min="1" 
                className="glass-input" 
                placeholder={discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'} 
                value={discountValue} 
                onChange={e => setDiscountValue(e.target.value)} 
                required 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.45rem' }}>
                Maximum Uses
              </label>
              <input 
                type="number" 
                min="1" 
                className="glass-input" 
                placeholder="e.g. 100 (Blank for unlimited)" 
                value={maxUses} 
                onChange={e => setMaxUses(e.target.value)} 
              />
              <small style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                Leave empty for unlimited customer redemptions
              </small>
            </div>

            <button type="submit" className="btn-indigo-submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
              <FiPlus style={{ fontSize: '1.15rem' }} />
              {loading ? 'Creating...' : 'Create Promo Code'}
            </button>
          </form>
        </div>

        {/* Right Table: Promos List */}
        <div className="glass-card">
          <div style={{ padding: '1.5rem 1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FiTag style={{ color: '#4f46e5', fontSize: '1.2rem' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: '800' }}>Active Vouchers</h3>
            </div>
            <div style={{ width: '220px' }}>
              <input 
                type="text" 
                className="glass-input" 
                style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem' }}
                placeholder="Search promo..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto', position: 'relative', zIndex: 1 }}>
            <table className="promo-table">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Voucher Code</th>
                  <th style={{ width: '22%' }}>Discount</th>
                  <th style={{ width: '20%' }}>Usage</th>
                  <th style={{ width: '15%' }}>Status</th>
                  <th style={{ width: '13%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromos.map(p => (
                  <tr key={p._id}>
                    <td>
                      <span className="promo-code-badge">
                        <FiTag style={{ fontSize: '0.8rem' }} /> {p.code}
                      </span>
                    </td>
                    <td>
                      <span className={`discount-pill ${p.discountType === 'percentage' ? 'pct' : 'fixed'}`}>
                        {p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `₹${p.discountValue?.toLocaleString('en-IN')} OFF`}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#334155' }}>
                        {p.currentUses || 0} <span style={{ color: '#94a3b8', fontWeight: '500' }}>/ {p.maxUses ? p.maxUses : '∞'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={p.isActive ? 'active-pill' : 'inactive-pill'}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDelete(p._id)} className="btn-action-delete">
                        <FiTrash2 style={{ fontSize: '0.9rem' }} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPromos.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏷️</div>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem', color: '#475569' }}>No promo codes found</p>
                      <small style={{ color: '#94a3b8' }}>Try adjusting your search or create a new code on the left</small>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPromos;
