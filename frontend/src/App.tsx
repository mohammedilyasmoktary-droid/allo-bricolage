import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import Layout from './components/Layout';
import DashboardLayout from './components/DashboardLayout';
import ConditionalLayout from './components/ConditionalLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ClientProfile from './pages/client/ClientProfile';
import ClientBookings from './pages/client/ClientBookings';
import ClientDashboard from './pages/client/ClientDashboard';
import SearchTechnicians from './pages/client/SearchTechnicians';
import CreateBooking from './pages/client/CreateBooking';
import PaymentPage from './pages/client/PaymentPage';
import BookingRecapPage from './pages/client/BookingRecapPage';
import DiagnosisPage from './pages/client/DiagnosisPage';
import ServiceDetailPage from './pages/client/ServiceDetailPage';
import TechnicianViewPage from './pages/client/TechnicianViewPage';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import TechnicianRequests from './pages/technician/TechnicianRequests';
import TechnicianJobs from './pages/technician/TechnicianJobs';
import TechnicianProfile from './pages/technician/TechnicianProfile';
import TechnicianAnalytics from './pages/technician/TechnicianAnalytics';
import SubscriptionPage from './pages/technician/SubscriptionPage';
import TechnicianSubscriptionPage from './pages/technician/TechnicianSubscriptionPage';
import TechnicianRegisterPage from './pages/technician/TechnicianRegisterPage';
import SubscriptionPaymentPage from './pages/technician/SubscriptionPaymentPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTechnicians from './pages/admin/AdminTechnicians';
import AdminBookings from './pages/admin/AdminBookings';
import AdminProfile from './pages/admin/AdminProfile';
import UnifiedDashboard from './pages/UnifiedDashboard';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
        <CircularProgress sx={{ color: '#F4C542' }} size={50} />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />

      {/* Unified Dashboard - Main dashboard after login */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UnifiedDashboard />
          </ProtectedRoute>
        }
      />

      {/* Client Routes */}
      <Route
        path="/dashboard/client"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <DashboardLayout>
              <ClientDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/profile"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <DashboardLayout>
              <ClientProfile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/bookings"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <DashboardLayout>
              <ClientBookings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      {/* Messages and Notifications */}
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      {/* Public search page - accessible without login, but uses DashboardLayout when logged in */}
      <Route
        path="/search"
        element={
          <ConditionalLayout>
            <SearchTechnicians />
          </ConditionalLayout>
        }
      />
      <Route
        path="/client/search"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <DashboardLayout>
              <SearchTechnicians />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <DashboardLayout>
              <CreateBooking />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/bookings/create"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <DashboardLayout>
              <CreateBooking />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/bookings/recap"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <DashboardLayout>
              <BookingRecapPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/:bookingId"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <DashboardLayout>
              <PaymentPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/diagnosis"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <DashboardLayout>
              <DiagnosisPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/service/:categoryId"
        element={
          <ConditionalLayout>
            <ServiceDetailPage />
          </ConditionalLayout>
        }
      />
      <Route
        path="/technician/view/:id"
        element={
          <ConditionalLayout>
            <TechnicianViewPage />
          </ConditionalLayout>
        }
      />

      {/* Technician Routes */}
      <Route
        path="/dashboard/technicien"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <DashboardLayout>
              <TechnicianDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/dashboard"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <DashboardLayout>
              <TechnicianDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/requests"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <DashboardLayout>
              <TechnicianRequests />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/jobs"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <DashboardLayout>
              <TechnicianJobs />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technicien/abonnement"
        element={
          <Layout>
            <TechnicianSubscriptionPage />
          </Layout>
        }
      />
      <Route
        path="/technicien/register"
        element={
          <Layout>
            <TechnicianRegisterPage />
          </Layout>
        }
      />
      <Route
        path="/technician/subscription"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <DashboardLayout>
              <SubscriptionPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/subscription/payment"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <DashboardLayout>
              <SubscriptionPaymentPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/analytics"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <DashboardLayout>
              <TechnicianAnalytics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/profile"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <DashboardLayout>
              <TechnicianProfile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/technicians"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout>
              <AdminTechnicians />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout>
              <AdminBookings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout>
              <AdminProfile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all route for 404 */}
      <Route
        path="*"
        element={
          <Layout>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#032B5A', mb: 2 }}>
                404 - Page non trouvée
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                La page que vous recherchez n'existe pas.
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.location.href = '/'}
                sx={{
                  bgcolor: '#032B5A',
                  '&:hover': { bgcolor: '#021d3f' },
                  textTransform: 'none',
                }}
              >
                Retour à l'accueil
              </Button>
            </Box>
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;

