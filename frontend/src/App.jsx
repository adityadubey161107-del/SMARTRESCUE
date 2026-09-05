import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loading } from './components/Loading';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PatientDashboard } from './pages/PatientDashboard';
import { EmergencyRequest } from './pages/EmergencyRequest';
import { Tracking } from './pages/Tracking';
import { DriverDashboard } from './pages/DriverDashboard';
import { HospitalDashboard } from './pages/HospitalDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { GreenCorridor } from './pages/GreenCorridor';

// Role Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, getDashboardRoute } = useAuth();

  if (loading) return <Loading text="Authenticating user session..." />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardRoute(user.role)} replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient/emergency" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <EmergencyRequest />
            </ProtectedRoute>
          } />
          <Route path="/patient/tracking/:emergencyId" element={
            <ProtectedRoute allowedRoles={['PATIENT', 'ADMIN', 'DRIVER', 'HOSPITAL']}>
              <Tracking />
            </ProtectedRoute>
          } />

          {/* Driver Routes */}
          <Route path="/driver/dashboard" element={
            <ProtectedRoute allowedRoles={['DRIVER']}>
              <DriverDashboard />
            </ProtectedRoute>
          } />

          {/* Hospital Routes */}
          <Route path="/hospital/dashboard" element={
            <ProtectedRoute allowedRoles={['HOSPITAL']}>
              <HospitalDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/green-corridor" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <GreenCorridor />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
