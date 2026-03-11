import { useEffect, useState } from 'react';
import { staffApi } from '../../api/staff';
import type { StaffDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Save, User } from 'lucide-react';

export default function StaffProfilePage() {
  const [staff, setStaff] = useState<StaffDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });

  useEffect(() => {
    staffApi.getMyProfile().then(r => {
      setStaff(r.data);
      setForm({ fullName: r.data.fullName, email: r.data.email, phone: r.data.phone });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess(''); setSaving(true);
    try {
      await staffApi.updateMyProfile(form);
      setSuccess('Profile updated!');
    } catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!staff) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Profile not found.</div>;

  return (
    <div style={{ maxWidth: 500 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="gradient-info" style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><User size={24} /></div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>My Staff Profile</h1>
      </div>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#f87171' }}>{error}</div>}
      {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#34d399' }}>{success}</div>}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div><label className="form-label">Full Name</label><input className="form-input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving} style={{ marginTop: '1rem' }}><Save size={16} /> {saving ? 'Saving...' : 'Save'}</button>
        </form>
      </div>
    </div>
  );
}
