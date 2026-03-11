import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { roomApi } from '../../api/rooms';
import type { RoomDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { Plus, Eye, Pencil, Trash2, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function RoomListPage({ availableOnly = false }: { availableOnly?: boolean }) {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { hasRole } = useAuthStore();

  useEffect(() => { load(); }, [availableOnly]);

  const load = async () => {
    try {
      const res = availableOnly ? await roomApi.getAvailable() : await roomApi.getAll();
      setRooms(res.data);
    } catch { /* noop */ } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this room?')) return;
    try { await roomApi.delete(id); load(); } catch { alert('Failed to delete.'); }
  };

  const filtered = rooms.filter((r) =>
    r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
    (r.type || r.roomType || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{availableOnly ? 'Available Rooms' : 'All Rooms'}</h1>
        {hasRole('Admin', 'Staff') && <Link to="/rooms/create" className="btn btn-primary"><Plus size={18} /> Add Room</Link>}
      </div>
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
          <input className="form-input" placeholder="Search rooms..." style={{ paddingLeft: '2.25rem' }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? <EmptyState message="No rooms found" /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead><tr><th>Image</th><th>Room</th><th>Type</th><th>Floor</th><th>Area</th><th>Rent</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.imageUrl ? (
                        <img 
                          src={`http://localhost:5183${r.imageUrl}`} 
                          alt={`Room ${r.roomNumber}`}
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '0.5rem' }}
                        />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: '0.5rem', backgroundColor: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          N/A
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 500 }}>{r.roomNumber}</td>
                    <td>{r.type || r.roomType}</td>
                    <td>{r.floor}</td>
                    <td>{r.area} m²</td>
                    <td>${r.monthlyRent?.toLocaleString()}</td>
                    <td><StatusBadge status={r.isOccupied ? 'Inactive' : 'Active'} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <Link to={`/rooms/${r.id}`} className="btn btn-ghost btn-sm"><Eye size={16} /></Link>
                        {hasRole('Admin', 'Staff') && <Link to={`/rooms/${r.id}/edit`} className="btn btn-ghost btn-sm"><Pencil size={16} /></Link>}
                        {hasRole('Admin') && <button onClick={() => handleDelete(r.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }}><Trash2 size={16} /></button>}
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
