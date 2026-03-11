import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'No data available' }: { message?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '3rem', gap: '1rem',
    }}>
      <Inbox size={48} style={{ color: 'var(--text-muted)' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{message}</p>
    </div>
  );
}
