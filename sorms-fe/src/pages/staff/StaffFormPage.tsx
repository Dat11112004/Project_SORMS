import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { staffApi } from '../../api/staff';
import { authApi } from '../../api/auth';
import type { StaffDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';

export default function StaffFormPage({ isCreate = false }: { isCreate?: boolean }) {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<StaffDto>>({ fullName: '', email: '', phone: '' });
  const [createForm, setCreateForm] = useState({ email: '', userName: '', password: '', fullName: '', phone: '' });

  useEffect(() => {
    if (isEdit) staffApi.getById(Number(id)).then(r => setForm(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true);
    try { await staffApi.update(Number(id), form); navigate('/staff'); }
    catch (err: any) { setError(err.response?.data?.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await authApi.createStaff({ email: createForm.email, userName: createForm.userName, password: createForm.password, roleId: 2, fullName: createForm.fullName, phone: createForm.phone });
      navigate('/staff');
    } catch (err: any) { setError(err.response?.data?.Message || err.response?.data || 'Failed.'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link to="/staff" className="btn btn-ghost btn-sm"><ArrowLeft size={18} /></Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{isCreate ? 'Create Staff' : 'Edit Staff'}</h1>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#f87171' }}>{String(error)}</div>}
        {isCreate ? (
          <form onSubmit={handleSubmitCreate}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div><label className="form-label">Full Name *</label><input className="form-input" value={createForm.fullName} onChange={e => setCreateForm({ ...createForm, fullName: e.target.value })} required /></div>
              <div><label className="form-label">Email *</label><input type="email" className="form-input" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} required /></div>
              <div><label className="form-label">Username *</label><input className="form-input" value={createForm.userName} onChange={e => setCreateForm({ ...createForm, userName: e.target.value })} required /></div>
              <div><label className="form-label">Password *</label><input type="password" className="form-input" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} required minLength={6} /></div>
              <div><label className="form-label">Phone</label><input className="form-input" value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} /></div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '1.25rem' }}><UserPlus size={18} /> {saving ? 'Creating...' : 'Create'}</button>
          </form>
        ) : (
          <form onSubmit={handleSubmitEdit}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div><label className="form-label">Full Name</label><input className="form-input" value={form.fullName || ''} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
              <div><label className="form-label">Email</label><input type="email" className="form-input" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="form-label">Phone</label><input className="form-input" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}><Save size={18} /> Save</button>
              <Link to="/staff" className="btn btn-secondary">Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
