import { useState, useEffect } from 'react';
import { notificationApi } from '../../api/notifications';
import { residentApi } from '../../api/residents';
import type { ResidentDto } from '../../types';
import { Send } from 'lucide-react';

export default function SendNotificationPage() {
  const [message, setMessage] = useState('');
  const [residentId, setResidentId] = useState<number>(0);
  const [residents, setResidents] = useState<ResidentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    residentApi.getAll().then((r) => setResidents(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      await notificationApi.sendIndividual({ message, residentId });
      setSuccess('Notification sent!');
      setMessage('');
    } catch (err: any) {
      setError(err.response?.data || 'Failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Send Individual Notification</h1>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#f87171' }}>{error}</div>}
        {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#34d399' }}>{success}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Select Resident *</label>
            <select className="form-input" value={residentId} onChange={(e) => setResidentId(Number(e.target.value))} required>
              <option value={0}>Choose resident...</option>
              {residents.map((r) => <option key={r.id} value={r.id}>{r.fullName} ({r.email})</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Message *</label>
            <textarea className="form-input" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={500} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !residentId}>
            <Send size={18} /> {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </div>
    </div>
  );
}
