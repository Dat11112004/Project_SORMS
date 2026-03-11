import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { reportApi } from '../../api/reports';
import { ArrowLeft, Send } from 'lucide-react';

export default function CreateReportPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await reportApi.create(form);
      navigate('/reports');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link to="/reports" className="btn btn-ghost btn-sm"><ArrowLeft size={18} /></Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create Report</h1>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#f87171' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div style={{ marginBottom: '1.5rem' }}><label className="form-label">Content *</label><textarea className="form-input" rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required /></div>
          <button type="submit" className="btn btn-primary" disabled={loading}><Send size={18} /> {loading ? 'Submitting...' : 'Submit Report'}</button>
        </form>
      </div>
    </div>
  );
}
