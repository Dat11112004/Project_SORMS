import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { token, userId, userRole, username, email: userEmail } = res.data;
      login(token, { userId, userRole, username, email: userEmail });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
        Sign In
      </h2>
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
          <input
            type="email" className="form-input" placeholder="Enter your email"
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Password</label>
          <input
            type="password" className="form-input" placeholder="Enter your password"
            value={password} onChange={(e) => setPassword(e.target.value)} required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
          style={{ width: '100%' }}>
          <LogIn size={18} />
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        <Link to="/forgot-password" style={{ color: 'var(--color-primary-light)', textDecoration: 'none' }}>
          Forgot Password?
        </Link>
        <span style={{ margin: '0 0.5rem' }}>•</span>
        <Link to="/register" style={{ color: 'var(--color-primary-light)', textDecoration: 'none' }}>
          Create Account
        </Link>
      </div>
    </div>
  );
}
