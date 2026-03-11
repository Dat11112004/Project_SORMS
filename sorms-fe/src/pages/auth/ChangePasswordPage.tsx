import { useState } from 'react';
import { authApi } from '../../api/auth';
import { KeyRound } from 'lucide-react';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setSuccess('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Change Password</h1>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem',
            fontSize: '0.8125rem', color: '#f87171',
          }}>{error}</div>
        )}
        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem',
            fontSize: '0.8125rem', color: '#34d399',
          }}>{success}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input"
              value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" placeholder="Min 6 characters"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Confirm New Password</label>
            <input type="password" className="form-input"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <KeyRound size={18} />
            {loading ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
