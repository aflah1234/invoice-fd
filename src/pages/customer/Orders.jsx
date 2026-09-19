import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import API from '../../api/axios';

const STATUSES = ['', 'pending', 'confirmed', 'processing', 'completed', 'cancelled'];

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (status) params.set('status', status);
    API.get(`/customer/orders?${params}`)
      .then(({ data }) => {
        setOrders(data.orders);
        setTotal(data.total);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, status]); // eslint-disable-line

  return (
    <Layout title="My Orders">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>My Orders ({total})</h1>
        <Link to="/customer/stores" className="btn btn-primary btn-sm">+ New Order</Link>
      </div>

      <div className="search-bar">
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : orders.length === 0 ? (
        <div className="empty-state card">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h3>No orders yet</h3>
          <p>Browse stores and select items to get a quotation.</p>
          <Link to="/customer/stores" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Stores</Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {orders.map((o) => (
              <Link
                key={o._id}
                to={`/customer/orders/${o._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', flexWrap: 'wrap', gap: '0.75rem', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{o.orderNumber}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.15rem' }}>
                        🏪 {o.storeName} &nbsp;·&nbsp; {o.items?.length} item{o.items?.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '1rem' }}>{o.total?.toFixed(2)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.72rem' }}>
                      {o.quotationSentToCustomer && (
                        <span className="badge badge-green">📋 Quote sent</span>
                      )}
                      {o.invoiceSentToCustomer && (
                        <span className="badge badge-blue">🧾 Invoice sent</span>
                      )}
                    </div>
                    <span style={{ color: '#9ca3af' }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {pages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
              <span style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                Page {page} of {pages}
              </span>
              <button className="btn btn-outline btn-sm" disabled={page === pages} onClick={() => setPage(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
