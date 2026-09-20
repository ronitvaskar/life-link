import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Heart,
  ShieldCheck,
  ArrowRight,
  LogOut,
  User,
  Activity,
  Droplets,
} from "lucide-react";

function Dashboard() {
  const { user, logout } = useAuth();

  const getDashboardPath = () => {
    switch (user?.role) {
      case "USER":
        return "/user/dashboard";
      case "BLOOD_BANK":
        return "/blood-bank/dashboard";
      case "ADMIN":
        return "/admin/dashboard";
      default:
        return "/";
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "USER":
        return "Life Link User";
      case "BLOOD_BANK":
        return "Blood Bank";
      case "ADMIN":
        return "System Administrator";
      default:
        return "User";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-sm">
                <Droplets className="w-6 h-6 text-white fill-white" />
              </div>

              <div>
                <h1 className="font-bold text-gray-900 leading-none">
                  Life Link
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Blood Donation & Blood Request Management
                </p>
              </div>
            </Link>

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-red-700 via-red-600 to-rose-600 shadow-xl">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-black/10 blur-3xl" />

          <div className="relative p-6 sm:p-8 lg:p-10 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-sm text-red-50">
                  <Heart className="w-4 h-4 fill-white" />
                  Life Link Platform
                </div>

                <h2 className="mt-5 text-3xl sm:text-4xl font-bold">
                  Welcome, {user?.name || "User"}!
                </h2>

                <p className="mt-3 text-red-100 text-base sm:text-lg max-w-xl leading-relaxed">
                  You are successfully signed in to the Life Link Blood
                  Donation & Blood Request Management System.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-700">
                    <ShieldCheck className="w-4 h-4" />
                    {getRoleLabel()}
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-medium text-white">
                    <Activity className="w-4 h-4" />
                    Account Active
                  </div>
                </div>
              </div>

              {/* Icon */}
              <div className="hidden sm:flex w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-white/10 border border-white/20 items-center justify-center shrink-0">
                <Heart className="w-16 h-16 lg:w-20 lg:h-20 text-white fill-white" />
              </div>
            </div>
          </div>
        </section>

        {/* Account Information */}
        <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                <User className="w-5 h-5 text-red-600" />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-gray-500">
                  Account Name
                </p>

                <p className="font-semibold text-gray-900 truncate">
                  {user?.name || "User"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Access Role
                </p>

                <p className="font-semibold text-gray-900">
                  {getRoleLabel()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Account Status
                </p>

                <p className="font-semibold text-green-600">
                  Active
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Action */}
        <section className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Continue to your dashboard
              </h3>

              <p className="mt-2 text-gray-600">
                Access the tools and features available for your account.
              </p>
            </div>

            <Link
              to={getDashboardPath()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-sm"
            >
              Open Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Security Notice */}
        <section className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
          <div className="flex gap-3">
            <ShieldCheck className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />

            <div>
              <h3 className="font-semibold text-red-800">
                Secure Access
              </h3>

              <p className="mt-1 text-sm text-red-700 leading-6">
                Your account is protected by secure authentication and
                role-based access controls. Only features authorized for your
                role are available.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-gray-400">
          Life Link • Blood Donation & Blood Request Management System
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;