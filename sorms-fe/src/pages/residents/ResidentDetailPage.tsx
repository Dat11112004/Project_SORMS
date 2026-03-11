import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { residentApi } from '../../api/residents';
import type { ResidentDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeft, Pencil } from 'lucide-react';

export default function ResidentDetailPage() {
  const { id } = useParams();
  const [resident, setResident] = useState<ResidentDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) residentApi.getById(Number(id)).then((r) => setResident(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!resident) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Resident not found.</div>;

  const info = [
    ['Full Name', resident.fullName], ['Email', resident.email],
    ['Phone', resident.phone || resident.phoneNumber], ['Identity Number', resident.identityNumber],
    ['Gender', resident.gender], ['Date of Birth', resident.dateOfBirth ? new Date(resident.dateOfBirth).toLocaleDateString() : '—'],
    ['Room', resident.roomNumber || '—'], ['Address', resident.address],
    ['Emergency Contact', resident.emergencyContact], ['Notes', resident.notes],
    ['Check-In', resident.checkInDate ? new Date(resident.checkInDate).toLocaleDateString() : '—'],
    ['Check-Out', resident.checkOutDate ? new Date(resident.checkOutDate).toLocaleDateString() : '—'],
    ['Created At', resident.createdAt ? new Date(resident.createdAt).toLocaleDateString() : '—'],
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link to="/residents" className="btn btn-ghost btn-sm"><ArrowLeft size={18} /></Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, flex: 1 }}>Resident Detail</h1>
        <Link to={`/residents/${id}/edit`} className="btn btn-primary btn-sm"><Pencil size={16} /> Edit</Link>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="gradient-primary" style={{
            width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, color: '#fff',
          }}>{resident.fullName?.charAt(0)}</div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{resident.fullName}</h2>
            <StatusBadge status={resident.isActive ? 'Active' : 'Inactive'} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {info.map(([label, value]) => (
            <div key={label}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</p>
              <p style={{ fontSize: '0.875rem' }}>{value || '—'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
