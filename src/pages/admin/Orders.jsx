import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import API from '../../api/axios';

const STATUSES = ['', 'pending', 'confirmed', 'processing', 'completed', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (status) params.set('status', status);
    API.get(`/admin/orders?${params}`)
      .then(({ data }) => {
        setOrders(data.orders);
        setTotal(data.total);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, status]); // eslint-disable-line

  const filtered = orders.filter(
    (o) =>
      !search ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.storeName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="All Orders">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Orders ({total})</h1>
      </div>

      <div className="search-bar">
        <input className="search-input" placeholder="Search order#, customer, store…" value={search} onChange={(e) => setSearch(e.target.value)} />
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
      ) : (
        <>
          <div className="table-wrap card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Store</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>WA Sent</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>No orders found</td></tr>
                ) : filtered.map((o) => (
                  <tr key={o._id}>
                    <td><strong>{o.orderNumber}</strong></td>
                    <td>
                      <div>{o.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{o.customerPhone}</div>
                    </td>
                    <td>{o.storeName}</td>
                    <td style={{ textAlign: 'center' }}>{o.items?.length}</td>
                    <td><strong>{o.total?.toFixed(2)}</strong></td>
                    <td><StatusBadge status={o.status} /></td>
                    <td style={{ textAlign: 'center' }}>
                      {o.quotationSentToCustomer
                        ? <span className="badge badge-green">✓</span>
                        : <span className="badge badge-gray">—</span>
                      }
                    </td>
                    <td style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
