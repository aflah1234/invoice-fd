import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import API from '../../api/axios';

export default function OwnerStore() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showApiHelp, setShowApiHelp] = useState(false);

  useEffect(() => {
    API.get('/owner/store').then(({ data }) => {
      setStore(data.store);
      setForm({
        name: data.store.name || '',
        description: data.store.description || '',
        address: data.store.address || '',
        phone: data.store.phone || '',
        whatsapp: data.store.whatsapp || '',
        whatsappApiKey: data.store.whatsappApiKey || '',
        category: data.store.category || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logoFile) fd.append('logo', logoFile);
      const { data } = await API.put('/owner/store', fd);
      setStore(data.store);
      toast.success('Store updated successfully!');
      setLogoFile(null);
      setLogoPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update store');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout title="My Store"><div className="spinner" /></Layout>;

  return (
    <Layout title="My Store">
      <h1 className="page-title">Store Settings</h1>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Store Logo */}
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Store Logo</h3>
          <div style={{ marginBottom: '1rem' }}>
            {logoPreview || store?.logo ? (
              <img
                src={logoPreview || `/uploads/${store.logo}`}
                alt="Store logo"
                style={{ width: 120, height: 120, borderRadius: '0.75rem', objectFit: 'cover', border: '2px solid #e5e7eb', margin: '0 auto' }}
              />
            ) : (
              <div style={{ width: 120, height: 120, borderRadius: '0.75rem', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', margin: '0 auto' }}>
                🏪
              </div>
            )}
          </div>
          <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
            Change Logo
            <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
          </label>
          {logoFile && (
            <p style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '0.5rem' }}>
              New logo selected: {logoFile.name}
            </p>
          )}

          <hr className="divider" />

          {/* Store status card */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Status</span>
              <span className={`badge ${store?.isActive ? 'badge-green' : 'badge-red'}`}>
                {store?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Category</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{store?.category}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Created</span>
              <span style={{ fontSize: '0.8rem' }}>{new Date(store?.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Store Information</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Store Name</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <input className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Electronics, Food, Clothing" />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of your store" />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City, Country" />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp Number</label>
                <input className="form-input" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="International format: 923001234567" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                WhatsApp API Key (for order notifications)
                <button type="button" onClick={() => setShowApiHelp(!showApiHelp)}
                  style={{ background: '#dbeafe', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 700 }}>?</button>
              </label>
              <input className="form-input" value={form.whatsappApiKey} onChange={(e) => setForm({ ...form, whatsappApiKey: e.target.value })} placeholder="CallMeBot API key" />
              {showApiHelp && (
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: '0.5rem', fontSize: '0.78rem', color: '#166534', lineHeight: 1.6 }}>
                  Send <strong>"I allow callmebot to send me messages"</strong> to <strong>+34 644 60 49 16</strong> on WhatsApp to get your free API key. This lets the system notify your store when new orders arrive.
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={saving}>
              {saving ? 'Saving…' : 'Save Store Settings'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
