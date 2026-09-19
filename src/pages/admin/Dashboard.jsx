import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import API from '../../api/axios';

const statCards = (stats) => [
  { label: 'Total Owners',    value: stats?.totalOwners    ?? 0, icon: '👤', color: 'blue',   sub: 'Store owners' },
  { label: 'Total Customers', value: stats?.totalCustomers ?? 0, icon: '🛍️', color: 'green',  sub: 'Registered buyers' },
  { label: 'Total Stores',    value: stats?.totalStores    ?? 0, icon: '🏪', color: 'yellow', sub: 'Active stores' },
  { label: 'Total Orders',    value: stats?.totalOrders    ?? 0, icon: '📋', color: 'purple', sub: 'All time orders' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/stats')
      .then(({ data }) => { setStats(data.stats); setRecentOrders(data.recentOrders); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Dashboard"><div className="spinner" /></Layout>;

  return (
    <Layout title="Admin Dashboard">
      {/* ── Stat Cards ── */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {statCards(stats).map((s) => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className="stat-card-inner">
              <div className={`stat-icon stat-icon-${s.color}`}>{s.icon}</div>
              <div className="stat-info">
                <div className="stat-value">{s.value.toLocaleString()}</div>
                <div className="stat-label">{s.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.2rem' }}>{s.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Orders ── */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="card-title">Recent Orders</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: '0.15rem' }}>Latest activity across all stores</div>
          </div>
          <span className="badge badge-blue">{recentOrders.length} orders</span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <span className="icon">📋</span>
            <h3>No orders yet</h3>
            <p>Orders will appear here once customers start placing them.</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
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
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--dark)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                        {o.orderNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.customerName}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{o.storeName}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--dark)' }}>
                        {o.total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td><StatusBadge status={o.status} /></td>
                    <td style={{ color: 'var(--gray-400)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
