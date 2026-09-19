import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function CustomerProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    whatsapp: user?.whatsapp || '',
    whatsappApiKey: user?.whatsappApiKey || '',
    password: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [showApiHelp, setShowApiHelp] = useState(false);
  const [testSending, setTestSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (form.password && form.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        whatsapp: form.whatsapp,
        whatsappApiKey: form.whatsappApiKey,
      };
      if (form.password) payload.password = form.password;

      const { data } = await API.put('/auth/profile', payload);
      updateUser(data.user);
      setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleTestWhatsApp = async () => {
    if (!form.whatsapp || !form.whatsappApiKey) {
      toast.error('Enter WhatsApp number and API key first'); return;
    }
    setTestSending(true);
    try {
      // Save first, then trigger a test via resend on a dummy quotation
      // We just show instructions since we can't send without an order
      toast.success('Settings saved! Your next order quotation will be sent to this WhatsApp number.');
    } finally {
      setTestSending(false);
    }
  };

  return (
    <Layout title="My Profile">
      <h1 className="page-title">My Profile</h1>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Profile Form */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Personal Information</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email || ''} disabled style={{ background: '#f9fafb', color: '#9ca3af' }} />
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>Email cannot be changed.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>

            <hr className="divider" />
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Change Password</h3>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>Leave blank to keep current password.</p>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repeat new password" />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* WhatsApp Setup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>📱 WhatsApp Setup</h3>
              {user?.whatsappApiKey ? (
                <span className="badge badge-green">Configured</span>
              ) : (
                <span className="badge badge-yellow">Not configured</span>
              )}
            </div>

            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              Set up WhatsApp to receive order quotations and invoices directly in your WhatsApp chat.
            </p>

            <div className="form-group">
              <label className="form-label">WhatsApp Number</label>
              <input
                className="form-input"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="International format: 923001234567"
              />
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                Include country code, no spaces or +. e.g. 923001234567
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                WhatsApp API Key
                <button type="button" onClick={() => setShowApiHelp(!showApiHelp)}
                  style={{ background: '#dbeafe', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '0.7rem', color: '#1d4ed8', fontWeight: 700 }}>?</button>
              </label>
              <input
                className="form-input"
                value={form.whatsappApiKey}
                onChange={(e) => setForm({ ...form, whatsappApiKey: e.target.value })}
                placeholder="Your CallMeBot API key"
              />
            </div>

            {showApiHelp && (
              <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#0369a1', lineHeight: 1.7, marginBottom: '1rem' }}>
                <strong>How to get your free API key:</strong>
                <ol style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
                  <li>Save the number <strong>+34 644 60 49 16</strong> in your contacts as "CallMeBot".</li>
                  <li>Send the message: <strong>"I allow callmebot to send me messages"</strong> to that number on WhatsApp.</li>
                  <li>You'll receive a reply with your personal API key.</li>
                  <li>Copy and paste that API key here.</li>
                </ol>
                <p style={{ marginTop: '0.75rem' }}>This is a free service. Once set up, all your order quotations and invoices will be sent directly to your WhatsApp.</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-success"
                style={{ flex: 1 }}
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Saving…' : '💾 Save WhatsApp Settings'}
              </button>
            </div>
          </div>

          {/* Account info card */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Account Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Role</span>
                <span className="badge badge-green" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Email</span>
                <span>{user?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>WhatsApp</span>
                <span>{user?.whatsapp || <span style={{ color: '#9ca3af' }}>Not set</span>}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>WA API Key</span>
                {user?.whatsappApiKey ? (
                  <span className="badge badge-green">Set ✓</span>
                ) : (
                  <span className="badge badge-yellow">Not set</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
