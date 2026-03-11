export default function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '3rem', gap: '1rem',
    }}>
      <div style={{
        width: 40, height: 40, border: '3px solid var(--border-color)',
        borderTopColor: 'var(--color-primary)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{text}</p>
    </div>
  );
}
