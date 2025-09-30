import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import TherapistPending from './pages/TherapistPending.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import DashboardUser from './pages/DashboardUser.jsx';
import DashboardTherapist from './pages/DashboardTherapist.jsx';
import DashboardAdmin from './pages/DashboardAdmin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Posts from './pages/Posts.jsx';
import Journals from './pages/Journals.jsx';
import Therapists from './pages/Therapists.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  const location = useLocation();
  const hideNavbar = ['/login', '/signup', '/therapist-pending'].includes(location.pathname);

  return (
    <div>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/therapist-pending" element={<TherapistPending />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <Posts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/journals"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Journals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/therapists"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Therapists />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/user"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <DashboardUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/therapist"
          element={
            <ProtectedRoute allowedRoles={["therapist"]}>
              <DashboardTherapist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
