import { useEffect, useState } from 'react';
import { roomApi } from '../../api/rooms';
import { checkInApi } from '../../api/checkin';
import type { RoomDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { DoorOpen, LogIn } from 'lucide-react';

export default function RequestCheckInPage() {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    roomApi.getAvailable().then((r) => setRooms(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCheckIn = async (roomId: number) => {
    if (!confirm('Request check-in to this room?')) return;
    setSubmitting(true); setError(''); setSuccess('');
    try {
      await checkInApi.requestCheckIn({ roomId });
      setSuccess('Check-in request submitted! Waiting for approval.');
      setRooms(rooms.filter((r) => r.id !== roomId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request check-in.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Request Check-In</h1>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#f87171' }}>{error}</div>}
      {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#34d399' }}>{success}</div>}
      {rooms.length === 0 ? <EmptyState message="No available rooms" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {rooms.map((r) => (
            <div key={r.id} className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="gradient-secondary" style={{ width: 40, height: 40, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><DoorOpen size={20} /></div>
                <div>
                  <h3 style={{ fontWeight: 600 }}>Room {r.roomNumber}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.type || r.roomType} • Floor {r.floor}</p>
                </div>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                <p>{r.area} m² • ${r.monthlyRent?.toLocaleString()}/month</p>
                {r.description && <p style={{ marginTop: '0.25rem' }}>{r.description}</p>}
              </div>
              <button onClick={() => handleCheckIn(r.id)} className="btn btn-primary btn-sm" style={{ width: '100%' }} disabled={submitting}>
                <LogIn size={16} /> Request Check-In
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
