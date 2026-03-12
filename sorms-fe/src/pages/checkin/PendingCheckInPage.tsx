import { useCallback, useEffect, useState } from 'react';
import { checkInApi } from '../../api/checkin';
import { paymentApi } from '../../api/payment';
import type { CheckInRecordDto, InvoiceDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { Check, X, AlertCircle } from 'lucide-react';

export default function PendingCheckInPage({ type = 'checkin' }: { type?: 'checkin' | 'checkout' }) {
  const [records, setRecords] = useState<CheckInRecordDto[]>([]);
  const [invoices, setInvoices] = useState<Record<number, InvoiceDto>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = type === 'checkin' ? await checkInApi.getPendingCheckIn() : await checkInApi.getPendingCheckOut();
      const pendingRecords = res.data?.data || [];
      setRecords(pendingRecords);
      
      // Fetch invoice status for each check-in request
      if (type === 'checkin') {
        const invoiceMap: Record<number, InvoiceDto> = {};
        try {
          const invoiceRes = await paymentApi.getAllInvoices(1, 1000);
          const allInvoices = invoiceRes.data || [];

          for (const record of pendingRecords) {
            const roomInvoice = allInvoices
              .filter((inv: InvoiceDto) => inv.residentId === record.residentId && inv.roomId === record.roomId)
              .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0];

            if (roomInvoice) {
              invoiceMap[record.id] = roomInvoice;
            }
          }
        } catch (err) {
          console.warn('Failed to fetch invoices for pending check-in records:', err);
        }

        setInvoices(invoiceMap);
      }
    } catch (err: unknown) {
      const statusCode = typeof err === 'object' && err !== null && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;
      const errorMsg = statusCode === 403 
        ? 'You do not have permission to view pending requests.'
        : err instanceof Error ? err.message : 'Failed to load pending requests.';
      setError(errorMsg);
      console.error('Load pending check-in error:', errorMsg, err);
    } finally { 
      setLoading(false); 
    }
  }, [type]);

  useEffect(() => {
    void load();

    const intervalId = window.setInterval(() => {
      void load();
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [load]);

  const handleApprove = async (id: number) => {
    // Check if payment is completed before approving check-in
    if (type === 'checkin' && invoices[id]?.status !== 'Paid') {
      alert('Payment must be completed before approving check-in.');
      return;
    }
    
    setApprovingId(id);
    try {
      const fn = type === 'checkin' ? checkInApi.approveCheckIn : checkInApi.approveCheckOut;
      await fn({ requestId: id, isApproved: true });
      load();
    } catch { alert('Failed to approve.'); } finally { setApprovingId(null); }
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
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem', color: '#f87171' }}>
          ⚠️ {error}
        </div>
      )}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        {records.length === 0 ? <EmptyState message="No pending requests" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Room</th>
                  <th>Request Time</th>
                  <th>Expected Dates</th>
                  <th>Status</th>
                  {type === 'checkin' && <th>Payment</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const invoice = invoices[r.id];
                  const paymentCompleted = !invoice || invoice.status === 'Paid';
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>{r.residentName}</td>
                      <td>{r.roomNumber}</td>
                      <td>{new Date(r.requestTime).toLocaleString()}</td>
                      <td style={{ fontSize: '0.8125rem' }}>
                        {r.expectedCheckInDate ? new Date(r.expectedCheckInDate).toLocaleDateString() : '—'} <br/>
                        to {r.expectedCheckOutDate ? new Date(r.expectedCheckOutDate).toLocaleDateString() : '—'}
                      </td>
                      <td><StatusBadge status={r.status} /></td>
                      {type === 'checkin' && (
                        <td>
                          {invoice ? (
                            <span style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              backgroundColor: invoice.status === 'Paid' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                              color: invoice.status === 'Paid' ? '#10b981' : '#ef4444'
                            }}>
                              {invoice.status}
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              backgroundColor: 'rgba(156,163,175,0.1)',
                              color: '#6b7280'
                            }}>
                              No Invoice
                            </span>
                          )}
                        </td>
                      )}
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <button 
                            onClick={() => handleApprove(r.id)} 
                            className="btn btn-success btn-sm" 
                            disabled={!paymentCompleted || approvingId === r.id}
                            title={!paymentCompleted ? 'Payment required before approval' : ''}
                          >
                            <Check size={16} /> Approve
                          </button>
                          <button 
                            onClick={() => { setSelectedId(r.id); setShowRejectModal(true); }} 
                            className="btn btn-danger btn-sm"
                          >
                            <X size={16} /> Reject
                          </button>
                          {type === 'checkin' && !paymentCompleted && (
                            <span title="Payment required" style={{ color: '#ef4444', marginLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <AlertCircle size={14} />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
