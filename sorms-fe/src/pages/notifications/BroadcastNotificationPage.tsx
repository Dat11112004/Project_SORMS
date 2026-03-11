import { useState } from 'react';
import { notificationApi } from '../../api/notifications';
import { Send } from 'lucide-react';

export default function BroadcastNotificationPage() {
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('All');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      await notificationApi.broadcast({ message, targetRole });
      setSuccess('Broadcast sent successfully!');
      setMessage('');
    } catch (err: any) {
      setError(err.response?.data || 'Failed to send.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Broadcast Notification</h1>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#f87171' }}>{error}</div>}
        {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#34d399' }}>{success}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Target Audience</label>
            <select className="form-input" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
              <option value="All">All Users</option>
              <option value="Resident">Residents Only</option>
              <option value="Staff">Staff Only</option>
            </select>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Message *</label>
            <textarea className="form-input" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={500} placeholder="Enter notification message..." />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{message.length}/500</p>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Send size={18} /> {loading ? 'Sending...' : 'Send Broadcast'}
          </button>
        </form>
      </div>
    </div>
  );
}
