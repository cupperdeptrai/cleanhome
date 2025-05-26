import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './components/Layout/MainLayout';
import DashboardLayout from './components/Layout/DashboardLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Services from './pages/Services';
import BookingForm from './pages/BookingForm';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import Support from './pages/Support';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminBookings from './pages/admin/Bookings';
import AdminServices from './pages/admin/Services';
import AdminStaff from './pages/admin/Staff';
import AdminUsers from './pages/admin/Users';
import AdminPromotions from './pages/admin/Promotions';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'staff' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'user' 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  // Hiển thị loading nếu đang kiểm tra xác thực
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }
  
  // Kiểm tra xác thực và quyền
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Kiểm tra quyền
  if (requiredRole === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  if (requiredRole === 'staff' && user?.role !== 'staff' && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
      <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
      <Route path="/services" element={<MainLayout><Services /></MainLayout>} />
      <Route path="/support" element={<MainLayout><Support /></MainLayout>} />
      
      {/* Protected User Routes */}
      <Route path="/booking" element={
        <ProtectedRoute>
          <MainLayout><BookingForm /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/bookings" element={
        <ProtectedRoute>
          <MainLayout><Bookings /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout><Profile /></MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <DashboardLayout><AdminDashboard /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/bookings" element={
        <ProtectedRoute requiredRole="admin">
          <DashboardLayout><AdminBookings /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/services" element={
        <ProtectedRoute requiredRole="admin">
          <DashboardLayout><AdminServices /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/staff" element={
        <ProtectedRoute requiredRole="admin">
          <DashboardLayout><AdminStaff /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute requiredRole="admin">
          <DashboardLayout><AdminUsers /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/promotions" element={
        <ProtectedRoute requiredRole="admin">
          <DashboardLayout><AdminPromotions /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute requiredRole="admin">
          <DashboardLayout><AdminReports /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute requiredRole="admin">
          <DashboardLayout><AdminSettings /></DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
