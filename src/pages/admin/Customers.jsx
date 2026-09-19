import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import API from '../../api/axios';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/admin/customers')
      .then(({ data }) => setCustomers(data.customers))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <Layout title="Customers">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Customers ({customers.length})</h1>
      </div>

      <div className="search-bar">
        <input
          className="search-input"
          placeholder="Search by name, email, or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="table-wrap card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>WhatsApp</th>
                <th>WA Key Set</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                    No customers found
                  </td>
                </tr>
              ) : filtered.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.whatsapp || <span style={{ color: '#9ca3af' }}>—</span>}</td>
                  <td>
                    {c.whatsappApiKey ? (
                      <span className="badge badge-green">Yes</span>
                    ) : (
                      <span className="badge badge-gray">No</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${c.isActive ? 'badge-green' : 'badge-red'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
