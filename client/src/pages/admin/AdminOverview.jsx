import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiDollarSign } from 'react-icons/fi';

const AdminOverview = () => {
  const { stats } = useOutletContext();
  if (!stats) return null;

  return (
    <div className="admin-tab-content">
      <div className="stats-grid">
        <div className="stat-card stat-users">
          <div className="stat-icon-wrapper">
            <FiUsers className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p>{stats.usersCount}</p>
          </div>
        </div>
        
        <div className="stat-card stat-orders">
          <div className="stat-icon-wrapper">
            <FiShoppingBag className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p>{stats.ordersCount}</p>
          </div>
        </div>

        <div className="stat-card stat-revenue">
          <div className="stat-icon-wrapper">
            <FiDollarSign className="stat-icon" />
          </div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p>₹{stats.revenue.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* Example Data Table Placeholder */}
      <div className="recent-orders-section">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <button className="btn-view-all">View All</button>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#ORD-8391</td>
                <td>John Doe</td>
                <td>₹12,400</td>
                <td><span className="status-badge success">Delivered</span></td>
              </tr>
              <tr>
                <td>#ORD-8392</td>
                <td>Jane Smith</td>
                <td>₹4,200</td>
                <td><span className="status-badge pending">Processing</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
