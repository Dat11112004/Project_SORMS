import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { staffApi } from '../../api/staff';
import type { StaffDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ArrowLeft, Pencil } from 'lucide-react';

export default function StaffDetailPage() {
  const { id } = useParams();
  const [staff, setStaff] = useState<StaffDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    staffApi.getById(Number(id)).then((r) => setStaff(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!staff) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Staff not found.</div>;

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link to="/staff" className="btn btn-ghost btn-sm"><ArrowLeft size={18} /></Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, flex: 1 }}>Staff Detail</h1>
        <Link to={`/staff/${id}/edit`} className="btn btn-primary btn-sm"><Pencil size={16} /> Edit</Link>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="gradient-info" style={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{staff.fullName?.charAt(0)}</div>
          <div><h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{staff.fullName}</h2><p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Staff Member</p></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</p><p>{staff.email}</p></div>
          <div><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone</p><p>{staff.phone}</p></div>
        </div>
      </div>
    </div>
  );
}
