import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import Layout from './components/Layout';
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

      {/* Client Routes */}
      <Route
        path="/dashboard/client"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout>
              <ClientDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/profile"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout>
              <ClientProfile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/bookings"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout>
              <ClientBookings />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Public search page - accessible without login */}
      <Route
        path="/search"
        element={
          <Layout>
            <SearchTechnicians />
          </Layout>
        }
      />
      <Route
        path="/client/search"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout>
              <SearchTechnicians />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout>
              <CreateBooking />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/bookings/create"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout>
              <CreateBooking />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/bookings/recap"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout>
              <BookingRecapPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/:bookingId"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout>
              <PaymentPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/diagnosis"
        element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout>
              <DiagnosisPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/service/:categoryId"
        element={
          <Layout>
            <ServiceDetailPage />
          </Layout>
        }
      />
      <Route
        path="/technician/view/:id"
        element={
          <Layout>
            <TechnicianViewPage />
          </Layout>
        }
      />

      {/* Technician Routes */}
      <Route
        path="/dashboard/technicien"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <Layout>
              <TechnicianDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/dashboard"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <Layout>
              <TechnicianDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/requests"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <Layout>
              <TechnicianRequests />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/jobs"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <Layout>
              <TechnicianJobs />
            </Layout>
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
            <Layout>
              <SubscriptionPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/subscription/payment"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <Layout>
              <SubscriptionPaymentPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/analytics"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <Layout>
              <TechnicianAnalytics />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/technician/profile"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <Layout>
              <TechnicianProfile />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/technicians"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminTechnicians />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminBookings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout>
              <AdminProfile />
            </Layout>
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

