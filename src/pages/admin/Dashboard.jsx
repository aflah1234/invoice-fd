import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import API from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/stats')
      .then(({ data }) => {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Dashboard"><div className="spinner" /></Layout>;

  return (
    <Layout title="Admin Dashboard">
      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">👤</div>
          <div>
            <div className="stat-value">{stats?.totalOwners ?? 0}</div>
            <div className="stat-label">Total Owners</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">🛍️</div>
          <div>
            <div className="stat-value">{stats?.totalCustomers ?? 0}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-yellow">🏪</div>
          <div>
            <div className="stat-value">{stats?.totalStores ?? 0}</div>
            <div className="stat-label">Total Stores</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">📋</div>
          <div>
            <div className="stat-value">{stats?.totalOrders ?? 0}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <div className="empty-state"><p>No orders yet.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Store</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td><strong>{o.orderNumber}</strong></td>
                    <td>{o.customerName}</td>
                    <td>{o.storeName}</td>
                    <td><strong>{o.total?.toFixed(2)}</strong></td>
                    <td><StatusBadge status={o.status} /></td>
                    <td style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
