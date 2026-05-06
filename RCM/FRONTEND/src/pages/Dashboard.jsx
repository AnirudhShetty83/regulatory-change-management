import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const STATUS_COLORS = {
  DRAFT:       '#94a3b8',
  SUBMITTED:   '#93c5fd',
  APPROVED:    '#86efac',
  IMPLEMENTED: '#6ee7b7',
  ARCHIVED:    '#fca5a5',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/changes/stats');
        setStats(res.data);
      } catch {
        // Fallback: derive stats from full list
        try {
          const res2 = await api.get('/api/changes');
          const items = Array.isArray(res2.data) ? res2.data : res2.data.content ?? [];
          const byStatus = {};
          items.forEach((c) => {
            byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
          });
          setStats({ total: items.length, byStatus });
        } catch {
          setError('Could not load statistics.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statusEntries = stats?.byStatus ? Object.entries(stats.byStatus) : [];

  return (
    <>
      <nav className="topbar">
        <span className="topbar-brand">⚖️ RCM Portal</span>
        <div className="topbar-nav">
          <button id="go-list" className="btn btn-secondary btn-sm" onClick={() => navigate('/list')}>
            ← Back to List
          </button>
          <button
            id="go-add"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/form')}
          >
            + Add New
          </button>
        </div>
      </nav>

      <div className="page-container">
        <div className="page-header">
          <h1>📊 Dashboard</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <>
            {/* Top-level KPIs */}
            <div className="kpi-grid">
              <div className="kpi-card" style={{ borderTop: '3px solid #38bdf8' }}>
                <div className="kpi-value">{stats?.total ?? 0}</div>
                <div className="kpi-label">Total Changes</div>
              </div>

              {statusEntries.map(([status, count]) => (
                <div
                  key={status}
                  className="kpi-card"
                  style={{ borderTop: `3px solid ${STATUS_COLORS[status] ?? '#64748b'}` }}
                >
                  <div className="kpi-value" style={{ color: STATUS_COLORS[status] ?? '#38bdf8' }}>
                    {count}
                  </div>
                  <div className="kpi-label">{status}</div>
                </div>
              ))}
            </div>

            {/* Status breakdown table */}
            {statusEntries.length > 0 && (
              <div className="card">
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#94a3b8', marginBottom: '16px' }}>
                  Status Breakdown
                </h2>
                <table>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Count</th>
                      <th>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusEntries.map(([status, count]) => {
                      const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                      return (
                        <tr key={status}>
                          <td>
                            <span style={{
                              display: 'inline-block',
                              width: 10, height: 10,
                              borderRadius: '50%',
                              background: STATUS_COLORS[status] ?? '#64748b',
                              marginRight: 8,
                            }} />
                            {status}
                          </td>
                          <td style={{ fontWeight: 600 }}>{count}</td>
                          <td>
                            <div style={{
                              background: '#0f172a',
                              borderRadius: 999,
                              overflow: 'hidden',
                              height: 8,
                              width: 140,
                            }}>
                              <div style={{
                                height: '100%',
                                width: `${pct}%`,
                                background: STATUS_COLORS[status] ?? '#38bdf8',
                                borderRadius: 999,
                                transition: 'width 0.6s ease',
                              }} />
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748b', marginLeft: 8 }}>{pct}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {statusEntries.length === 0 && !error && (
              <div className="empty-state">
                <h3>No data yet</h3>
                <p>Add regulatory changes to see statistics here.</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
