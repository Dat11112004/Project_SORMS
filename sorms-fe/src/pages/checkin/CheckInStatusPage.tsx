import { useEffect, useState } from 'react';
import { checkInApi } from '../../api/checkin';
import type { CheckInRecordDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { LogOut } from 'lucide-react';

export default function CheckInStatusPage() {
  const [status, setStatus] = useState<CheckInRecordDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    checkInApi.getMyStatus().then((r) => setStatus(r.data?.data || null)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCheckOut = async () => {
    if (!status || !confirm('Request check-out?')) return;
    setSubmitting(true); setMsg('');
    try {
      await checkInApi.requestCheckOut({ checkInRecordId: status.id });
      setMsg('Check-out request submitted!');
      checkInApi.getMyStatus().then((r) => setStatus(r.data?.data || null));
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Failed.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>My Check-In Status</h1>
      {msg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#34d399' }}>{msg}</div>}
      {!status ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>You are not currently checked in to any room.</div>
      ) : (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Room</p><p style={{ fontWeight: 600 }}>{status.roomNumber}</p></div>
            <div><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</p><StatusBadge status={status.status} /></div>
            <div><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Request Time</p><p style={{ fontSize: '0.875rem' }}>{new Date(status.requestTime).toLocaleString()}</p></div>
            <div><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Check-In Time</p><p style={{ fontSize: '0.875rem' }}>{status.checkInTime ? new Date(status.checkInTime).toLocaleString() : '—'}</p></div>
            {status.rejectReason && <div style={{ gridColumn: 'span 2' }}><p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reject Reason</p><p style={{ fontSize: '0.875rem', color: '#f87171' }}>{status.rejectReason}</p></div>}
          </div>
          {status.status === 'CheckedIn' && (
            <button onClick={handleCheckOut} className="btn btn-danger" style={{ marginTop: '1.5rem', width: '100%' }} disabled={submitting}>
              <LogOut size={18} /> {submitting ? 'Requesting...' : 'Request Check-Out'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
