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

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAssignedChanges = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/changes/assigned');
      setChanges(Array.isArray(res.data) ? res.data : res.data.content ?? []);
    } catch (err) {
      setError('Failed to load assigned regulatory changes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignedChanges(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/api/changes/${id}/status?status=${newStatus}`);
      fetchAssignedChanges();
    } catch (err) {
      alert('Failed to update status.');
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
          <span style={{ color: '#94a3b8', marginRight: '16px' }}>Worker Dashboard</span>
          <button id="logout-btn" className="btn btn-danger btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="page-container">
        <div className="page-header">
          <h1>My Assigned Tasks</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : changes.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks assigned</h3>
              <p>You have no regulatory changes assigned to you right now.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title & Description</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((c) => (
                  <tr key={c.id}>
                    <td style={{ color: '#64748b', fontSize: '12px' }}>#{c.id}</td>
                    <td style={{ fontWeight: 500, color: '#f1f5f9', maxWidth: 300 }}>
                      <div style={{ marginBottom: '4px' }}>{c.title}</div>
                      {c.aiDescription && (
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', lineHeight: '1.4' }}>
                          ✨ {c.aiDescription}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={STATUS_BADGE[c.status] ?? 'badge badge-draft'}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {c.deadline ? new Date(c.deadline).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <select 
                        value={c.status} 
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        className="form-control" 
                        style={{ padding: '4px 8px', width: 'auto', display: 'inline-block' }}
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="APPROVED">Approved</option>
                        <option value="IMPLEMENTED">Implemented</option>
                      </select>
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
