import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const BACKEND = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : '';

const timeGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function CustomerHome() {
  const { user } = useAuth();
  const [stores, setStores]   = useState([]);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/customer/stores?limit=6'),
      API.get('/customer/orders?limit=5'),
    ])
      .then(([storesRes, ordersRes]) => {
        setStores(storesRes.data.stores?.slice(0, 6) || []);
        setOrders(ordersRes.data.orders?.slice(0, 5) || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Home"><div className="spinner" /></Layout>;

  const hasWaKey = !!user?.whatsappApiKey;

  return (
    <Layout title="Home">

      {/* Welcome Banner */}
      <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)' }}>
        <div>
          <h2>{timeGreeting()}, {user?.name}! 👋</h2>
          <p>Browse stores, add items to cart, and get instant quotations.</p>
        </div>
        <Link to="/customer/stores" className="btn btn-white btn-sm">
          Browse Stores →
        </Link>
      </div>

      {/* WhatsApp setup nudge */}
      {!hasWaKey && (
        <div className="alert alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📱</span>
            <span>Set up your WhatsApp API key to receive quotations directly on WhatsApp.</span>
          </div>
          <Link to="/customer/profile" className="btn btn-primary btn-sm">Set Up Now</Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { icon: '🏪', label: 'Available Stores', value: stores.length, color: 'blue',   to: '/customer/stores' },
          { icon: '📋', label: 'My Orders',         value: orders.length, color: 'green',  to: '/customer/orders' },
          { icon: '✅', label: 'Completed',          value: orders.filter(o => o.status === 'completed').length, color: 'teal', to: '/customer/orders' },
          { icon: '⏳', label: 'Pending',            value: orders.filter(o => o.status === 'pending').length,   color: 'yellow', to: '/customer/orders' },
        ].map((s) => (
          <Link key={s.label} to={s.to} style={{ textDecoration: 'none' }}>
            <div className={`stat-card ${s.color}`} style={{ cursor: 'pointer', height: '100%' }}>
              <div className="stat-card-inner">
                <div className={`stat-icon stat-icon-${s.color}`}>{s.icon}</div>
                <div className="stat-info">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid-2">

        {/* Stores */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header" style={{ padding: '1.1rem 1.4rem' }}>
            <span className="card-title">Available Stores</span>
            <Link to="/customer/stores" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
              View all →
            </Link>
          </div>
          {stores.length === 0 ? (
            <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
              <span className="icon" style={{ fontSize: '2.5rem' }}>🏪</span>
              <p>No stores available yet.</p>
            </div>
          ) : (
            <div style={{ padding: '0 0.5rem 0.75rem' }}>
              {stores.map((store) => (
                <Link
                  key={store._id}
                  to={`/customer/stores/${store._id}/items`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                    padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)',
                    textDecoration: 'none', color: 'inherit',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-50)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {store.logo ? (
                    <img
                      src={`${BACKEND}/uploads/${store.logo}`}
                      alt={store.name}
                      style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1.5px solid var(--gray-100)', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--brand-100), var(--brand-200))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                      🏪
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.1rem' }}>{store.category}</div>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header" style={{ padding: '1.1rem 1.4rem' }}>
            <span className="card-title">Recent Orders</span>
            <Link to="/customer/orders" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
              View all →
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
              <span className="icon" style={{ fontSize: '2.5rem' }}>🛒</span>
              <h3>No orders yet</h3>
              <p style={{ marginTop: '0.35rem' }}>
                <Link to="/customer/stores" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  Start shopping →
                </Link>
              </p>
            </div>
          ) : (
            <div style={{ padding: '0 0.5rem 0.75rem' }}>
              {orders.map((o) => (
                <Link
                  key={o._id}
                  to={`/customer/orders/${o._id}`}
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.1rem' }}>{o.storeName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge status={o.status} />
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
                      {Number(o.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
