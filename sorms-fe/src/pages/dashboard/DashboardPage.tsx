import { useEffect, useState } from 'react';
import { Users, DoorOpen, DoorClosed, Clock, FileText, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import StatsCard from '../../components/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { residentApi } from '../../api/residents';
import { roomApi } from '../../api/rooms';
import { serviceRequestApi } from '../../api/serviceRequests';
import { checkInApi } from '../../api/checkin';
import type { ResidentDto, RoomDto, ServiceRequestDto } from '../../types';

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState<ResidentDto[]>([]);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestDto[]>([]);
  const [pendingCheckIns, setPendingCheckIns] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resRes, roomRes, srRes, ciRes] = await Promise.allSettled([
        residentApi.getAll(),
        roomApi.getAll(),
        serviceRequestApi.getAll(),
        checkInApi.getPendingCheckIn(),
      ]);

      if (resRes.status === 'fulfilled') setResidents(resRes.value.data);
      if (roomRes.status === 'fulfilled') setRooms(roomRes.value.data);
      if (srRes.status === 'fulfilled') setServiceRequests(srRes.value.data);
      if (ciRes.status === 'fulfilled') setPendingCheckIns(ciRes.value.data?.data?.length || 0);
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'Available').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'Occupied').length;
  const pendingSR = serviceRequests.filter((r) => r.status === 'Pending').length;

  // Chart data
  const occupancyData = [
    { name: 'Occupied', value: occupiedRooms },
    { name: 'Available', value: availableRooms },
  ];

  const serviceByType: Record<string, number> = {};
  serviceRequests.forEach((sr) => {
    serviceByType[sr.serviceType] = (serviceByType[sr.serviceType] || 0) + 1;
  });
  const serviceTypeData = Object.entries(serviceByType).map(([name, value]) => ({ name, value }));

  const serviceByStatus: Record<string, number> = {};
  serviceRequests.forEach((sr) => {
    serviceByStatus[sr.status] = (serviceByStatus[sr.status] || 0) + 1;
  });
  const serviceStatusData = Object.entries(serviceByStatus).map(([name, value]) => ({ name, value }));

  // Revenue estimation by rooms
  const monthlyRevenue = rooms
    .filter((r) => r.status === 'Occupied')
    .reduce((sum, r) => sum + (r.monthlyRent || 0), 0);

  const revenueData = [
    { name: 'Current Month', revenue: monthlyRevenue },
    { name: 'Projected', revenue: totalRooms > 0 ? (monthlyRevenue / Math.max(occupiedRooms, 1)) * totalRooms : 0 },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Welcome back! Here's an overview of your system.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatsCard title="Total Residents" value={residents.length} icon={<Users size={22} />} gradient="gradient-primary" />
        <StatsCard title="Total Rooms" value={totalRooms} icon={<DoorOpen size={22} />} gradient="gradient-secondary" />
        <StatsCard title="Available Rooms" value={availableRooms} icon={<DoorClosed size={22} />} gradient="gradient-success" />
        <StatsCard title="Pending Check-Ins" value={pendingCheckIns} icon={<Clock size={22} />} gradient="gradient-warning" />
        <StatsCard title="Service Requests" value={serviceRequests.length} icon={<FileText size={22} />} gradient="gradient-info" subtitle={`${pendingSR} pending`} />
        <StatsCard title="Monthly Revenue" value={`$${monthlyRevenue.toLocaleString()}`} icon={<Bell size={22} />} gradient="gradient-danger" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem' }}>
        {/* Occupancy Pie */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Room Occupancy</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                dataKey="value" paddingAngle={5} label={({ name, value }) => `${name}: ${value}`}>
                {occupancyData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Service Usage Bar */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Service Requests by Type</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={serviceTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Service Status Pie */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Requests by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={serviceStatusData} cx="50%" cy="50%" outerRadius={90}
                dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {serviceStatusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Bar */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
