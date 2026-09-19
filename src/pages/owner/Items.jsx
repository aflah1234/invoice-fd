import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import API from '../../api/axios';

const EMPTY_FORM = { name: '', description: '', price: '', unit: 'pcs', category: 'General', stock: '', sku: '', isAvailable: true };

export default function OwnerItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchItems = () => {
    setLoading(true);
    API.get('/owner/items').then(({ data }) => setItems(data.items)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setImageFiles([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      unit: item.unit || 'pcs',
      category: item.category || 'General',
      stock: item.stock ?? '',
      sku: item.sku || '',
      isAvailable: item.isAvailable,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleDeleteImage = async (item, filename) => {
    if (!window.confirm('Remove this image?')) return;
    try {
      const { data } = await API.delete(`/owner/items/${item._id}/image/${filename}`);
      setItems((prev) => prev.map((i) => i._id === item._id ? data.item : i));
      if (editItem?._id === item._id) setEditItem(data.item);
      toast.success('Image removed');
    } catch {
      toast.error('Failed to remove image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      imageFiles.forEach((f) => fd.append('images', f));

      if (editItem) {
        await API.put(`/owner/items/${editItem._id}`, fd);
        toast.success('Item updated');
      } else {
        await API.post('/owner/items', fd);
        toast.success('Item created');
      }
      fetchItems();
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await API.delete(`/owner/items/${id}`);
      toast.success('Item deleted');
      fetchItems();
    } catch {
      toast.error('Failed to delete item');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = items.filter(
    (i) => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Items">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Items ({items.length})</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Item</button>
      </div>

      <div className="search-bar">
        <input className="search-input" placeholder="Search by name or category…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? <div className="spinner" /> : (
        filtered.length === 0 ? (
          <div className="empty-state card">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h3>No items yet</h3>
            <p>Add your first item to start receiving orders.</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openCreate}>+ Add Item</button>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map((item) => (
              <div key={item._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Image */}
                {item.images?.[0] ? (
                  <img src={`/uploads/${item.images[0]}`} alt={item.name} className="item-card-img" />
                ) : (
                  <div className="item-card-img-placeholder">📦</div>
                )}
                <div className="item-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="item-card-name">{item.name}</div>
                    <span className={`badge ${item.isAvailable ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.7rem' }}>
                      {item.isAvailable ? 'Available' : 'Hidden'}
                    </span>
                  </div>
                  <div className="item-card-price">
                    {item.price} <span className="item-card-unit">/ {item.unit}</span>
                  </div>
                  {item.category && (
                    <span className="badge badge-blue" style={{ marginTop: '0.4rem', fontSize: '0.72rem' }}>{item.category}</span>
                  )}
                  {item.description && (
                    <p style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.4rem', lineHeight: 1.4 }}>
                      {item.description.slice(0, 80)}{item.description.length > 80 ? '…' : ''}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(item)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)} disabled={deleting === item._id}>
                      {deleting === item._id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Item Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>{editItem ? 'Edit Item' : 'Add New Item'}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Item Name</label>
                    <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Samsung TV 55 inch" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price</label>
                    <input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="0.00" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select className="form-select" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                      {['pcs', 'kg', 'g', 'liter', 'ml', 'box', 'pack', 'set', 'pair', 'meter', 'roll'].map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Electronics, Food, etc." />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input className="form-input" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">SKU / Code (optional)</label>
                    <input className="form-input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="ITEM-001" />
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Item details, specifications…" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Availability</label>
                    <select className="form-select" value={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.value === 'true' })}>
                      <option value="true">Available (visible to customers)</option>
                      <option value="false">Hidden (not visible)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Add Images (up to 5)</label>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ fontSize: '0.875rem' }} />
                    {imagePreviews.length > 0 && (
                      <div className="img-thumb-wrap">
                        {imagePreviews.map((src, i) => (
                          <div key={i} className="img-thumb"><img src={src} alt="" /></div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Existing images (edit mode) */}
                  {editItem?.images?.length > 0 && (
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Current Images</label>
                      <div className="img-thumb-wrap">
                        {editItem.images.map((img) => (
                          <div key={img} className="img-thumb">
                            <img src={`/uploads/${img}`} alt="" />
                            <button
                              type="button"
                              className="img-thumb-del"
                              onClick={() => handleDeleteImage(editItem, img)}
                              title="Remove image"
                            >✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
