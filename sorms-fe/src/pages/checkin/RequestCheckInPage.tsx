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

  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [numberOfResidents, setNumberOfResidents] = useState(1);

  const today = new Date().toISOString().split('T')[0];

  const fetchAvailableRooms = () => {
    setLoading(true);
    roomApi.getAvailable(checkInDate, checkOutDate)
      .then((r) => setRooms(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // If you only want to search when both dates are entered, uncomment below
    // if (checkInDate && checkOutDate) { fetchAvailableRooms(); }
    fetchAvailableRooms();
  }, [checkInDate, checkOutDate]);

  const handleCheckIn = async (roomId: number) => {
    if (!checkInDate || !checkOutDate) {
      setError('Please select check-in and check-out dates.');
      return;
    }
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      setError('Check-out date must be after check-in date.');
      return;
    }
    if (!confirm('Request check-in to this room for selected dates?')) return;
    setSubmitting(true); setError(''); setSuccess('');
    try {
      await checkInApi.requestCheckIn({ 
        roomId,
        expectedCheckInDate: new Date(checkInDate).toISOString(),
        expectedCheckOutDate: new Date(checkOutDate).toISOString(),
        numberOfResidents: numberOfResidents
      });
      setSuccess('Check-in request submitted! Waiting for approval.');
      fetchAvailableRooms();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request check-in.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Request Check-In</h1>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', backgroundColor: 'var(--bg-glass)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Check-In Date</label>
          <input type="date" className="form-input" style={{ width: '100%' }} value={checkInDate} min={today} onChange={(e) => setCheckInDate(e.target.value)} onKeyDown={(e) => e.preventDefault()} />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Check-Out Date</label>
          <input type="date" className="form-input" style={{ width: '100%' }} value={checkOutDate} min={checkInDate || today} onChange={(e) => setCheckOutDate(e.target.value)} onKeyDown={(e) => e.preventDefault()} />
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Occupants</label>
          <input type="number" className="form-input" style={{ width: '100%' }} value={numberOfResidents} min={1} max={10} onChange={(e) => setNumberOfResidents(parseInt(e.target.value) || 1)} />
        </div>
      </div>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#f87171' }}>{error}</div>}
      {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#34d399' }}>{success}</div>}
      {rooms.length === 0 ? <EmptyState message="No rooms available" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {rooms.map((r) => {
            const isAvailable = r.status === 'Available';
            return (
            <div key={r.id} className="glass-card" style={{ padding: '1.25rem', opacity: isAvailable ? 1 : 0.6, transition: 'opacity 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="gradient-secondary" style={{ width: 40, height: 40, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><DoorOpen size={20} /></div>
                <div>
                  <h3 style={{ fontWeight: 600 }}>Room {r.roomNumber}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {r.type || r.roomType} • Floor {r.floor} • 
                    <span style={{ fontWeight: 600, color: isAvailable ? '#10b981' : '#f59e0b', marginLeft: '0.25rem' }}>{r.status}</span>
                  </p>
                </div>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                <p>{r.area} m² • ${r.monthlyRent?.toLocaleString()}/month</p>
                {r.description && <p style={{ marginTop: '0.25rem' }}>{r.description}</p>}
                {r.status === 'Maintenance' && r.maintenanceEndDate && (
                  <p style={{ marginTop: '0.25rem', color: '#ef4444', fontWeight: 500 }}>
                    Maintenance until {new Date(r.maintenanceEndDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button onClick={() => handleCheckIn(r.id)} className="btn btn-primary btn-sm" style={{ width: '100%' }} disabled={submitting || !isAvailable}>
                <LogIn size={16} /> Request Check-In
              </button>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
