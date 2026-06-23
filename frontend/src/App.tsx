import React, { useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./hooks/context/AuthProvider";
import { useAuthContext } from "./hooks/context/AuthContext";
import Layout from "./components/Layout";
import SignUp from "./auth/SignUp";
import SignIn from "./auth/SignIn";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ComplaintForm from "./pages/ComplaintForm";
import ComplaintDetail from "./pages/ComplaintDetail";
import PublicTracker from "./pages/PublicTracker";

// Protected Route
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/signin" replace />;
};

// Admin Route
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) return null;

  return user?.role === "admin" ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

// Public Route
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) return null;

  return !user ? (
    children
  ) : user.role === "admin" ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

function AppContent() {
  useEffect(() => {
    if (!localStorage.getItem("civic_complaints")) return;
  }, []);

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />
      <Route
        path="/signin"
        element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        }
      />

      {/* Protected Layout (shared) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* USER */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="submit" element={<ComplaintForm />} />
        <Route path="complaint/:id" element={<ComplaintDetail />} />
        <Route path="tracker" element={<PublicTracker />} />

        {/* ADMIN (nested inside layout) */}
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
