import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import API from '../../api/axios';
import { useCart } from '../../context/CartContext';

const downloadFile = async (url, filename) => {
  try {
    const response = await API.get(url, { responseType: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([response.data]));
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch {
    toast.error('Download failed. Please try again.');
  }
};

export default function StoreItems() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, currentStoreId, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();

  const [store, setStore] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // for image lightbox

  useEffect(() => {
    Promise.all([
      API.get(`/customer/stores/${id}`),
      API.get(`/customer/stores/${id}/items`),
    ])
      .then(([storeRes, itemsRes]) => {
        setStore(storeRes.data.store);
        setItems(itemsRes.data.items);
      })
      .catch(() => navigate('/customer/stores'))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  const getCartQty = (itemId) => {
    const ci = cartItems.find((c) => c._id === itemId);
    return ci ? ci.quantity : 0;
  };

  const handleAddToCart = (item) => {
    addToCart(item, id, store.name);
    toast.success(`${item.name} added to cart`);
  };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) { toast.error('Cart is empty'); return; }
    setSubmitting(true);
    try {
      const { data } = await API.post('/customer/orders', {
        storeId: id,
        items: cartItems.map((i) => ({ itemId: i._id, quantity: i.quantity })),
        customerNote: orderNote,
        deliveryAddress,
      });
      setOrderResult(data);
      clearCart();
      setShowCheckout(false);
      setCartOpen(false);
      toast.success('Order placed! Quotation generated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];

  const filtered = items.filter((i) => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || i.category === category;
    return matchSearch && matchCat;
  });

  if (loading) return <Layout title="Store Items"><div className="spinner" /></Layout>;

  return (
    <Layout title={store?.name || 'Store Items'}>
      {/* Store header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/customer/stores')}>← Stores</button>
        {store?.logo ? (
          <img src={`/uploads/${store.logo}`} alt={store.name} style={{ width: 48, height: 48, borderRadius: '0.5rem', objectFit: 'cover', border: '1.5px solid #e5e7eb' }} />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: '0.5rem', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏪</div>
        )}
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{store?.name}</h1>
          {store?.category && <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>{store.category}</span>}
        </div>

        {/* Cart button */}
        <button
          className="btn btn-primary"
          style={{ marginLeft: 'auto', position: 'relative' }}
          onClick={() => setCartOpen(true)}
        >
          🛒 Cart
          {cartCount > 0 && currentStoreId === id && (
            <span style={{ position: 'absolute', top: -8, right: -8, background: '#dc2626', color: '#fff', borderRadius: '50%', width: 20, height: 20, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Search & filter */}
      <div className="search-bar">
        <input className="search-input" placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} />
        {categories.length > 0 && (
          <select className="form-select" style={{ width: 'auto' }} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* Items grid */}
      {filtered.length === 0 ? (
        <div className="empty-state card">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h3>No items found</h3>
          <p>Try a different search.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((item) => {
            const qty = getCartQty(item._id);
            const inCart = qty > 0 && currentStoreId === id;
            return (
              <div key={item._id} className="item-card">
                {/* Image */}
                {item.imageUrls?.[0] ? (
                  <img
                    src={item.imageUrls[0]}
                    alt={item.name}
                    className="item-card-img"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedItem(item)}
                  />
                ) : (
                  <div className="item-card-img-placeholder">📦</div>
                )}

                {/* Multiple image indicator */}
                {item.imageUrls?.length > 1 && (
                  <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#6b7280', marginTop: '-8px', paddingBottom: '4px' }}>
                    +{item.imageUrls.length - 1} more photos
                  </div>
                )}

                <div className="item-card-body">
                  <div className="item-card-name">{item.name}</div>
                  {item.sku && <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>SKU: {item.sku}</div>}
                  <div className="item-card-price">
                    {item.price} <span className="item-card-unit">/ {item.unit}</span>
                  </div>
                  {item.category && (
                    <span className="badge badge-blue" style={{ fontSize: '0.72rem', marginTop: '0.3rem' }}>{item.category}</span>
                  )}
                  {item.description && (
                    <p style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.4rem', lineHeight: 1.4 }}>
                      {item.description.slice(0, 80)}{item.description.length > 80 ? '…' : ''}
                    </p>
                  )}

                  {/* Add to cart controls */}
                  {inCart ? (
                    <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQuantity(item._id, qty - 1)}>−</button>
                        <span className="qty-num">{qty}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item._id, qty + 1)}>+</button>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, flex: 1, textAlign: 'right' }}>
                        = {(item.price * qty).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '0.85rem' }}
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Cart Sidebar ────────────────────────────────── */}
      {cartOpen && <div className="cart-overlay" onClick={() => setCartOpen(false)} />}
      <div className={`cart-panel ${cartOpen && currentStoreId === id ? 'open' : ''}`}>
        <div className="cart-header">
          <span>🛒 Cart ({cartCount})</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setCartOpen(false)}>✕</button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 || currentStoreId !== id ? (
            <div className="empty-state"><p>Cart is empty.</p></div>
          ) : cartItems.map((ci) => (
            <div key={ci._id} className="cart-item">
              {ci.imageUrls?.[0] ? (
                <img src={ci.imageUrls[0]} alt={ci.name} style={{ width: 44, height: 44, borderRadius: '0.35rem', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: '0.35rem', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexShrink: 0 }}>📦</div>
              )}
              <div className="cart-item-info">
                <div className="cart-item-name">{ci.name}</div>
                <div className="cart-item-price">{ci.price} / {ci.unit}</div>
                <div className="qty-control" style={{ marginTop: '0.35rem' }}>
                  <button className="qty-btn" onClick={() => updateQuantity(ci._id, ci.quantity - 1)}>−</button>
                  <span className="qty-num">{ci.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(ci._id, ci.quantity + 1)}>+</button>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#2563eb' }}>
                  {(ci.price * ci.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => removeFromCart(ci._id)}
                  style={{ border: 'none', background: 'none', color: '#dc2626', fontSize: '0.75rem', cursor: 'pointer', marginTop: '0.35rem' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {cartItems.length > 0 && currentStoreId === id && (
          <div className="cart-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
              <span>Total</span>
              <span style={{ color: '#2563eb' }}>{cartTotal.toFixed(2)}</span>
            </div>
            <button className="btn btn-success" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={() => { setCartOpen(false); setShowCheckout(true); }}>
              📋 Request Quotation
            </button>
            <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        )}
      </div>

      {/* ── Checkout / Order confirmation modal ───────── */}
      {showCheckout && (
        <div className="modal-overlay" onClick={() => setShowCheckout(false)}>
          <div className="modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>📋 Confirm Quotation Request</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCheckout(false)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Order summary */}
              <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Order Summary</h4>
              {cartItems.map((ci) => (
                <div key={ci._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  <span>{ci.name} × {ci.quantity} {ci.unit}</span>
                  <strong>{(ci.price * ci.quantity).toFixed(2)}</strong>
                </div>
              ))}
              <hr className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>
                <span>Total</span>
                <span style={{ color: '#2563eb' }}>{cartTotal.toFixed(2)}</span>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Address (optional)</label>
                <input className="form-input" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Enter delivery address" />
              </div>

              <div className="form-group">
                <label className="form-label">Note to Store (optional)</label>
                <textarea className="form-textarea" value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="Any special requirements or notes…" />
              </div>

              <div style={{ padding: '0.75rem', background: '#f0fdf4', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#166534' }}>
                ✅ After submitting: Your quotation PDF and Excel will be generated instantly and available to download on your orders page.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowCheckout(false)}>Cancel</button>
              <button className="btn btn-success btn-lg" onClick={handleSubmitOrder} disabled={submitting}>
                {submitting ? 'Submitting…' : '📤 Submit & Get Quotation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Order Success modal ────────────────────────── */}
      {orderResult && (
        <div className="modal-overlay" onClick={() => setOrderResult(null)}>
          <div className="modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>🎉</div>
              <h2 style={{ fontWeight: 700, marginBottom: '0.25rem', textAlign: 'center' }}>Quotation Ready!</h2>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                Order <strong>{orderResult.order?.orderNumber}</strong> placed at <strong>{orderResult.order?.storeName}</strong>
              </p>

              {/* Quotation summary */}
              <div style={{ background: '#f8fafc', borderRadius: '0.6rem', padding: '1rem', marginBottom: '1.25rem', border: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem', color: '#374151' }}>📋 Quotation Summary</div>
                {orderResult.order?.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem', color: '#374151' }}>
                    <span>{item.name} × {item.quantity} {item.unit}</span>
                    <strong>{item.subtotal?.toFixed(2)}</strong>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
                  <span>Total</span>
                  <span style={{ color: '#2563eb' }}>{orderResult.order?.total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Download buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {orderResult.quotationPdfUrl && (
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => downloadFile(`/customer/orders/${orderResult.order?._id}/quotation/pdf`, `quotation-${orderResult.order?.orderNumber}.pdf`)}
                  >
                    📄 Download PDF
                  </button>
                )}
                {orderResult.quotationExcelUrl && (
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1, justifyContent: 'center', color: '#16a34a', borderColor: '#16a34a' }}
                    onClick={() => downloadFile(`/customer/orders/${orderResult.order?._id}/quotation/excel`, `quotation-${orderResult.order?.orderNumber}.xlsx`)}
                  >
                    📊 Download Excel
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => { setOrderResult(null); navigate(`/customer/orders/${orderResult.order?._id}`); }}
                >
                  View Full Quotation
                </button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setOrderResult(null)}>
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Lightbox ─────────────────────────────── */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div style={{ background: '#000', borderRadius: '0.75rem', padding: '1rem', maxWidth: '700px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', color: '#fff' }}>
              <span style={{ fontWeight: 600 }}>{selectedItem.name}</span>
              <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }} onClick={() => setSelectedItem(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', overflow: 'auto', paddingBottom: '0.5rem' }}>
              {selectedItem.imageUrls?.map((url, i) => (
                <img key={i} src={url} alt="" style={{ height: 300, borderRadius: '0.5rem', objectFit: 'contain', background: '#111', flexShrink: 0 }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
