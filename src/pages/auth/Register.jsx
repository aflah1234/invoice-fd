import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const EyeIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>}
  </svg>
);

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
      toast.success('Account created! Welcome 🎉');
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* ── Hero ── */}
        <div style={styles.hero}>
          <div style={styles.heroOverlay} />
          <div style={styles.blob1} />
          <div style={styles.blob2} />
          <div style={styles.blob3} />
          <div style={styles.brand}>
            <div style={styles.brandDot} />
            <span style={styles.brandName}>BizPlatform</span>
          </div>
          {/* Back arrow hint */}
          <Link to="/login" style={styles.backBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          {/* Plant illustration */}
          <div style={styles.plantWrap}>
            <div style={styles.pot} />
            <div style={styles.potRim} />
            <div style={styles.stem} />
            <div style={{ ...styles.leaf, ...styles.leaf1 }} />
            <div style={{ ...styles.leaf, ...styles.leaf2 }} />
            <div style={{ ...styles.leaf, ...styles.leaf3 }} />
          </div>
        </div>

        {/* ── Form ── */}
        <div style={styles.formWrap}>
          <h2 style={styles.heading}>Hello! Register to get started</h2>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <input style={styles.input} name="name" placeholder="Username"
              value={form.name} onChange={handleChange} required autoFocus autoComplete="name" />

            <input style={styles.input} type="email" name="email" placeholder="Email"
              value={form.email} onChange={handleChange} required autoComplete="email" />

            <input style={styles.input} name="phone" placeholder="Phone (e.g. 923001234567)"
              value={form.phone} onChange={handleChange} required autoComplete="tel" />

            {/* Password */}
            <div style={styles.pwdWrap}>
              <input style={{ ...styles.input, paddingRight: '2.8rem', marginBottom: 0 }}
                type={showPwd ? 'text' : 'password'} name="password" placeholder="Password"
                value={form.password} onChange={handleChange} required autoComplete="new-password" />
              <button type="button" style={styles.eyeBtn} onClick={() => setShowPwd(v => !v)} aria-label="Toggle">
                <EyeIcon open={showPwd} />
              </button>
            </div>

            {/* Confirm */}
            <div style={{ ...styles.pwdWrap, marginTop: '0.85rem' }}>
              <input style={{ ...styles.input, paddingRight: '2.8rem', marginBottom: 0 }}
                type={showConfirm ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm password"
                value={form.confirmPassword} onChange={handleChange} required autoComplete="new-password" />
              <button type="button" style={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)} aria-label="Toggle">
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.3rem', marginBottom: 0 }}>
                Passwords don't match
              </p>
            )}

            <button type="submit"
              style={{ ...styles.registerBtn, marginTop: '1.1rem', opacity: loading ? 0.7 : 1 }}
              disabled={loading}>
              {loading ? 'Creating…' : 'Register'}
            </button>
          </form>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>Or Register with</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Social icons */}
          <div style={styles.socialRow}>
            <div style={styles.socialBtn}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
            </div>
            <div style={styles.socialBtn}>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div style={styles.socialBtn}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#000">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </div>
          </div>

          <p style={styles.bottomText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.loginLink}>Login Now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Styles ────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f0f4f8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: 390,
    background: '#fff',
    borderRadius: '2rem',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
  },
  hero: {
    height: 160,
    background: 'linear-gradient(160deg, #d8edf5 0%, #c8e2ee 40%, #b8d8e8 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, transparent 60%, rgba(255,255,255,0.6) 100%)',
  },
  blob1: { position:'absolute', width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.25)', top:-50, right:-30 },
  blob2: { position:'absolute', width:90,  height:90,  borderRadius:'50%', background:'rgba(255,255,255,0.18)', top:10,  left:-15 },
  blob3: { position:'absolute', width:50,  height:50,  borderRadius:'50%', background:'rgba(255,255,255,0.3)',  bottom:30, left:25 },
  brand: { position:'absolute', top:16, left:20, display:'flex', alignItems:'center', gap:6, zIndex:2 },
  brandDot: { width:8, height:8, borderRadius:'50%', background:'#2563eb' },
  brandName: { fontSize:'0.82rem', fontWeight:700, color:'#1e40af', letterSpacing:'0.01em' },
  backBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#374151',
    zIndex: 3,
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  plantWrap: { position:'relative', width:70, height:110, zIndex:1 },
  pot:    { position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:44, height:38, background:'#4aabb8', borderRadius:'0 0 12px 12px', clipPath:'polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)' },
  potRim: { position:'absolute', bottom:36, left:'50%', transform:'translateX(-50%)', width:52, height:9, background:'#5bbdca', borderRadius:'4px' },
  stem:   { position:'absolute', bottom:44, left:'50%', transform:'translateX(-50%)', width:4, height:48, background:'#5a8a3c', borderRadius:4 },
  leaf:   { position:'absolute', width:32, height:16, borderRadius:'50% 50% 50% 0', background:'#6ab04c' },
  leaf1:  { bottom:82, left:'50%', transform:'rotate(-30deg)' },
  leaf2:  { bottom:68, left:'16%', transform:'rotate(160deg)', width:28, height:14, background:'#78c34d' },
  leaf3:  { bottom:94, left:'44%', transform:'rotate(20deg)', width:26, height:13, background:'#5aa03a' },

  formWrap: { padding: '1.5rem 1.75rem 1.4rem' },
  heading: { fontSize:'1.25rem', fontWeight:800, color:'#0f172a', lineHeight:1.25, marginBottom:'1.25rem', letterSpacing:'-0.02em' },
  errorBox: { background:'#fef2f2', border:'1px solid #fecaca', color:'#991b1b', borderRadius:'0.6rem', padding:'0.7rem 0.9rem', fontSize:'0.82rem', marginBottom:'0.9rem' },
  input: {
    width:'100%', padding:'0.75rem 1rem',
    border:'1.5px solid #e5e7eb', borderRadius:'0.65rem',
    fontSize:'0.88rem', fontFamily:'inherit', color:'#0f172a',
    background:'#f9fafb', outline:'none', marginBottom:'0.75rem',
    transition:'border-color 0.15s', boxSizing:'border-box',
  },
  pwdWrap: { position:'relative' },
  eyeBtn: { position:'absolute', right:'0.85rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', display:'flex', alignItems:'center', padding:0 },
  registerBtn: {
    width:'100%', padding:'0.82rem',
    background:'#0f172a', color:'#fff', border:'none',
    borderRadius:'0.65rem', fontSize:'0.95rem', fontWeight:700,
    cursor:'pointer', fontFamily:'inherit', letterSpacing:'0.01em',
    transition:'background 0.15s',
  },
  divider: { display:'flex', alignItems:'center', gap:'0.75rem', margin:'1.1rem 0' },
  dividerLine: { flex:1, height:1, background:'#e5e7eb' },
  dividerText: { fontSize:'0.72rem', color:'#9ca3af', whiteSpace:'nowrap' },
  socialRow: { display:'flex', justifyContent:'center', gap:'1rem', marginBottom:'1.1rem' },
  socialBtn: {
    width:44, height:44, borderRadius:'0.6rem',
    border:'1.5px solid #e5e7eb', display:'flex',
    alignItems:'center', justifyContent:'center',
    cursor:'pointer', background:'#fff',
  },
  bottomText: { textAlign:'center', fontSize:'0.82rem', color:'#6b7280', margin:0 },
  loginLink: { color:'#2563eb', fontWeight:700, textDecoration:'none' },
};
