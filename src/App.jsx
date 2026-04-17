import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import PatientLogin        from "./pages/auth/PatientLogin";
import AdminLogin          from "./pages/auth/AdminLogin";

import PatientDashboard    from "./pages/patient/Dashboard";
import BookAppointment     from "./pages/patient/BookAppointment";
import MyAppointments      from "./pages/patient/MyAppointments";
import TreatmentHistory    from "./pages/patient/TreatmentHistory";
import PatientProfile      from "./pages/patient/Profile";

import AdminDashboard      from "./pages/admin/Dashboard";
import AdminAppointments   from "./pages/admin/Appointments";
import AdminPatients       from "./pages/admin/Patients";
import AdminRevenue        from "./pages/admin/Revenue";
import AdminBlogs          from "./pages/admin/Blogs";
import AdminTestimonials   from "./pages/admin/Testimonials";
import AdminClinicSettings from "./pages/admin/ClinicSettings";

function PatientRoute({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user || role !== "patient") return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user || role !== "admin") return <Navigate to="/admin/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (user && role === "patient") return <Navigate to="/dashboard"    replace />;
  if (user && role === "admin")   return <Navigate to="/admin"        replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"            element={<Navigate to="/login" replace />} />
      <Route path="/login"       element={<PublicRoute><PatientLogin /></PublicRoute>} />
      <Route path="/admin/login" element={<PublicRoute><AdminLogin   /></PublicRoute>} />

      <Route path="/dashboard"              element={<PatientRoute><PatientDashboard /></PatientRoute>} />
      <Route path="/dashboard/book"         element={<PatientRoute><BookAppointment  /></PatientRoute>} />
      <Route path="/dashboard/appointments" element={<PatientRoute><MyAppointments   /></PatientRoute>} />
      <Route path="/dashboard/history"      element={<PatientRoute><TreatmentHistory /></PatientRoute>} />
      <Route path="/dashboard/profile"      element={<PatientRoute><PatientProfile   /></PatientRoute>} />

      <Route path="/admin"               element={<AdminRoute><AdminDashboard      /></AdminRoute>} />
      <Route path="/admin/appointments"  element={<AdminRoute><AdminAppointments   /></AdminRoute>} />
      <Route path="/admin/patients"      element={<AdminRoute><AdminPatients       /></AdminRoute>} />
      <Route path="/admin/revenue"       element={<AdminRoute><AdminRevenue        /></AdminRoute>} />
      <Route path="/admin/blogs"         element={<AdminRoute><AdminBlogs          /></AdminRoute>} />
      <Route path="/admin/testimonials"  element={<AdminRoute><AdminTestimonials   /></AdminRoute>} />
      <Route path="/admin/settings"      element={<AdminRoute><AdminClinicSettings /></AdminRoute>} />
      <Route path="/admin/profile"       element={<AdminRoute><PatientProfile      /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
