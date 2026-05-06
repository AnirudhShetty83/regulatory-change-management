import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const STATUS_BADGE = {
  DRAFT:       'badge badge-draft',
  SUBMITTED:   'badge badge-submitted',
  APPROVED:    'badge badge-approved',
  IMPLEMENTED: 'badge badge-implemented',
  ARCHIVED:    'badge badge-archived',
};

export default function List() {
  const navigate = useNavigate();
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [error, setError] = useState('');

  const fetchChanges = async (q = '') => {
    setLoading(true);
    setError('');
    try {
      const url = q ? `/api/changes/search?q=${encodeURIComponent(q)}` : '/api/changes';
      const res = await api.get(url);
      setChanges(Array.isArray(res.data) ? res.data : res.data.content ?? []);
    } catch (err) {
      setError('Failed to load regulatory changes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChanges(); }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQ(val);
    if (val.length === 0 || val.length >= 2) fetchChanges(val);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this regulatory change?')) return;
    try {
      await api.delete(`/api/changes/${id}`);
      setChanges((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Delete failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <>
      <nav className="topbar">
        <span className="topbar-brand">⚖️ RCM Portal</span>
        <div className="topbar-nav">
          <button id="go-dashboard" className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>
            📊 Dashboard
          </button>
          <button id="add-new-btn" className="btn btn-primary btn-sm" onClick={() => navigate('/form')}>
            + Add New
          </button>
          <button id="logout-btn" className="btn btn-danger btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="page-container">
        <div className="page-header">
          <h1>Regulatory Changes</h1>
        </div>

        <div className="search-bar">
          <input
            id="search-input"
            type="text"
            value={searchQ}
            onChange={handleSearch}
            placeholder="🔍 Search by title, category…"
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : changes.length === 0 ? (
            <div className="empty-state">
              <h3>No records found</h3>
              <p>Try a different search term or add a new regulatory change.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Deadline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((c) => (
                  <tr key={c.id}>
                    <td style={{ color: '#64748b', fontSize: '12px' }}>#{c.id}</td>
                    <td style={{ fontWeight: 500, color: '#f1f5f9', maxWidth: 220 }}>
                      <div style={{ marginBottom: '4px' }}>{c.title}</div>
                      {c.aiDescription && (
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', lineHeight: '1.4' }}>
                          ✨ {c.aiDescription}
                        </div>
                      )}
                    </td>
                    <td>{c.category}</td>
                    <td>
                      <span className={STATUS_BADGE[c.status] ?? 'badge badge-draft'}>
                        {c.status}
                      </span>
                    </td>
                    <td>{c.priority}</td>
                    <td style={{ fontSize: '13px' }}>
                      {c.deadline ? new Date(c.deadline).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <button
                        id={`delete-btn-${c.id}`}
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(c.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
