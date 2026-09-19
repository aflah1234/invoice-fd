import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function CustomerHome() {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
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
      <div style={{
        background: 'linear-gradient(135deg, #059669, #0891b2)',
        borderRadius: '0.75rem', padding: '1.5rem 2rem', color: '#fff',
        marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Welcome, {user?.name}! 👋</h2>
          <p style={{ opacity: 0.9, fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Browse stores, select items, and get instant quotations.
          </p>
        </div>
        <Link to="/customer/stores" className="btn" style={{ background: '#fff', color: '#059669', fontWeight: 600 }}>
          Browse Stores →
        </Link>
      </div>

      {/* WhatsApp setup warning */}
      {!hasWaKey && (
        <div className="alert alert-info" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span>📱 Set up your WhatsApp API key to receive quotations directly on WhatsApp.</span>
          <Link to="/customer/profile" className="btn btn-primary btn-sm">Set Up Now</Link>
        </div>
      )}

      <div className="grid-2">
        {/* Stores preview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Available Stores</h3>
            <Link to="/customer/stores" style={{ fontSize: '0.8rem', color: '#2563eb' }}>View all →</Link>
          </div>
          {stores.length === 0 ? (
            <div className="empty-state"><p>No stores available yet.</p></div>
          ) : stores.map((store) => (
            <Link
              key={store._id}
              to={`/customer/stores/${store._id}/items`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6', textDecoration: 'none', color: 'inherit' }}
            >
              {store.logo ? (
                <img src={`/uploads/${store.logo}`} alt={store.name} style={{ width: 40, height: 40, borderRadius: '0.4rem', objectFit: 'cover', border: '1px solid #e5e7eb' }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: '0.4rem', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🏪</div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{store.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{store.category}</div>
              </div>
              <span style={{ color: '#2563eb', fontSize: '0.8rem' }}>→</span>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Orders</h3>
            <Link to="/customer/orders" style={{ fontSize: '0.8rem', color: '#2563eb' }}>View all →</Link>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state">
              <p>No orders yet.</p>
              <Link to="/customer/stores" style={{ color: '#2563eb', fontSize: '0.875rem' }}>Start shopping →</Link>
            </div>
          ) : orders.map((o) => (
            <Link
              key={o._id}
              to={`/customer/orders/${o._id}`}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6', textDecoration: 'none', color: 'inherit' }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.orderNumber}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{o.storeName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.875rem' }}>{o.total?.toFixed(2)}</div>
                <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                  {new Date(o.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
