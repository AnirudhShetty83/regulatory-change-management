import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const STATUSES = ['DRAFT', 'SUBMITTED', 'APPROVED', 'IMPLEMENTED', 'ARCHIVED'];
const PRIORITIES = ['P1', 'P2', 'P3'];

export default function Form() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    regulatoryBody: '',
    category: '',
    status: 'DRAFT',
    priority: 'P2',
    impactScore: '',
    deadline: '',
    assignedTo: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.regulatoryBody.trim()) e.regulatoryBody = 'Regulatory Body is required.';
    if (!form.category.trim()) e.category = 'Category is required.';
    if (form.impactScore !== '' && (form.impactScore < 0 || form.impactScore > 10))
      e.impactScore = 'Impact Score must be between 0 and 10.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) { setErrors(validation); return; }

    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        ...form,
        impactScore: form.impactScore === '' ? null : Number(form.impactScore),
        deadline: form.deadline || null,
      };
      await api.post('/api/changes', payload);
      navigate('/list');
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to create change. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <nav className="topbar">
        <span className="topbar-brand">⚖️ RCM Portal</span>
        <button id="back-to-list" className="btn btn-secondary btn-sm" onClick={() => navigate('/list')}>
          ← Back to List
        </button>
      </nav>

      <div className="page-container" style={{ maxWidth: 760 }}>
        <div className="page-header">
          <h1>Create Regulatory Change</h1>
        </div>

        {submitError && <div className="alert alert-error">{submitError}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
              {/* Title */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="title">Title *</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. GDPR Compliance Update"
                />
                {errors.title && <span style={{ color: '#fca5a5', fontSize: '12px' }}>{errors.title}</span>}
              </div>

              {/* Description */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the regulatory change…"
                />
              </div>

              {/* Regulatory Body */}
              <div className="form-group">
                <label htmlFor="regulatoryBody">Regulatory Body *</label>
                <input
                  id="regulatoryBody"
                  name="regulatoryBody"
                  type="text"
                  value={form.regulatoryBody}
                  onChange={handleChange}
                  placeholder="e.g. SEC, GDPR, RBI"
                />
                {errors.regulatoryBody && <span style={{ color: '#fca5a5', fontSize: '12px' }}>{errors.regulatoryBody}</span>}
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Data Privacy, Anti-Money Laundering"
                />
                {errors.category && <span style={{ color: '#fca5a5', fontSize: '12px' }}>{errors.category}</span>}
              </div>

              {/* Status */}
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={form.status} onChange={handleChange}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Priority */}
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Impact Score */}
              <div className="form-group">
                <label htmlFor="impactScore">Impact Score (0–10)</label>
                <input
                  id="impactScore"
                  name="impactScore"
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={form.impactScore}
                  onChange={handleChange}
                  placeholder="0–10"
                />
                {errors.impactScore && <span style={{ color: '#fca5a5', fontSize: '12px' }}>{errors.impactScore}</span>}
              </div>

              {/* Deadline */}
              <div className="form-group">
                <label htmlFor="deadline">Deadline</label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={handleChange}
                />
              </div>

              {/* Assigned To */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="assignedTo">Assigned To</label>
                <input
                  id="assignedTo"
                  name="assignedTo"
                  type="text"
                  value={form.assignedTo}
                  onChange={handleChange}
                  placeholder="e.g. compliance-team@company.com"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/list')}
              >
                Cancel
              </button>
              <button
                id="submit-form-btn"
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Creating…' : '✓ Create Change'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
