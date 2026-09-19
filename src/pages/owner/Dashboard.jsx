import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/owner/store'),
      API.get('/owner/items'),
      API.get('/owner/orders?limit=5'),
    ])
      .then(([storeRes, itemsRes, ordersRes]) => {
        setStore(storeRes.data.store);
        setItems(itemsRes.data.items);
        setOrders(ordersRes.data.orders);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Dashboard"><div className="spinner" /></Layout>;

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((s, o) => s + o.total, 0);

  return (
    <Layout title="Owner Dashboard">
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af, #7c3aed)',
        borderRadius: '0.75rem', padding: '1.5rem', color: '#fff',
        marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Welcome back, {user?.name}!</h2>
          <p style={{ opacity: 0.85, fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {store?.name} &nbsp;·&nbsp; {store?.category}
          </p>
        </div>
        <Link to="/owner/items" className="btn" style={{ background: '#fff', color: '#1e40af', fontWeight: 600 }}>
          + Add Item
        </Link>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">📦</div>
          <div>
            <div className="stat-value">{items.length}</div>
            <div className="stat-label">Total Items</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-yellow">⏳</div>
          <div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">📋</div>
          <div>
            <div className="stat-value">{orders.length}</div>
            <div className="stat-label">Recent Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">💰</div>
          <div>
            <div className="stat-value">{totalRevenue.toFixed(0)}</div>
            <div className="stat-label">Revenue (completed)</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent Orders */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Orders</h3>
            <Link to="/owner/orders" style={{ fontSize: '0.8rem', color: '#2563eb' }}>View all →</Link>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state"><p>No orders yet.</p></div>
          ) : orders.slice(0, 5).map((o) => (
            <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.orderNumber}</div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{o.customerName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <StatusBadge status={o.status} />
                <div style={{ fontSize: '0.78rem', color: '#374151', marginTop: '0.2rem' }}>
                  {o.total?.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Items at a glance */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Items</h3>
            <Link to="/owner/items" style={{ fontSize: '0.8rem', color: '#2563eb' }}>Manage →</Link>
          </div>
          {items.length === 0 ? (
            <div className="empty-state"><p>No items yet. <Link to="/owner/items">Add your first item.</Link></p></div>
          ) : items.slice(0, 6).map((item) => (
            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {item.images?.[0] ? (
                  <img src={`/uploads/${item.images[0]}`} alt={item.name} style={{ width: 36, height: 36, borderRadius: '0.35rem', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: '0.35rem', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>📦</div>
                )}
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.unit}</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.9rem' }}>{item.price}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
