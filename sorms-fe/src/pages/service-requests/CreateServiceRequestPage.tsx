import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceRequestApi } from '../../api/serviceRequests';
import { ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreateServiceRequestPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', serviceType: 'Maintenance', description: '', priority: 'Normal' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await serviceRequestApi.create(form);
      navigate('/service-requests/my');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create request.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link to="/service-requests/my" className="btn btn-ghost btn-sm"><ArrowLeft size={18} /></Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create Service Request</h1>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#f87171' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label className="form-label">Service Type</label>
                <select className="form-input" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>
                  <option>Maintenance</option><option>Cleaning</option><option>Electrical</option><option>Plumbing</option><option>Internet</option><option>Other</option>
                </select>
              </div>
              <div><label className="form-label">Priority</label>
                <select className="form-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option>Low</option><option>Normal</option><option>High</option><option>Urgent</option>
                </select>
              </div>
            </div>
            <div><label className="form-label">Description *</label><textarea className="form-input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1.25rem' }}><Send size={18} /> {loading ? 'Submitting...' : 'Submit Request'}</button>
        </form>
      </div>
    </div>
  );
}
