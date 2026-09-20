import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === "USER") {
      return <Navigate to="/user/dashboard" replace />;
    }

    if (user.role === "BLOOD_BANK") {
      return <Navigate to="/blood-bank/dashboard" replace />;
    }

    if (user.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;