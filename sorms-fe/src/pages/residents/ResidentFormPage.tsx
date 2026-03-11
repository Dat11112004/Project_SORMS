import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { residentApi } from '../../api/residents';
import { roomApi } from '../../api/rooms';
import type { ResidentDto, RoomDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ArrowLeft, Save } from 'lucide-react';

export default function ResidentFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [form, setForm] = useState<Partial<ResidentDto>>({
    fullName: '', email: '', phone: '', identityNumber: '', gender: '',
    roomId: undefined, address: '', emergencyContact: '', notes: '', isActive: true,
  });

  useEffect(() => {
    roomApi.getAll().then((r) => setRooms(r.data)).catch(() => {});
    if (isEdit) {
      residentApi.getById(Number(id)).then((r) => setForm(r.data)).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await residentApi.update(Number(id), form);
      } else {
        await residentApi.create(form);
      }
      navigate('/residents');
    } catch (err: any) {
      setError(err.response?.data || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link to="/residents" className="btn btn-ghost btn-sm"><ArrowLeft size={18} /></Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{isEdit ? 'Edit' : 'Create'} Resident</h1>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem',
            fontSize: '0.8125rem', color: '#f87171',
          }}>{typeof error === 'string' ? error : 'An error occurred'}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.fullName || ''} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input type="email" className="form-input" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Phone *</label>
              <input className="form-input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">Identity Number</label>
              <input className="form-input" value={form.identityNumber || ''} onChange={(e) => setForm({ ...form, identityNumber: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select className="form-input" value={form.gender || ''} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Room</label>
              <select className="form-input" value={form.roomId || ''} onChange={(e) => setForm({ ...form, roomId: e.target.value ? Number(e.target.value) : undefined })}>
                <option value="">No Room</option>
                {rooms.map((r) => <option key={r.id} value={r.id}>{r.roomNumber} ({r.type || r.roomType})</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Address</label>
              <input className="form-input" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Emergency Contact</label>
              <input className="form-input" value={form.emergencyContact || ''} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Notes</label>
              <input className="form-input" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={18} /> {saving ? 'Saving...' : 'Save'}
            </button>
            <Link to="/residents" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
