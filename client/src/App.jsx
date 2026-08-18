import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { Login } from './pages/Login';
// ResetPassword page removed - Contact HR/Admin for password reset
// import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Departments } from './pages/Departments';
import { Designations } from './pages/Designations';
import { LeaveTypes } from './pages/LeaveTypes';
import { LeaveRequests } from './pages/LeaveRequests';
import { Holidays } from './pages/Holidays';
import { Reports } from './pages/Reports';
import { DailyReports } from './pages/DailyReports';
import { Notifications } from './pages/Notifications';
import { AuditLogs } from './pages/AuditLogs';
import { Settings } from './pages/Settings';
import { Attendance } from './pages/Attendance';
import { Profile } from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-sm font-bold">
        Loading Enterprise LMS...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* Reset password route removed - Contact HR/Admin for password reset */}
      {/* <Route path="/reset-password" element={<ResetPassword />} /> */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="employees" element={<Employees />} />
        <Route path="departments" element={<Departments />} />
        <Route path="designations" element={<Designations />} />
        <Route path="leave-types" element={<LeaveTypes />} />
        <Route path="leaves" element={<LeaveRequests />} />
        <Route path="holidays" element={<Holidays />} />
        <Route path="reports" element={<Reports />} />
        <Route path="daily-reports" element={<DailyReports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
