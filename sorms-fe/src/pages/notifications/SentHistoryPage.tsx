import { useEffect, useState } from 'react';
import { notificationApi } from '../../api/notifications';
import type { NotificationDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function SentHistoryPage() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationApi.getSentHistory().then((r) => setNotifications(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Sent Notification History</h1>
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        {notifications.length === 0 ? <EmptyState message="No notifications sent" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Message</th><th>Type</th><th>Target</th><th>Created</th></tr></thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n.id}>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</td>
                    <td><span className={`badge ${n.type === 'Broadcast' ? 'badge-info' : 'badge-default'}`}>{n.type}</span></td>
                    <td>{n.targetRole || `Resident #${n.residentId}`}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{new Date(n.createdAt).toLocaleString()}</td>
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
