import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import {
  LayoutDashboard, Users, DoorOpen, LogIn, FileText, Bell, BarChart3,
  UserCog, ChevronDown, ChevronRight, LogOut, Menu, Settings, User,
  Moon, Sun,
} from 'lucide-react';

interface NavItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  roles?: string[];
  children?: { label: string; path: string; roles?: string[] }[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard size={20} />,
    roles: ['Admin', 'Staff'],
  },
  {
    label: 'Residents',
    icon: <Users size={20} />,
    roles: ['Admin', 'Staff'],
    children: [
      { label: 'All Residents', path: '/residents' },
      { label: 'Create Resident', path: '/residents/create' },
    ],
  },
  {
    label: 'My Profile',
    path: '/my-profile',
    icon: <User size={20} />,
    roles: ['Resident'],
  },
  {
    label: 'Rooms',
    icon: <DoorOpen size={20} />,
    children: [
      { label: 'All Rooms', path: '/rooms', roles: ['Admin', 'Staff'] },
      { label: 'Available Rooms', path: '/rooms/available' },
      { label: 'Create Room', path: '/rooms/create', roles: ['Admin', 'Staff'] },
    ],
  },
  {
    label: 'Check-In/Out',
    icon: <LogIn size={20} />,
    children: [
      { label: 'Request Check-In', path: '/checkin/request', roles: ['Resident'] },
      { label: 'My Status', path: '/checkin/my-status', roles: ['Resident'] },
      { label: 'My History', path: '/checkin/my-history', roles: ['Resident'] },
      { label: 'Pending Check-In', path: '/checkin/pending', roles: ['Admin', 'Staff'] },
      { label: 'Pending Check-Out', path: '/checkout/pending', roles: ['Admin', 'Staff'] },
      { label: 'All Records', path: '/checkin/records', roles: ['Admin', 'Staff'] },
    ],
  },
  {
    label: 'Service Requests',
    icon: <FileText size={20} />,
    children: [
      { label: 'Create Request', path: '/service-requests/create', roles: ['Resident'] },
      { label: 'My Requests', path: '/service-requests/my', roles: ['Resident'] },
      { label: 'All Requests', path: '/service-requests', roles: ['Admin', 'Staff'] },
      { label: 'Pending Requests', path: '/service-requests/pending', roles: ['Admin', 'Staff'] },
    ],
  },
  {
    label: 'Notifications',
    icon: <Bell size={20} />,
    children: [
      { label: 'My Notifications', path: '/notifications/my', roles: ['Resident'] },
      { label: 'Staff Notifications', path: '/notifications/staff', roles: ['Staff'] },
      { label: 'Broadcast', path: '/notifications/broadcast', roles: ['Admin'] },
      { label: 'Send Individual', path: '/notifications/send', roles: ['Admin', 'Staff'] },
      { label: 'Sent History', path: '/notifications/history', roles: ['Admin', 'Staff'] },
    ],
  },
  {
    label: 'Reports',
    icon: <BarChart3 size={20} />,
    roles: ['Admin', 'Staff'],
    children: [
      { label: 'All Reports', path: '/reports' },
      { label: 'Create Report', path: '/reports/create', roles: ['Staff'] },
      { label: 'Pending Reports', path: '/reports/pending', roles: ['Admin'] },
      { label: 'Occupancy', path: '/reports/occupancy' },
      { label: 'Service Usage', path: '/reports/service-usage' },
      { label: 'Revenue', path: '/reports/revenue' },
    ],
  },
  {
    label: 'Staff',
    icon: <UserCog size={20} />,
    children: [
      { label: 'Staff List', path: '/staff', roles: ['Admin'] },
      { label: 'Create Staff', path: '/staff/create', roles: ['Admin'] },
      { label: 'My Profile', path: '/staff/me', roles: ['Staff'] },
    ],
  },
];

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filterByRole = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return user?.userRole ? roles.includes(user.userRole) : false;
  };

  // Build breadcrumbs from path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    path: '/' + pathSegments.slice(0, i + 1).join('/'),
  }));

  const renderSidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="gradient-primary" style={{
            width: 36, height: 36, borderRadius: '0.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '1rem', color: '#fff',
          }}>S</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                SORMS
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Resource Management
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        {navItems.filter((item) => filterByRole(item.roles)).map((item) => {
          const visibleChildren = item.children?.filter((c) => filterByRole(c.roles));

          if (item.path) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          }

          if (visibleChildren && visibleChildren.length > 0) {
            const isExpanded = expandedItems.includes(item.label);
            const isChildActive = visibleChildren.some((c) => location.pathname.startsWith(c.path));

            return (
              <div key={item.label} style={{ marginBottom: '0.25rem' }}>
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={`sidebar-link ${isChildActive ? 'active' : ''}`}
                  style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {item.icon}
                  {sidebarOpen && (
                    <>
                      <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </>
                  )}
                </button>
                {sidebarOpen && isExpanded && (
                  <div style={{ paddingLeft: '2.25rem' }}>
                    {visibleChildren.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
      </nav>

      {/* User card */}
      <div style={{
        padding: '1rem', borderTop: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <div className="gradient-primary" style={{
          width: 32, height: 32, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8125rem', fontWeight: 600, color: '#fff', flexShrink: 0,
        }}>
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        {sidebarOpen && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.username}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              {user?.userRole}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 40, display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar - Desktop */}
      <aside style={{
        width: sidebarOpen ? 'var(--sidebar-width)' : '72px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        transition: 'width 0.2s',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {renderSidebar()}
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{
          height: 56, background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-ghost btn btn-sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={20} />
            </button>
            {/* Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <NavLink to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</NavLink>
              {breadcrumbs.map((b, i) => (
                <span key={b.path} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>/</span>
                  {i === breadcrumbs.length - 1 ? (
                    <span style={{ color: 'var(--text-primary)' }}>{b.label}</span>
                  ) : (
                    <NavLink to={b.path} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{b.label}</NavLink>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NavLink to="/settings/change-password" className="btn btn-ghost btn-sm">
              <Settings size={18} />
            </NavLink>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
