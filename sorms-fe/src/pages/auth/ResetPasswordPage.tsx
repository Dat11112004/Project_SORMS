import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { KeyRound } from 'lucide-react';

export default function ResetPasswordPage() {
  const location = useLocation();
  const { email: emailFromState = '', otp: otpFromState = '' } = (location.state as any) || {};
  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState(otpFromState);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
        Reset Password
      </h2>
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
          <label className="form-label">Email</label>
          <input type="email" className="form-input" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">OTP Code</label>
          <input type="text" className="form-input" value={otp}
            onChange={(e) => setOtp(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">New Password</label>
          <input type="password" className="form-input" placeholder="Min 6 characters"
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Confirm Password</label>
          <input type="password" className="form-input"
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
          style={{ width: '100%' }}>
          <KeyRound size={18} />
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8125rem' }}>
        <Link to="/login" style={{ color: 'var(--color-primary-light)', textDecoration: 'none' }}>
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
