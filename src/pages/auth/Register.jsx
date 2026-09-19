import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const EyeIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
);

const steps = ['Personal Info', 'Contact & Security'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      toast.success('Account created! Welcome aboard 🎉');
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { level: 1, label: 'Too short', color: 'var(--danger)' };
    if (p.length < 8) return { level: 2, label: 'Weak', color: 'var(--warning)' };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { level: 4, label: 'Strong', color: 'var(--success)' };
    return { level: 3, label: 'Medium', color: 'var(--teal)' };
  })();

  return (
    <div className="auth-page">
      {/* ── Left panel ── */}
      <div className="auth-panel">
        <div className="auth-panel-content">
          <div className="auth-panel-logo">🏪</div>
          <h2 className="auth-panel-title">
            Join thousands<br />of customers
          </h2>
          <p className="auth-panel-sub">
            Create a free account and start browsing stores, placing orders, and receiving instant quotations.
          </p>
          <div className="auth-feature-list">
            {[
              { icon: '⚡', text: 'Get started in under 2 minutes' },
              { icon: '🔒', text: 'Your data is safe and secure' },
              { icon: '📋', text: 'Instant PDF & Excel quotations' },
              { icon: '📱', text: 'WhatsApp order notifications' },
            ].map((f, i) => (
              <div key={i} className="auth-feature">
                <div className="auth-feature-icon">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-form-header">
            <p className="auth-form-greeting">Get started for free</p>
            <h1 className="auth-form-title">Create your<br />account</h1>
            <p className="auth-form-sub">Fill in the details below to register as a customer.</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-group">
                <span className="input-icon"><UserIcon /></span>
                <input className="form-input" name="name" placeholder="John Doe"
                  value={form.name} onChange={handleChange} required autoFocus autoComplete="name" />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-group">
                <span className="input-icon"><MailIcon /></span>
                <input className="form-input" type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required autoComplete="email" />
              </div>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-group">
                <span className="input-icon"><PhoneIcon /></span>
                <input className="form-input" name="phone" placeholder="e.g. 923001234567"
                  value={form.phone} onChange={handleChange} required autoComplete="tel" />
              </div>
              <p className="form-hint">Include country code (e.g. 92 for Pakistan)</p>
            </div>

            {/* Passwords */}
            <div className="grid-2" style={{ gap: '0.85rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password</label>
                <div className="input-group" style={{ position: 'relative' }}>
                  <span className="input-icon"><LockIcon /></span>
                  <input className="form-input" type={showPwd ? 'text' : 'password'} name="password"
                    placeholder="Min 6 chars" value={form.password} onChange={handleChange}
                    required style={{ paddingRight: '2.75rem' }} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    style={{ position:'absolute', right:'0.85rem', top:'50%', transform:'translateY(-50%)',
                      background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)',
                      display:'flex', alignItems:'center', padding:0 }}
                    aria-label="Toggle password visibility">
                    <EyeIcon open={showPwd} />
                  </button>
                </div>
                {/* Strength bar */}
                {pwdStrength && (
                  <div style={{ marginTop: '0.4rem' }}>
                    <div style={{ display:'flex', gap:'3px', marginBottom:'0.2rem' }}>
                      {[1,2,3,4].map(n => (
                        <div key={n} style={{
                          flex:1, height:'3px', borderRadius:'2px',
                          background: n <= pwdStrength.level ? pwdStrength.color : 'var(--gray-200)',
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize:'0.72rem', color: pwdStrength.color, fontWeight:600 }}>
                      {pwdStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm Password</label>
                <div className="input-group" style={{ position: 'relative' }}>
                  <span className="input-icon"><LockIcon /></span>
                  <input className="form-input" type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                    placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange}
                    required style={{ paddingRight: '2.75rem' }} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    style={{ position:'absolute', right:'0.85rem', top:'50%', transform:'translateY(-50%)',
                      background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)',
                      display:'flex', alignItems:'center', padding:0 }}
                    aria-label="Toggle confirm password visibility">
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="form-error" style={{ marginTop:'0.35rem' }}>⚠ Passwords don't match</p>
                )}
              </div>
            </div>

            <button className="btn btn-primary btn-lg btn-block"
              style={{ marginTop: '1.5rem' }} disabled={loading}>
              {loading
                ? <><span className="spinner spinner-sm" /> Creating Account…</>
                : 'Create Account →'
              }
            </button>
          </form>

          <div className="auth-divider"><span>Already have an account?</span></div>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
