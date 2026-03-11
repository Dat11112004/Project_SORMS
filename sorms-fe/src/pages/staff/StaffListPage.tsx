import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { staffApi } from '../../api/staff';
import type { StaffDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Plus, Eye, Pencil, Trash2, Search } from 'lucide-react';

export default function StaffListPage() {
  const [staff, setStaff] = useState<StaffDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const res = await staffApi.getAll(); setStaff(res.data); } catch { /* noop */ } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this staff member?')) return;
    try { await staffApi.delete(id); load(); } catch { alert('Failed.'); }
  };

  const filtered = staff.filter((s) =>
    s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Staff Management</h1>
        <Link to="/staff/create" className="btn btn-primary"><Plus size={18} /> Add Staff</Link>
      </div>
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search..." style={{ paddingLeft: '2.25rem' }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? <EmptyState message="No staff found" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.fullName}</td>
                    <td>{s.email}</td>
                    <td>{s.phone}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <Link to={`/staff/${s.id}`} className="btn btn-ghost btn-sm"><Eye size={16} /></Link>
                        <Link to={`/staff/${s.id}/edit`} className="btn btn-ghost btn-sm"><Pencil size={16} /></Link>
                        <button onClick={() => handleDelete(s.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }}><Trash2 size={16} /></button>
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
