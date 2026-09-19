import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const HamburgerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const roleBadgeClass = {
  admin:    'badge-purple',
  owner:    'badge-blue',
  customer: 'badge-green',
};

export default function Layout({ children, title }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        {/* ── Topbar ── */}
        <header className="topbar">
          <div className="topbar-left">
            {/* Hamburger — visible only on mobile via CSS */}
            <button
              className="hamburger"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>

            <h1 className="topbar-title">{title}</h1>
          </div>

          <div className="topbar-right">
            {/* Role badge */}
            <span
              className={`badge ${roleBadgeClass[user?.role] || 'badge-gray'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {user?.role}
            </span>

            {/* User info + avatar */}
            <div className="topbar-user">
              <div className="topbar-user-info">
                <span className="topbar-user-name">{user?.name}</span>
                <span className="topbar-user-role">{user?.email}</span>
              </div>
              <div className="topbar-avatar">{initials}</div>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
}
