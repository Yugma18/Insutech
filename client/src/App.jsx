import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { pingVisit } from './services/leadService.js';
import { AuthProvider } from './context/AuthContext.jsx';

// Public pages
import Home from './pages/Home';
import Plans from './pages/Plans';
import PlanDetail from './pages/PlanDetail';
import Compare from './pages/Compare';
import Recommend from './pages/Recommend';
import GetQuote from './pages/GetQuote';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import NotFound from './pages/NotFound';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageInsurers from './pages/admin/ManageInsurers';
import ManagePlans from './pages/admin/ManagePlans';
import ManageLeads from './pages/admin/ManageLeads';
import ManagePolicies from './pages/admin/ManagePolicies';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CompareBar from './components/comparison/CompareBar';
import PhoneCaptureBar from './components/capture/PhoneCaptureBar';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  return token ? children : <Navigate to="/admin/login" replace />;
}

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CompareBar />
      <PhoneCaptureBar />
    </div>
  );
}

function VisitTracker() {
  useEffect(() => {
    // Only ping once per browser session
    if (sessionStorage.getItem('visit_counted')) return;

    try {
      const user = JSON.parse(localStorage.getItem('insutech_user') || 'null');
      if (user?.phone) {
        pingVisit(user.phone).catch(() => {}); // silent — never block the UI
        sessionStorage.setItem('visit_counted', '1');
      }
    } catch { /* ignore parse errors */ }
  }, []);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <VisitTracker />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/plans" element={<PublicLayout><Plans /></PublicLayout>} />
          <Route path="/plans/:id" element={<PublicLayout><PlanDetail /></PublicLayout>} />
          <Route path="/compare" element={<PublicLayout><Compare /></PublicLayout>} />
          <Route path="/recommend" element={<PublicLayout><Recommend /></PublicLayout>} />
          <Route path="/get-quote" element={<PublicLayout><GetQuote /></PublicLayout>} />

          {/* User auth + account */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/insurers" element={<ProtectedRoute><ManageInsurers /></ProtectedRoute>} />
          <Route path="/admin/plans" element={<ProtectedRoute><ManagePlans /></ProtectedRoute>} />
          <Route path="/admin/leads" element={<ProtectedRoute><ManageLeads /></ProtectedRoute>} />
          <Route path="/admin/policies" element={<ProtectedRoute><ManagePolicies /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
