import { useEffect, useState } from 'react';
import { checkInApi } from '../../api/checkin';
import type { CheckInRecordDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { Search } from 'lucide-react';

export default function CheckInRecordsPage() {
  const [records, setRecords] = useState<CheckInRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    checkInApi.getAll().then((r) => setRecords(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = records.filter((r) =>
    r.residentName?.toLowerCase().includes(search.toLowerCase()) ||
    r.roomNumber?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>All Check-In Records</h1>
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search..." style={{ paddingLeft: '2.25rem' }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? <EmptyState message="No records found" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Resident</th><th>Room</th><th>Request</th><th>Expected Dates</th><th>Check-In</th><th>Check-Out</th><th>Status</th><th>Approved By</th></tr></thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.residentName}</td>
                    <td>{r.roomNumber}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{new Date(r.requestTime).toLocaleString()}</td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {r.expectedCheckInDate ? new Date(r.expectedCheckInDate).toLocaleDateString() : '—'} <br/>
                      to {r.expectedCheckOutDate ? new Date(r.expectedCheckOutDate).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{r.checkInTime ? new Date(r.checkInTime).toLocaleString() : '—'}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleString() : '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{r.approvedByName || '—'}</td>
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
