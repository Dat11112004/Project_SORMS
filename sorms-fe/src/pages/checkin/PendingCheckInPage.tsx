import { useEffect, useState } from 'react';
import { checkInApi } from '../../api/checkin';
import type { CheckInRecordDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { Check, X } from 'lucide-react';

export default function PendingCheckInPage({ type = 'checkin' }: { type?: 'checkin' | 'checkout' }) {
  const [records, setRecords] = useState<CheckInRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => { load(); }, [type]);

  const load = async () => {
    setLoading(true);
    try {
      const res = type === 'checkin' ? await checkInApi.getPendingCheckIn() : await checkInApi.getPendingCheckOut();
      setRecords(res.data?.data || []);
    } catch { /* noop */ } finally { setLoading(false); }
  };

  const handleApprove = async (id: number) => {
    try {
      const fn = type === 'checkin' ? checkInApi.approveCheckIn : checkInApi.approveCheckOut;
      await fn({ requestId: id, isApproved: true });
      load();
    } catch { alert('Failed to approve.'); }
  };

  const handleReject = async () => {
    if (!selectedId) return;
    try {
      const fn = type === 'checkin' ? checkInApi.approveCheckIn : checkInApi.approveCheckOut;
      await fn({ requestId: selectedId, isApproved: false, rejectReason });
      setShowRejectModal(false); setRejectReason('');
      load();
    } catch { alert('Failed to reject.'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Pending {type === 'checkin' ? 'Check-In' : 'Check-Out'} Requests
      </h1>
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        {records.length === 0 ? <EmptyState message="No pending requests" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Resident</th><th>Room</th><th>Request Time</th><th>Expected Dates</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.residentName}</td>
                    <td>{r.roomNumber}</td>
                    <td>{new Date(r.requestTime).toLocaleString()}</td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {r.expectedCheckInDate ? new Date(r.expectedCheckInDate).toLocaleDateString() : '—'} <br/>
                      to {r.expectedCheckOutDate ? new Date(r.expectedCheckOutDate).toLocaleDateString() : '—'}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button onClick={() => handleApprove(r.id)} className="btn btn-success btn-sm"><Check size={16} /> Approve</button>
                        <button onClick={() => { setSelectedId(r.id); setShowRejectModal(true); }} className="btn btn-danger btn-sm"><X size={16} /> Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Request">
        <div>
          <label className="form-label">Reject Reason</label>
          <textarea className="form-input" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter reason..." />
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowRejectModal(false)} className="btn btn-secondary">Cancel</button>
          <button onClick={handleReject} className="btn btn-danger">Reject</button>
        </div>
      </Modal>
    </div>
  );
}
