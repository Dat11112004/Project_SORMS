import { useState } from 'react';
import { reportApi } from '../../api/reports';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BarChart3, RefreshCw } from 'lucide-react';

export default function GeneratedReportPage({ type }: { type: 'occupancy' | 'service-usage' | 'revenue' }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const titleMap = { occupancy: 'Occupancy Report', 'service-usage': 'Service Usage Report', revenue: 'Revenue Report' };
  const fnMap = { occupancy: reportApi.generateOccupancy, 'service-usage': reportApi.generateServiceUsage, revenue: reportApi.generateRevenue };

  const generate = async () => {
    setLoading(true); setError('');
    try {
      const res = await fnMap[type]();
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{titleMap[type]}</h1>
        <button onClick={generate} className="btn btn-primary" disabled={loading}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#f87171' }}>{error}</div>}
      {loading && <LoadingSpinner text="Generating report..." />}
      {data && !loading && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <BarChart3 size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontWeight: 600 }}>Report Data</h3>
          </div>
          <pre style={{
            background: 'var(--bg-primary)', padding: '1rem', borderRadius: '0.5rem',
            fontSize: '0.8125rem', overflow: 'auto', maxHeight: 500,
            color: 'var(--text-secondary)', whiteSpace: 'pre-wrap',
          }}>
            {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      {!data && !loading && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <BarChart3 size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>Click "Generate Report" to view data</p>
        </div>
      )}
    </div>
  );
}
