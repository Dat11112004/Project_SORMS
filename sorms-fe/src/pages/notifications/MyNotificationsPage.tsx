import { useEffect, useState } from 'react';
import { notificationApi } from '../../api/notifications';
import type { NotificationDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Bell, CheckCircle } from 'lucide-react';

export default function MyNotificationsPage({ isStaff = false }: { isStaff?: boolean }) {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [isStaff]);

  const load = async () => {
    try {
      const res = isStaff ? await notificationApi.getStaffNotifications() : await notificationApi.getMyNotifications();
      setNotifications(res.data);
    } catch { /* noop */ } finally { setLoading(false); }
  };

  const markRead = async (id: number) => {
    try { await notificationApi.markAsRead(id); load(); } catch { /* noop */ }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        {isStaff ? 'Staff' : 'My'} Notifications
      </h1>
      {notifications.length === 0 ? <EmptyState message="No notifications" /> : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {notifications.map((n) => (
            <div key={n.id} className="glass-card" style={{
              padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              opacity: n.isRead ? 0.6 : 1, borderLeft: n.isRead ? 'none' : '3px solid var(--color-primary)',
            }}>
              <Bell size={18} style={{ color: n.isRead ? 'var(--text-muted)' : 'var(--color-primary)', marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem' }}>{n.message}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</span>
                  <span className={`badge ${n.type === 'Broadcast' ? 'badge-info' : 'badge-default'}`}>{n.type}</span>
                  {n.targetRole && <span className="badge badge-default">{n.targetRole}</span>}
                </div>
              </div>
              {!n.isRead && (
                <button onClick={() => markRead(n.id)} className="btn btn-ghost btn-sm" title="Mark as read">
                  <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
