import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const BACKEND = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : '';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [items, setItems]     = useState([]);
  const [store, setStore]     = useState(null);
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

  const pendingCount   = orders.filter((o) => o.status === 'pending').length;
  const confirmedCount = orders.filter((o) => ['confirmed', 'processing'].includes(o.status)).length;
  const totalRevenue   = orders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.total, 0);

  const statCards = [
    { label: 'Total Items',   value: items.length,            icon: '📦', color: 'blue',   to: '/owner/items' },
    { label: 'Pending',       value: pendingCount,            icon: '⏳', color: 'yellow', to: '/owner/orders' },
    { label: 'In Progress',   value: confirmedCount,          icon: '⚙️', color: 'purple', to: '/owner/orders' },
    { label: 'Revenue (PKR)', value: totalRevenue.toFixed(0), icon: '💰', color: 'green',  to: '/owner/orders' },
  ];

  return (
    <Layout title="Dashboard">

      {/* Welcome Banner */}
      <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)' }}>
        <div>
          <h2>Welcome back, {user?.name}! 👋</h2>
          <p>
            {store?.name}
            {store?.category && <> &nbsp;·&nbsp; <span style={{ opacity: 0.75 }}>{store.category}</span></>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/owner/items" className="btn btn-white btn-sm">+ Add Item</Link>
          <Link to="/owner/orders" className="btn btn-sm"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
            View Orders
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {statCards.map((s) => (
          <Link key={s.label} to={s.to} style={{ textDecoration: 'none' }}>
            <div className={`stat-card ${s.color}`} style={{ cursor: 'pointer', height: '100%' }}>
              <div className="stat-card-inner">
                <div className={`stat-icon stat-icon-${s.color}`}>{s.icon}</div>
                <div className="stat-info">
                  <div className="stat-value">
                    {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Grid */}
      <div className="grid-2">

        {/* Recent Orders */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header" style={{ padding: '1.1rem 1.4rem' }}>
            <span className="card-title">Recent Orders</span>
            <Link to="/owner/orders" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
              View all →
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
              <span className="icon" style={{ fontSize: '2.5rem' }}>📋</span>
              <p>No orders yet</p>
            </div>
          ) : (
            <div style={{ padding: '0 0.5rem 0.75rem' }}>
              {orders.slice(0, 6).map((o) => (
                <Link
                  key={o._id}
                  to={`/owner/orders/${o._id}`}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-md)',
                    textDecoration: 'none', color: 'inherit',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-50)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--dark)' }}>
                      {o.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.1rem' }}>{o.customerName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge status={o.status} />
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
                      {Number(o.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header" style={{ padding: '1.1rem 1.4rem' }}>
            <span className="card-title">Catalogue</span>
            <Link to="/owner/items" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
              Manage →
            </Link>
          </div>
          {items.length === 0 ? (
            <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
              <span className="icon" style={{ fontSize: '2.5rem' }}>📦</span>
              <p>No items yet</p>
              <Link to="/owner/items" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600 }}>
                Add your first item →
              </Link>
            </div>
          ) : (
            <div style={{ padding: '0 0.5rem 0.75rem' }}>
              {items.slice(0, 7).map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                    padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)',
                  }}
                >
                  {item.images?.[0] ? (
                    <img
                      src={`${BACKEND}/uploads/${item.images[0]}`}
                      alt={item.name}
                      style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--gray-100)', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)', flexShrink: 0 }}>
                      📦
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{item.unit}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem', flexShrink: 0 }}>
                    {Number(item.price).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
