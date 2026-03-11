import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', userName: '', password: '', confirmPassword: '',
    fullName: '', phone: '', identityNumber: '', address: '', emergencyContact: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({
        email: form.email, userName: form.userName, password: form.password,
        roleId: 3, // Resident
        fullName: form.fullName || undefined, phone: form.phone || undefined,
        identityNumber: form.identityNumber || undefined, address: form.address || undefined,
        emergencyContact: form.emergencyContact || undefined,
      });
      const { token, userId, userRole, username, email } = res.data;
      login(token, { userId, userRole, username, email });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.Message || err.response?.data || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'email', label: 'Email *', type: 'email', required: true },
    { name: 'userName', label: 'Username *', type: 'text', required: true },
    { name: 'fullName', label: 'Full Name', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'identityNumber', label: 'Identity Number', type: 'text' },
    { name: 'address', label: 'Address', type: 'text' },
    { name: 'emergencyContact', label: 'Emergency Contact', type: 'text' },
    { name: 'password', label: 'Password *', type: 'password', required: true },
    { name: 'confirmPassword', label: 'Confirm Password *', type: 'password', required: true },
  ];

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
        Create Account
      </h2>
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem',
          fontSize: '0.8125rem', color: '#f87171',
        }}>{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {fields.map((f) => (
            <div key={f.name} style={f.name === 'address' ? { gridColumn: 'span 2' } : undefined}>
              <label className="form-label">{f.label}</label>
              <input
                type={f.type} name={f.name} className="form-input"
                value={(form as any)[f.name]} onChange={handleChange} required={f.required}
              />
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
          style={{ width: '100%', marginTop: '1.25rem' }}>
          <UserPlus size={18} />
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
      <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--color-primary-light)', textDecoration: 'none' }}>Sign In</Link>
      </div>
    </div>
  );
}
