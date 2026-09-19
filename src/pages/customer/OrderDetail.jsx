import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import API from '../../api/axios';

const downloadFile = async (url, filename) => {
  try {
    const res = await API.get(url, { responseType: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([res.data]));
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch {
    toast.error('Download failed. Please try again.');
  }
};

function QuotationDocument({ order }) {
  return (
    <div id="quotation-print" style={{
      background: '#fff', borderRadius: '0.75rem', overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: 780, margin: '0 auto',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ background: '#C0392B', padding: '1.5rem 1.75rem' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.4rem' }}>{order.storeName}</div>
          <div style={{ color: '#ffcccc', fontSize: '0.75rem', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quotation Platform</div>
        </div>
        <div style={{ background: '#1C1C1C', padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: '2rem', letterSpacing: '0.08em' }}>QUOTATION</div>
        </div>
      </div>
      <div style={{ padding: '0.75rem 1.75rem', background: '#fafafa', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.875rem' }}>
          <span style={{ color: '#C0392B', fontWeight: 700 }}>Quotation No: </span>
          <span style={{ fontWeight: 600 }}>#{order.orderNumber}</span>
        </div>
        <div style={{ fontSize: '0.875rem' }}>
          <span style={{ color: '#C0392B', fontWeight: 700 }}>Date: </span>
          <span>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
        </div>
      </div>
      <div style={{ padding: '1rem 1.75rem 0.75rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Quotation To</div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#C0392B' }}>{order.customerName.toUpperCase()}</div>
          <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '0.2rem' }}>{order.customerPhone}</div>
          {order.customerEmail && <div style={{ fontSize: '0.8rem', color: '#555' }}>{order.customerEmail}</div>}
          {order.deliveryAddress && <div style={{ fontSize: '0.8rem', color: '#555' }}>{order.deliveryAddress}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.2rem', textTransform: 'uppercase' }}>From</div>
          <div style={{ fontWeight: 700, color: '#1C1C1C' }}>{order.storeName}</div>
        </div>
      </div>
      <div style={{ padding: '0 1.75rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#C0392B' }}>
              {['Item Description', 'Unit Price', 'QTY', 'Total'].map((h, i) => (
                <th key={h} style={{ padding: '0.6rem 0.85rem', color: '#fff', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: i === 0 ? 'left' : i === 3 ? 'right' : 'center' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <td style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem', color: '#1C1C1C' }}>{item.name}</td>
                <td style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem', color: '#555', textAlign: 'center' }}>${item.price?.toFixed(2)}</td>
                <td style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem', color: '#555', textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                <td style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem', fontWeight: 700, color: '#C0392B', textAlign: 'right' }}>${item.subtotal?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '1rem 1.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          {(order.customerNote || order.ownerNote) && (
            <div>
              <div style={{ fontWeight: 700, color: '#C0392B', fontSize: '0.75rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Notes</div>
              {order.customerNote && <div style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.2rem' }}>Customer: {order.customerNote}</div>}
              {order.ownerNote && <div style={{ fontSize: '0.8rem', color: '#555' }}>Store: {order.ownerNote}</div>}
            </div>
          )}
        </div>
        <div style={{ minWidth: 220 }}>
          {[
            { label: 'Subtotal', value: order.subtotal, show: true },
            { label: 'Discount', value: order.discount, show: order.discount > 0, minus: true },
            { label: 'Tax', value: order.tax, show: order.tax > 0 },
          ].filter(r => r.show).map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0.75rem', background: i % 2 === 0 ? '#f5f5f5' : '#fff', fontSize: '0.875rem' }}>
              <span>{row.label}:</span>
              <strong>{row.minus ? '-' : ''}${row.value?.toFixed(2)}</strong>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0.75rem', background: '#C0392B', marginTop: '0.25rem' }}>
            <span style={{ color: '#fff', fontWeight: 700 }}>GRAND TOTAL</span>
            <strong style={{ color: '#fff' }}>${order.total?.toFixed(2)}</strong>
          </div>
        </div>
      </div>
      <div style={{ background: '#1C1C1C', padding: '0.85rem 1.75rem', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: '#C0392B' }} />
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.04em' }}>Thank You For Your Business</span>
      </div>
    </div>
  );
}

export default function CustomerOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const fetchOrder = () => {
    API.get(`/customer/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch(() => navigate('/customer/orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]); // eslint-disable-line

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const { data } = await API.post(`/customer/orders/${id}/accept`);
      toast.success('Quotation accepted!');
      setOrder(data.order);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    } finally {
      setAccepting(false);
    }
  };

  const handleRequestEdit = async (e) => {
    e.preventDefault();
    if (!editNote.trim()) { toast.error('Please describe what needs to change'); return; }
    setRequesting(true);
    try {
      const { data } = await API.post(`/customer/orders/${id}/request-edit`, { note: editNote });
      toast.success('Edit request sent!');
      setOrder(data.order);
      setShowEditForm(false);
      setEditNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <Layout title="Order Detail"><div className="spinner" /></Layout>;
  if (!order) return <Layout title="Order Detail"><div className="alert alert-error">Order not found.</div></Layout>;

  const ownerSentQuotation = order.quotationSentByOwner || order.invoiceSentToCustomer;
  const isAccepted = order.quotationAccepted;

  const STATE =
    isAccepted             ? 'ACCEPTED' :
    order.editRequested    ? 'EDIT_SUBMITTED' :
    ownerSentQuotation     ? 'RESPOND' :
                             'WAITING';

  return (
    <Layout title={`Quotation — ${order.orderNumber}`}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .sidebar, .topbar { display: none !important; }
          .main-content { margin-left: 0 !important; }
          .page-body { padding: 0 !important; }
          body { background: #fff !important; }
          #quotation-print { box-shadow: none !important; max-width: 100% !important; border-radius: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* Top bar */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/customer/orders')}>← My Orders</button>
        <h1 className="page-title" style={{ margin: 0 }}>{order.orderNumber}</h1>
        <StatusBadge status={order.status} />
        {STATE === 'ACCEPTED'       && <span className="badge badge-green">✓ Accepted</span>}
        {STATE === 'EDIT_SUBMITTED' && <span className="badge badge-yellow">✏️ Edit Submitted</span>}
        {STATE === 'RESPOND'        && <span className="badge badge-blue">📋 Awaiting Response</span>}
      </div>

      {/* ── STATE: WAITING ── */}
      {STATE === 'WAITING' && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⏳</div>
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Awaiting Quotation from Store</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', maxWidth: 400, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            The store is reviewing your request and will send you a final quotation shortly.
          </p>
          <div style={{ maxWidth: 320, margin: '0 auto', background: '#f8fafc', borderRadius: '0.6rem', padding: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.78rem', color: '#374151', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Items Requested</div>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.3rem 0', borderBottom: i < order.items.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                <span>{item.name} × {item.quantity} {item.unit}</span>
                <strong>{item.subtotal?.toFixed(2)}</strong>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '2px solid #2563eb', color: '#2563eb' }}>
              <span>Total</span><span>{order.subtotal?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── STATE: EDIT_SUBMITTED ── */}
      {STATE === 'EDIT_SUBMITTED' && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✏️</div>
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', color: '#92400e' }}>Edit Request Submitted</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', maxWidth: 400, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
            Your edit request has been sent to the store. The owner will review and send an updated quotation.
          </p>
          <div style={{ maxWidth: 380, margin: '0 auto 1.25rem', background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: '0.6rem', padding: '1rem', textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Your Edit Request</div>
            <p style={{ fontSize: '0.875rem', color: '#78350f', fontStyle: 'italic', margin: 0 }}>"{order.editRequestNote}"</p>
          </div>
          <div style={{ maxWidth: 320, margin: '0 auto', background: '#f8fafc', borderRadius: '0.6rem', padding: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.78rem', color: '#374151', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current Order</div>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.3rem 0', borderBottom: i < order.items.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                <span>{item.name} × {item.quantity} {item.unit}</span>
                <strong>{item.subtotal?.toFixed(2)}</strong>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '2px solid #d97706', color: '#d97706' }}>
              <span>Total (pending update)</span><span>{order.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── STATE: RESPOND ── */}
      {STATE === 'RESPOND' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1.5px solid #86efac', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, color: '#166534', fontSize: '1rem', marginBottom: '0.35rem' }}>📋 Quotation Ready — Review &amp; Respond</div>
            <div style={{ fontSize: '0.875rem', color: '#16a34a', marginBottom: '1rem' }}>
              Final Total: <strong style={{ fontSize: '1.1rem' }}>{order.total?.toFixed(2)}</strong>
              {order.tax > 0 && <span style={{ marginLeft: '0.75rem', color: '#6b7280', fontSize: '0.8rem' }}>Tax: {order.tax?.toFixed(2)}</span>}
              {order.discount > 0 && <span style={{ marginLeft: '0.75rem', color: '#16a34a', fontSize: '0.8rem' }}>Discount: -{order.discount?.toFixed(2)}</span>}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-success" onClick={handleAccept} disabled={accepting}>
                {accepting ? 'Accepting…' : '✅ Accept Quotation'}
              </button>
              <button className="btn btn-outline" style={{ color: '#d97706', borderColor: '#d97706' }} onClick={() => setShowEditForm(!showEditForm)}>
                ✏️ Request Edit
              </button>
            </div>
            {showEditForm && (
              <form onSubmit={handleRequestEdit} style={{ marginTop: '1rem' }}>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ color: '#92400e' }}>Describe what you'd like changed</label>
                  <textarea className="form-textarea" style={{ minHeight: 72 }} value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="e.g. Please reduce quantity of item X to 2, apply 5% discount…" autoFocus />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-warning" disabled={requesting}>
                    {requesting ? 'Sending…' : '📤 Send Edit Request'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => { setShowEditForm(false); setEditNote(''); }}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#fff', padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase' }}>Final Quotation</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{order.orderNumber}</div>
              </div>
              <table>
                <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.name}</td>
                      <td style={{ fontSize: '0.875rem' }}>{item.quantity} {item.unit}</td>
                      <td style={{ fontSize: '0.875rem' }}>{item.price?.toFixed(2)}</td>
                      <td style={{ fontWeight: 700, color: '#2563eb' }}>{item.subtotal?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', fontSize: '0.875rem' }}>
                  <span>Subtotal: <strong>{order.subtotal?.toFixed(2)}</strong></span>
                  {order.tax > 0 && <span style={{ color: '#6b7280' }}>Tax: <strong>{order.tax?.toFixed(2)}</strong></span>}
                  {order.discount > 0 && <span style={{ color: '#16a34a' }}>Discount: <strong>-{order.discount?.toFixed(2)}</strong></span>}
                  <span style={{ borderTop: '2px solid #2563eb', paddingTop: '0.3rem', marginTop: '0.1rem' }}>
                    Total: <strong style={{ color: '#2563eb', fontSize: '1.1rem' }}>{order.total?.toFixed(2)}</strong>
                  </span>
                </div>
              </div>
              {order.ownerNote && (
                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #f3f4f6', background: '#f0fdf4', fontSize: '0.8rem', color: '#166534' }}>
                  📝 Store note: {order.ownerNote}
                </div>
              )}
            </div>
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Order Info</h3>
              {[['Order #', order.orderNumber], ['Store', order.storeName], ['Date', new Date(order.createdAt).toLocaleDateString()], ['Items', order.items?.length]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' }}>
                  <span style={{ color: '#6b7280' }}>{l}</span><span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', fontSize: '0.875rem' }}>
                <span style={{ color: '#6b7280' }}>Status</span><StatusBadge status={order.status} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STATE: ACCEPTED ── */}
      {STATE === 'ACCEPTED' && (
        <div>
          <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 200, background: '#dcfce7', border: '1.5px solid #86efac', borderRadius: '0.6rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.2rem' }}>✅</span>
              <span style={{ fontWeight: 600, color: '#166534', fontSize: '0.875rem' }}>Quotation accepted — the store is processing your order.</span>
            </div>
            <button className="btn btn-primary" onClick={() => window.print()} style={{ whiteSpace: 'nowrap' }}>🖨️ Print</button>
            <button className="btn btn-outline" style={{ whiteSpace: 'nowrap' }} onClick={() => downloadFile(`/customer/orders/${id}/quotation/pdf`, `quotation-${order.orderNumber}.pdf`)}>📄 PDF</button>
            <button className="btn btn-outline" style={{ color: '#16a34a', borderColor: '#16a34a', whiteSpace: 'nowrap' }} onClick={() => downloadFile(`/customer/orders/${id}/quotation/excel`, `quotation-${order.orderNumber}.xlsx`)}>📊 Excel</button>
          </div>
          <QuotationDocument order={order} />
          <div className="no-print" style={{ maxWidth: 780, margin: '1.5rem auto 0' }}>
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Order Progress</h3>
              {[
                { label: 'Order Submitted', icon: '🛒', done: true },
                { label: 'Quotation Sent by Store', icon: '📋', done: true },
                { label: 'Quotation Accepted', icon: '✅', done: true },
                { label: 'Processing', icon: '⚙️', done: order.status === 'processing' || order.status === 'completed' },
                { label: 'Completed', icon: '🎉', done: order.status === 'completed' },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0', opacity: step.done ? 1 : 0.3 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: step.done ? '#dcfce7' : '#f3f4f6', border: `2px solid ${step.done ? '#16a34a' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>
                    {step.icon}
                  </div>
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>{step.label}</span>
                  {step.done && <span style={{ marginLeft: 'auto', color: '#16a34a', fontSize: '0.8rem' }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
