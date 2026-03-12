import { useEffect, useState } from 'react';
import { roomApi } from '../../api/rooms';
import { checkInApi } from '../../api/checkin';
import { paymentApi } from '../../api/payment';
import type { RoomDto, InvoiceDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import CheckInPaymentModal from '../../components/CheckInPaymentModal';
import { DoorOpen, LogIn } from 'lucide-react';

export default function RequestCheckInPage() {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceDto | null>(null);

  useEffect(() => {
    roomApi.getAll().then((r) => setRooms(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCheckIn = async (roomId: number) => {
    if (!confirm('Request check-in to this room?')) return;
    setSubmitting(true); 
    setError(''); 
    setSuccess('');
    try {
      // Step 1: Request check-in first
      const checkInRes = await checkInApi.requestCheckIn({ roomId });
      
      if (!checkInRes.data?.success) {
        setError(checkInRes.data?.message || 'Failed to submit check-in request');
        setSubmitting(false);
        return;
      }

      setSuccess('Check-in request submitted!');

      // Step 2: Reload rooms to update status
      try {
        const newRoomsList = await roomApi.getAll();
        setRooms(newRoomsList.data);
      } catch { /* noop */ }

      // Step 3: Try to fetch invoice if any exist for payment
      try {
        const invoicesRes = await paymentApi.getMyInvoices();
        const roomInvoice = invoicesRes.data?.find((inv: InvoiceDto) => 
          inv.roomId === roomId && (inv.status === 'Pending' || inv.status === 'Created')
        );
        
        if (roomInvoice) {
          setCurrentInvoice(roomInvoice);
          setShowPaymentModal(true);
          setSuccess('Check-in request submitted! Please complete payment.');
        }
      } catch { /* noop - payment is optional */ }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to request check-in';
      setError(errorMsg);
      console.error('Check-in error:', err);
    } finally { 
      setSubmitting(false); 
    }
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    setSuccess('Payment received! Check-in pending staff approval.');
    // Refresh rooms list
    const newRoomsList = await roomApi.getAll();
    setRooms(newRoomsList.data);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Request Check-In</h1>
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
      <CheckInPaymentModal 
        isOpen={showPaymentModal} 
        invoice={currentInvoice} 
        onPaymentSuccess={handlePaymentSuccess} 
        onCancel={() => setShowPaymentModal(false)} 
      />
    </div>
  );
}
