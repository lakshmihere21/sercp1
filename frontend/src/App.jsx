import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import FeaturesPage from './pages/public/FeaturesPage';
import ContactPage from './pages/public/ContactPage';
import HelplinePage from './pages/public/HelplinePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Citizen Pages
import CitizenDashboard from './pages/citizen/Dashboard';
import SOSPage from './pages/citizen/SOSPage';
import AlertTrackingPage from './pages/citizen/AlertTrackingPage';
import EmergencyContactsPage from './pages/citizen/EmergencyContactsPage';
import CitizenProfilePage from './pages/citizen/ProfilePage';

// Responder Pages
import ResponderDashboard from './pages/responder/Dashboard';
import ResponderMapPage from './pages/responder/MapPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminAlertsPage from './pages/admin/AlertsPage';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminAnalyticsPage from './pages/admin/AnalyticsPage';
import AdminResourcesPage from './pages/admin/ResourcesPage';

// Layout
import AppLayout from './components/layout/AppLayout';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, initialized } = useAuth();
  if (loading || !initialized) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading, initialized } = useAuth();
  if (loading || !initialized) return null;
  if (user) return <Navigate to={`/${user.role}`} replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/features" element={<FeaturesPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/helplines" element={<HelplinePage />} />

    {/* Auth */}
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

    {/* Citizen */}
    <Route path="/citizen" element={<ProtectedRoute roles={['citizen']}><AppLayout /></ProtectedRoute>}>
      <Route index element={<CitizenDashboard />} />
      <Route path="sos" element={<SOSPage />} />
      <Route path="alerts/:id" element={<AlertTrackingPage />} />
      <Route path="contacts" element={<EmergencyContactsPage />} />
      <Route path="profile" element={<CitizenProfilePage />} />
    </Route>

    {/* Responder */}
    <Route path="/responder" element={<ProtectedRoute roles={['responder']}><AppLayout /></ProtectedRoute>}>
      <Route index element={<ResponderDashboard />} />
      <Route path="map" element={<ResponderMapPage />} />
      <Route path="profile" element={<CitizenProfilePage />} />
    </Route>

    {/* Admin */}
    <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AppLayout /></ProtectedRoute>}>
      <Route index element={<AdminDashboard />} />
      <Route path="alerts" element={<AdminAlertsPage />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="analytics" element={<AdminAnalyticsPage />} />
      <Route path="resources" element={<AdminResourcesPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
