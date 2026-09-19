import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import API from '../../api/axios';

const EMPTY_FORM = {
  name: '', email: '', password: '', phone: '', whatsapp: '', whatsappApiKey: '',
  storeName: '', storeDescription: '', storeAddress: '', storePhone: '',
  storeWhatsapp: '', storeWhatsappApiKey: '', storeCategory: 'General',
};

export default function AdminOwners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editOwner, setEditOwner] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ id: '', password: '' });
  const [search, setSearch] = useState('');

  const fetchOwners = () => {
    setLoading(true);
    API.get('/admin/owners')
      .then(({ data }) => setOwners(data.owners))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOwners(); }, []);

  const openCreate = () => {
    setEditOwner(null);
    setForm(EMPTY_FORM);
    setLogoFile(null);
    setShowModal(true);
  };

  const openEdit = (owner) => {
    setEditOwner(owner);
    setForm({
      name: owner.name, email: owner.email, password: '',
      phone: owner.phone, whatsapp: owner.whatsapp || '',
      whatsappApiKey: owner.whatsappApiKey || '',
      storeName: owner.storeId?.name || '',
      storeDescription: '', storeAddress: '', storePhone: '',
      storeWhatsapp: '', storeWhatsappApiKey: '', storeCategory: 'General',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editOwner) {
        await API.put(`/admin/owners/${editOwner._id}`, {
          name: form.name, phone: form.phone,
          whatsapp: form.whatsapp, whatsappApiKey: form.whatsappApiKey,
        });
        toast.success('Owner updated');
      } else {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (logoFile) fd.append('logo', logoFile);
        await API.post('/admin/owners', fd);
        toast.success('Owner & store created');
      }
      fetchOwners();
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving owner');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (owner) => {
    try {
      await API.put(`/admin/owners/${owner._id}`, { isActive: !owner.isActive });
      toast.success(owner.isActive ? 'Owner deactivated' : 'Owner activated');
      fetchOwners();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!pwdForm.password || pwdForm.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    try {
      await API.put(`/admin/owners/${pwdForm.id}/reset-password`, { password: pwdForm.password });
      toast.success('Password reset');
      setShowPwdModal(false);
    } catch {
      toast.error('Failed to reset password');
    }
  };

  const filtered = owners.filter(
    (o) => o.name.toLowerCase().includes(search.toLowerCase()) ||
           o.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Manage Owners">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Owners</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Owner</button>
      </div>

      <div className="search-bar">
        <input className="search-input" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="table-wrap card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Owner</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Store</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>No owners found</td></tr>
              ) : filtered.map((owner) => (
                <tr key={owner._id}>
                  <td><strong>{owner.name}</strong></td>
                  <td>{owner.email}</td>
                  <td>{owner.phone}</td>
                  <td>
                    {owner.storeId ? (
                      <span style={{ fontSize: '0.8rem' }}>
                        {owner.storeId.name}
                        {!owner.storeId.isActive && <span className="badge badge-red" style={{ marginLeft: '0.35rem' }}>Inactive</span>}
                      </span>
                    ) : <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>No store</span>}
                  </td>
                  <td>
                    <span className={`badge ${owner.isActive ? 'badge-green' : 'badge-red'}`}>
                      {owner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                    {new Date(owner.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(owner)}>Edit</button>
                      <button
                        className={`btn btn-sm ${owner.isActive ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => toggleActive(owner)}
                      >
                        {owner.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setPwdForm({ id: owner._id, password: '' }); setShowPwdModal(true); }}>
                        Reset Pwd
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>{editOwner ? 'Edit Owner' : 'Add New Owner & Store'}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#374151' }}>Owner Info</p>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={!!editOwner} />
                  </div>
                  {!editOwner && (
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Number</label>
                    <input className="form-input" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp API Key</label>
                    <input className="form-input" value={form.whatsappApiKey} onChange={(e) => setForm({ ...form, whatsappApiKey: e.target.value })} placeholder="CallMeBot key" />
                  </div>
                </div>

                {!editOwner && (
                  <>
                    <hr className="divider" />
                    <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#374151' }}>Store Info</p>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Store Name</label>
                        <input className="form-input" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <input className="form-input" value={form.storeCategory} onChange={(e) => setForm({ ...form, storeCategory: e.target.value })} placeholder="e.g. Electronics" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Store Phone</label>
                        <input className="form-input" value={form.storePhone} onChange={(e) => setForm({ ...form, storePhone: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Store WhatsApp</label>
                        <input className="form-input" value={form.storeWhatsapp} onChange={(e) => setForm({ ...form, storeWhatsapp: e.target.value })} />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Store WhatsApp API Key</label>
                        <input className="form-input" value={form.storeWhatsappApiKey} onChange={(e) => setForm({ ...form, storeWhatsappApiKey: e.target.value })} placeholder="For order notifications" />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Address</label>
                        <input className="form-input" value={form.storeAddress} onChange={(e) => setForm({ ...form, storeAddress: e.target.value })} />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Description</label>
                        <textarea className="form-textarea" value={form.storeDescription} onChange={(e) => setForm({ ...form, storeDescription: e.target.value })} />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Store Logo</label>
                        <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} style={{ fontSize: '0.875rem' }} />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editOwner ? 'Update Owner' : 'Create Owner & Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPwdModal && (
        <div className="modal-overlay" onClick={() => setShowPwdModal(false)}>
          <div className="modal" style={{ maxWidth: '360px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>Reset Password</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPwdModal(false)}>✕</button>
            </div>
            <form onSubmit={handleResetPassword}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" value={pwdForm.password} onChange={(e) => setPwdForm({ ...pwdForm, password: e.target.value })} required minLength={6} autoFocus />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowPwdModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
