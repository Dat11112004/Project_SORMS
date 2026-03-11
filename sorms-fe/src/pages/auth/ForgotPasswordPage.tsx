import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      navigate('/verify-otp', { state: { email } });
    } catch (err: any) {
      setError(err.response?.data || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>
        Forgot Password
      </h2>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>
        Enter your email to receive an OTP code
      </p>
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem',
          fontSize: '0.8125rem', color: '#f87171',
        }}>{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Email</label>
          <input type="email" className="form-input" placeholder="Enter your email"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
          style={{ width: '100%' }}>
          <Mail size={18} />
          {loading ? 'Sending...' : 'Send OTP'}
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
