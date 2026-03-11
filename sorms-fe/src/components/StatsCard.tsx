import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  gradient: string;
  subtitle?: string;
}

export default function StatsCard({ title, value, icon, gradient, subtitle }: StatsCardProps) {
  return (
    <div className="glass-card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{title}</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
          {subtitle && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{subtitle}</p>
          )}
        </div>
        <div className={gradient} style={{
          width: 44, height: 44, borderRadius: '0.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
