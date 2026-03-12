import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import ChangePasswordPage from '../pages/auth/ChangePasswordPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ResidentListPage from '../pages/residents/ResidentListPage';
import ResidentDetailPage from '../pages/residents/ResidentDetailPage';
import ResidentFormPage from '../pages/residents/ResidentFormPage';
import MyProfilePage from '../pages/residents/MyProfilePage';
import RoomListPage from '../pages/rooms/RoomListPage';
import RoomDetailPage from '../pages/rooms/RoomDetailPage';
import RoomFormPage from '../pages/rooms/RoomFormPage';
import RequestCheckInPage from '../pages/checkin/RequestCheckInPage';
import CheckInStatusPage from '../pages/checkin/CheckInStatusPage';
import CheckInHistoryPage from '../pages/checkin/CheckInHistoryPage';
import PendingCheckInPage from '../pages/checkin/PendingCheckInPage';
import CheckInRecordsPage from '../pages/checkin/CheckInRecordsPage';
import CreateServiceRequestPage from '../pages/service-requests/CreateServiceRequestPage';
import ServiceRequestListPage from '../pages/service-requests/ServiceRequestListPage';
import MyNotificationsPage from '../pages/notifications/MyNotificationsPage';
import BroadcastNotificationPage from '../pages/notifications/BroadcastNotificationPage';
import SendNotificationPage from '../pages/notifications/SendNotificationPage';
import SentHistoryPage from '../pages/notifications/SentHistoryPage';
import ReportListPage from '../pages/reports/ReportListPage';
import CreateReportPage from '../pages/reports/CreateReportPage';
import GeneratedReportPage from '../pages/reports/GeneratedReportPage';
import StaffListPage from '../pages/staff/StaffListPage';
import StaffDetailPage from '../pages/staff/StaffDetailPage';
import StaffFormPage from '../pages/staff/StaffFormPage';
import StaffProfilePage from '../pages/staff/StaffProfilePage';
import InvoicesPage from '../pages/invoices/InvoicesPage';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuth = useAuthStore(s => s.isAuthenticated);
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleRoute({ children, roles }: { children: ReactNode; roles: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !roles.includes(user.userRole)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function AppRouter() {
  const isAuth = useAuthStore(s => s.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Dashboard Routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings/change-password" element={<ChangePasswordPage />} />

          {/* Residents */}
          <Route path="/residents" element={<RoleRoute roles={['Admin','Staff']}><ResidentListPage /></RoleRoute>} />
          <Route path="/residents/create" element={<RoleRoute roles={['Admin','Staff']}><ResidentFormPage /></RoleRoute>} />
          <Route path="/residents/:id" element={<RoleRoute roles={['Admin','Staff']}><ResidentDetailPage /></RoleRoute>} />
          <Route path="/residents/:id/edit" element={<RoleRoute roles={['Admin','Staff']}><ResidentFormPage /></RoleRoute>} />
          <Route path="/my-profile" element={<RoleRoute roles={['Resident']}><MyProfilePage /></RoleRoute>} />
          <Route path="/resident/invoices" element={<RoleRoute roles={['Resident']}><InvoicesPage /></RoleRoute>} />

          {/* Rooms */}
          <Route path="/rooms" element={<RoomListPage />} />
          <Route path="/rooms/available" element={<RoomListPage availableOnly />} />
          <Route path="/rooms/create" element={<RoleRoute roles={['Admin','Staff']}><RoomFormPage /></RoleRoute>} />
          <Route path="/rooms/:id" element={<RoomDetailPage />} />
          <Route path="/rooms/:id/edit" element={<RoleRoute roles={['Admin','Staff']}><RoomFormPage /></RoleRoute>} />

          {/* Check-In */}
          <Route path="/checkin/request" element={<RoleRoute roles={['Resident']}><RequestCheckInPage /></RoleRoute>} />
          <Route path="/checkin/my-status" element={<RoleRoute roles={['Resident']}><CheckInStatusPage /></RoleRoute>} />
          <Route path="/checkin/my-history" element={<RoleRoute roles={['Resident']}><CheckInHistoryPage /></RoleRoute>} />
          <Route path="/checkin/pending" element={<RoleRoute roles={['Admin','Staff']}><PendingCheckInPage type="checkin" /></RoleRoute>} />
          <Route path="/checkout/pending" element={<RoleRoute roles={['Admin','Staff']}><PendingCheckInPage type="checkout" /></RoleRoute>} />
          <Route path="/checkin/records" element={<RoleRoute roles={['Admin','Staff']}><CheckInRecordsPage /></RoleRoute>} />

          {/* Service Requests */}
          <Route path="/service-requests/create" element={<RoleRoute roles={['Resident']}><CreateServiceRequestPage /></RoleRoute>} />
          <Route path="/service-requests/my" element={<RoleRoute roles={['Resident']}><ServiceRequestListPage myOnly /></RoleRoute>} />
          <Route path="/service-requests" element={<RoleRoute roles={['Admin','Staff']}><ServiceRequestListPage /></RoleRoute>} />
          <Route path="/service-requests/pending" element={<RoleRoute roles={['Admin','Staff']}><ServiceRequestListPage pendingOnly /></RoleRoute>} />

          {/* Notifications */}
          <Route path="/notifications/my" element={<RoleRoute roles={['Resident']}><MyNotificationsPage /></RoleRoute>} />
          <Route path="/notifications/staff" element={<RoleRoute roles={['Staff']}><MyNotificationsPage isStaff /></RoleRoute>} />
          <Route path="/notifications/broadcast" element={<RoleRoute roles={['Admin']}><BroadcastNotificationPage /></RoleRoute>} />
          <Route path="/notifications/send" element={<RoleRoute roles={['Admin','Staff']}><SendNotificationPage /></RoleRoute>} />
          <Route path="/notifications/history" element={<RoleRoute roles={['Admin','Staff']}><SentHistoryPage /></RoleRoute>} />

          {/* Reports */}
          <Route path="/reports" element={<RoleRoute roles={['Admin','Staff']}><ReportListPage /></RoleRoute>} />
          <Route path="/reports/create" element={<RoleRoute roles={['Staff']}><CreateReportPage /></RoleRoute>} />
          <Route path="/reports/pending" element={<RoleRoute roles={['Admin']}><ReportListPage pendingOnly /></RoleRoute>} />
          <Route path="/reports/occupancy" element={<RoleRoute roles={['Admin','Staff']}><GeneratedReportPage type="occupancy" /></RoleRoute>} />
          <Route path="/reports/service-usage" element={<RoleRoute roles={['Admin','Staff']}><GeneratedReportPage type="service-usage" /></RoleRoute>} />
          <Route path="/reports/revenue" element={<RoleRoute roles={['Admin','Staff']}><GeneratedReportPage type="revenue" /></RoleRoute>} />

          {/* Staff */}
          <Route path="/staff" element={<RoleRoute roles={['Admin']}><StaffListPage /></RoleRoute>} />
          <Route path="/staff/create" element={<RoleRoute roles={['Admin']}><StaffFormPage isCreate /></RoleRoute>} />
          <Route path="/staff/:id" element={<RoleRoute roles={['Admin']}><StaffDetailPage /></RoleRoute>} />
          <Route path="/staff/:id/edit" element={<RoleRoute roles={['Admin']}><StaffFormPage /></RoleRoute>} />
          <Route path="/staff/me" element={<RoleRoute roles={['Staff']}><StaffProfilePage /></RoleRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={isAuth ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
