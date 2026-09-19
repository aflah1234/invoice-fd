import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, title }) {
  const { user } = useAuth();

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#374151' }}>{title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              Welcome, <strong>{user?.name}</strong>
            </span>
            <span
              className={`badge ${user?.role === 'admin' ? 'badge-purple' : user?.role === 'owner' ? 'badge-blue' : 'badge-green'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {user?.role}
            </span>
          </div>
        </header>
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
}
