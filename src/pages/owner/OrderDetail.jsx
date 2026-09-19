import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import API from '../../api/axios';

const STATUSES = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];

export default function OwnerOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', ownerNote: '' });
  const [invoiceForm, setInvoiceForm] = useState({ tax: '', discount: '', ownerNote: '' });
  const [sendResult, setSendResult] = useState(null);

  const fetchOrder = () => {
    API.get(`/owner/orders/${id}`)
      .then(({ data }) => {
        setOrder(data.order);
        setStatusForm({ status: data.order.status, ownerNote: data.order.ownerNote || '' });
        setInvoiceForm({
          tax: data.order.tax > 0 ? data.order.tax : '',
          discount: data.order.discount > 0 ? data.order.discount : '',
          ownerNote: data.order.ownerNote || '',
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]); // eslint-disable-line

  const previewTotal = order
    ? order.subtotal + parseFloat(invoiceForm.tax || 0) - parseFloat(invoiceForm.discount || 0)
    : 0;

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/owner/orders/${id}/status`, statusForm);
      toast.success('Status updated');
      fetchOrder();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleSendToCustomer = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await API.post(`/owner/orders/${id}/invoice`, {
        tax: parseFloat(invoiceForm.tax) || 0,
        discount: parseFloat(invoiceForm.discount) || 0,
        ownerNote: invoiceForm.ownerNote,
      });
      toast.success('Quotation sent to customer profile!');
      setSendResult(data);
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Layout title="Order Detail"><div className="spinner" /></Layout>;
  if (!order) return <Layout title="Order Detail"><div className="alert alert-error">Order not found</div></Layout>;

  const alreadySent = order.invoiceSentToCustomer || order.quotationSentByOwner;

  return (
    <Layout title={`Order ${order.orderNumber}`}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/owner/orders')}>← Back</button>
        <h1 className="page-title" style={{ margin: 0 }}>{order.orderNumber}</h1>
        <StatusBadge status={order.status} />
        {alreadySent && !order.editRequested && !order.quotationAccepted && (
          <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>📋 Awaiting Customer</span>
        )}
        {order.quotationAccepted && (
          <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>✅ Accepted</span>
        )}
        {order.editRequested && !order.quotationAccepted && (
          <span className="badge badge-yellow" style={{ fontSize: '0.75rem' }}>✏️ Edit Requested</span>
        )}
      </div>

      {/* ── Edit request alert ── */}
      {order.editRequested && !order.quotationAccepted && (
        <div style={{
          background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: '0.75rem',
          padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>✏️</span>
          <div>
            <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.95rem' }}>Customer requested an edit</div>
            <div style={{ fontSize: '0.875rem', color: '#78350f', marginTop: '0.3rem', fontStyle: 'italic' }}>
              "{order.editRequestNote}"
            </div>
            <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '0.4rem' }}>
              Update the tax / discount / note below and re-send.
            </div>
          </div>
        </div>
      )}

      {/* ── Accepted alert ── */}
      {order.quotationAccepted && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          ✅ <strong>Customer accepted the quotation.</strong> Update status to Processing or Completed.
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid-2" style={{ alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Customer Info */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Customer</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.875rem' }}>
              {[['Name', order.customerName], ['Phone', order.customerPhone], ['Email', order.customerEmail || '—']].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: '#6b7280', minWidth: 55 }}>{label}:</span>
                  <span style={{ fontWeight: label === 'Name' ? 600 : 400 }}>{value}</span>
                </div>
              ))}
              {order.deliveryAddress && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: '#6b7280', minWidth: 55 }}>Address:</span>
                  <span>{order.deliveryAddress}</span>
                </div>
              )}
              {order.customerNote && (
                <div style={{ marginTop: '0.5rem', padding: '0.6rem 0.85rem', background: '#fef9c3', borderRadius: '0.4rem', fontSize: '0.8rem', color: '#854d0e', borderLeft: '3px solid #ca8a04' }}>
                  📝 {order.customerNote}
                </div>
              )}
            </div>
          </div>

          {/* Items table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Order Items</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {item.image
                          ? <img src={`/uploads/${item.image}`} alt="" style={{ width: 32, height: 32, borderRadius: '0.35rem', objectFit: 'cover' }} />
                          : <div style={{ width: 32, height: 32, borderRadius: '0.35rem', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>📦</div>
                        }
                        <strong style={{ fontSize: '0.875rem' }}>{item.name}</strong>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{item.quantity} {item.unit}</td>
                    <td style={{ fontSize: '0.875rem' }}>{item.price?.toFixed(2)}</td>
                    <td><strong>{item.subtotal?.toFixed(2)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem', fontSize: '0.875rem' }}>
                <div>Subtotal: <strong>{order.subtotal?.toFixed(2)}</strong></div>
                {order.tax > 0 && <div style={{ color: '#6b7280' }}>Tax: <strong>{order.tax?.toFixed(2)}</strong></div>}
                {order.discount > 0 && <div style={{ color: '#16a34a' }}>Discount: <strong>-{order.discount?.toFixed(2)}</strong></div>}
                <div style={{ borderTop: '1.5px solid #e5e7eb', paddingTop: '0.4rem', marginTop: '0.1rem', fontSize: '1rem' }}>
                  Total: <strong style={{ color: '#2563eb', fontSize: '1.1rem' }}>{order.total?.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* ── BEFORE SEND or AFTER EDIT REQUEST: show send form ── */}
          {(!alreadySent || order.editRequested) && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.95rem' }}>📤 Send Quotation to Customer</h3>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                {order.editRequested
                  ? 'Customer requested changes. Update below and re-send.'
                  : 'Set tax and discount, add a note, then send to customer.'}
              </p>

              <form onSubmit={handleSendToCustomer}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tax Amount</label>
                    <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00"
                      value={invoiceForm.tax}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, tax: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discount Amount</label>
                    <input className="form-input" type="number" min="0" step="0.01" placeholder="0.00"
                      value={invoiceForm.discount}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Note to Customer (optional)</label>
                  <textarea className="form-textarea" style={{ minHeight: 64 }}
                    placeholder="e.g. Thank you! Delivery in 2-3 days."
                    value={invoiceForm.ownerNote}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, ownerNote: e.target.value })} />
                </div>

                {/* Live total preview */}
                <div style={{ background: '#eff6ff', borderRadius: '0.5rem', padding: '0.85rem 1rem', marginBottom: '1rem', border: '1.5px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginBottom: '0.4rem', fontWeight: 600 }}>TOTAL PREVIEW</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem', color: '#374151' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Subtotal</span><span>{order.subtotal?.toFixed(2)}</span>
                    </div>
                    {parseFloat(invoiceForm.tax) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>+ Tax</span><span>{parseFloat(invoiceForm.tax).toFixed(2)}</span>
                      </div>
                    )}
                    {parseFloat(invoiceForm.discount) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                        <span>− Discount</span><span>{parseFloat(invoiceForm.discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', borderTop: '1px solid #bfdbfe', paddingTop: '0.4rem', marginTop: '0.2rem', color: '#1d4ed8' }}>
                      <span>Total</span><span>{previewTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-success" style={{ width: '100%', fontSize: '0.9rem' }} disabled={sending}>
                  {sending ? 'Sending…' : order.editRequested ? '🔄 Update & Re-send to Customer' : '📤 Send to Customer Profile'}
                </button>
              </form>
            </div>
          )}

          {/* ── AFTER SEND (no edit request): show submitted confirmation ── */}
          {alreadySent && !order.editRequested && (
            <div className="card" style={{ border: '1.5px solid #86efac' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>✅</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#166534' }}>Quotation Submitted</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.15rem' }}>
                    {order.quotationAccepted
                      ? 'Customer accepted the quotation.'
                      : 'Waiting for customer to accept or request changes.'}
                  </div>
                </div>
              </div>

              {/* Summary of what was sent */}
              <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.85rem 1rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#6b7280' }}>Subtotal</span>
                  <strong>{order.subtotal?.toFixed(2)}</strong>
                </div>
                {order.tax > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ color: '#6b7280' }}>Tax</span>
                    <strong>{order.tax?.toFixed(2)}</strong>
                  </div>
                )}
                {order.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ color: '#6b7280' }}>Discount</span>
                    <strong style={{ color: '#16a34a' }}>-{order.discount?.toFixed(2)}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px solid #e5e7eb', paddingTop: '0.5rem', marginTop: '0.3rem' }}>
                  <span style={{ fontWeight: 700 }}>Total Sent</span>
                  <strong style={{ color: '#2563eb', fontSize: '1rem' }}>{order.total?.toFixed(2)}</strong>
                </div>
                {order.ownerNote && (
                  <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.75rem', background: '#f0fdf4', borderRadius: '0.35rem', fontSize: '0.8rem', color: '#166534', borderLeft: '3px solid #16a34a' }}>
                    📝 {order.ownerNote}
                  </div>
                )}
              </div>

              {/* Downloads */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                {order.quotationPdfPath && (
                  <a href={`/uploads/docs/${order.quotationPdfPath.split(/[\\/]/).pop()}`}
                    target="_blank" rel="noreferrer"
                    className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    📄 PDF
                  </a>
                )}
                {order.quotationExcelPath && (
                  <a href={`/uploads/docs/${order.quotationExcelPath.split(/[\\/]/).pop()}`}
                    target="_blank" rel="noreferrer"
                    className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center', color: '#16a34a', borderColor: '#16a34a' }}>
                    📊 Excel
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ── Update Status (always visible) ── */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Update Order Status</h3>
            <form onSubmit={handleStatusUpdate}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Internal Note</label>
                <textarea className="form-textarea" style={{ minHeight: 56 }}
                  value={statusForm.ownerNote}
                  onChange={(e) => setStatusForm({ ...statusForm, ownerNote: e.target.value })}
                  placeholder="For your records only…" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                {saving ? 'Saving…' : 'Update Status'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </Layout>
  );
}
