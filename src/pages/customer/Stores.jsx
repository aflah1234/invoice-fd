import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import API from '../../api/axios';

export default function CustomerStores() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    API.get('/customer/stores')
      .then(({ data }) => {
        setStores(data.stores);
        // Extract unique categories
        const cats = [...new Set(data.stores.map((s) => s.category).filter(Boolean))];
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = stores.filter((s) => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || s.category === category;
    return matchSearch && matchCat;
  });

  return (
    <Layout title="Stores">
      <h1 className="page-title">Browse Stores</h1>

      <div className="search-bar">
        <input
          className="search-input"
          placeholder="Search stores…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
          <h3>No stores found</h3>
          <p>Try a different search term or category.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((store) => (
            <div
              key={store._id}
              className="store-card"
              onClick={() => navigate(`/customer/stores/${store._id}/items`)}
            >
              <div className="store-card-header">
                {store.logo ? (
                  <img src={`/uploads/${store.logo}`} alt={store.name} className="store-logo" />
                ) : (
                  <div className="store-logo-placeholder">🏪</div>
                )}
                <div>
                  <div className="store-name">{store.name}</div>
                  <div className="store-category">
                    <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>{store.category}</span>
                  </div>
                </div>
              </div>
              {store.description && (
                <div style={{ padding: '0 1.25rem 0.75rem', fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5 }}>
                  {store.description.slice(0, 100)}{store.description.length > 100 ? '…' : ''}
                </div>
              )}
              {store.address && (
                <div style={{ padding: '0 1.25rem 1rem', fontSize: '0.78rem', color: '#9ca3af', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  📍 {store.address}
                </div>
              )}
              <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>📞 {store.phone || '—'}</span>
                <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>View Items →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
