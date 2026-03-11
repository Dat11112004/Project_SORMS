import { useEffect, useState } from 'react';
import { checkInApi } from '../../api/checkin';
import type { CheckInRecordDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

export default function CheckInHistoryPage() {
  const [records, setRecords] = useState<CheckInRecordDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkInApi.getMyHistory().then((r) => setRecords(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>My Check-In History</h1>
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        {records.length === 0 ? <EmptyState message="No history found" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Room</th><th>Request Time</th><th>Check-In</th><th>Check-Out</th><th>Status</th></tr></thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.roomNumber}</td>
                    <td>{new Date(r.requestTime).toLocaleString()}</td>
                    <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleString() : '—'}</td>
                    <td>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleString() : '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
