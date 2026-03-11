import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { ShieldCheck } from 'lucide-react';

export default function VerifyOtpPage() {
  const location = useLocation();
  const emailFromState = (location.state as any)?.email || '';
  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.verifyOtp({ email, otp });
      navigate('/reset-password', { state: { email, otp } });
    } catch (err: any) {
      setError(err.response?.data || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>
        Verify OTP
      </h2>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>
        Enter the OTP code sent to your email
      </p>
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem',
          fontSize: '0.8125rem', color: '#f87171',
        }}>{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">Email</label>
          <input type="email" className="form-input" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">OTP Code</label>
          <input type="text" className="form-input" placeholder="Enter 6-digit OTP"
            value={otp} onChange={(e) => setOtp(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
          style={{ width: '100%' }}>
          <ShieldCheck size={18} />
          {loading ? 'Verifying...' : 'Verify OTP'}
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
