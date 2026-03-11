import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { residentApi } from '../../api/residents';
import type { ResidentDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { Plus, Eye, Pencil, Trash2, Search } from 'lucide-react';

export default function ResidentListPage() {
  const [residents, setResidents] = useState<ResidentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await residentApi.getAll();
      setResidents(res.data);
    } catch { /* noop */ } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resident?')) return;
    try { await residentApi.delete(id); load(); } catch { alert('Failed to delete.'); }
  };

  const filtered = residents.filter((r) =>
    r.fullName.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase()) ||
    r.phone?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Residents</h1>
        <Link to="/residents/create" className="btn btn-primary"><Plus size={18} /> Add Resident</Link>
      </div>
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search by name, email, phone..."
            style={{ paddingLeft: '2.25rem' }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? <EmptyState message="No residents found" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Phone</th><th>Room</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.fullName}</td>
                    <td>{r.email}</td>
                    <td>{r.phone || r.phoneNumber}</td>
                    <td>{r.roomNumber || '—'}</td>
                    <td><StatusBadge status={r.isActive ? 'Active' : 'Inactive'} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <Link to={`/residents/${r.id}`} className="btn btn-ghost btn-sm"><Eye size={16} /></Link>
                        <Link to={`/residents/${r.id}/edit`} className="btn btn-ghost btn-sm"><Pencil size={16} /></Link>
                        <button onClick={() => handleDelete(r.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
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
