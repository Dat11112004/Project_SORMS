import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { roomApi } from '../../api/rooms';
import type { RoomDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ArrowLeft, Save } from 'lucide-react';

export default function RoomFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<RoomDto>>({
    roomNumber: '', type: '', floor: 1, monthlyRent: 0, area: 0, description: '', isActive: true,
  });

  useEffect(() => {
    if (isEdit) roomApi.getById(Number(id)).then((r) => setForm(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (isEdit) await roomApi.update(Number(id), form);
      else await roomApi.create(form);
      navigate('/rooms');
    } catch (err: any) {
      setError(err.response?.data || 'Failed to save.');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link to="/rooms" className="btn btn-ghost btn-sm"><ArrowLeft size={18} /></Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{isEdit ? 'Edit' : 'Create'} Room</h1>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#f87171' }}>{typeof error === 'string' ? error : 'Error occurred'}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><label className="form-label">Room Number *</label><input className="form-input" value={form.roomNumber || ''} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} required /></div>
            <div><label className="form-label">Type *</label><select className="form-input" value={form.type || ''} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
              <option value="">Select...</option><option value="Single">Single</option><option value="Double">Double</option><option value="Suite">Suite</option><option value="Shared">Shared</option>
            </select></div>
            <div><label className="form-label">Floor</label><input type="number" className="form-input" value={form.floor || 1} onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })} /></div>
            <div><label className="form-label">Area (m²)</label><input type="number" step="0.1" className="form-input" value={form.area || 0} onChange={(e) => setForm({ ...form, area: Number(e.target.value) })} /></div>
            <div><label className="form-label">Monthly Rent ($)</label><input type="number" step="0.01" className="form-input" value={form.monthlyRent || 0} onChange={(e) => setForm({ ...form, monthlyRent: Number(e.target.value) })} /></div>
            <div style={{ gridColumn: 'span 2' }}><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}><Save size={18} /> {saving ? 'Saving...' : 'Save'}</button>
            <Link to="/rooms" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
