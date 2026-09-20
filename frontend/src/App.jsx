import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

/* ============================================================
   USER
============================================================ */

import UserDashboard from "./pages/user/UserDashboard";
import UserProfile from "./pages/user/UserProfile";
import Availability from "./pages/user/Availability";
import CreateBloodRequest from "./pages/user/CreateBloodRequest";
import MyRequests from "./pages/user/MyRequests";
import RequestDetails from "./pages/user/RequestDetails";
import Notifications from "./pages/user/Notifications";

/* ============================================================
   BLOOD BANK
============================================================ */

import BloodBankDashboard from "./pages/bloodbank/BloodBankDashboard";
import Inventory from "./pages/bloodbank/Inventory";
import BloodBankRequests from "./pages/bloodbank/Requests";
import BloodBankDonations from "./pages/bloodbank/Donations";
import BloodBankProfile from "./pages/bloodbank/Profile";
import BloodBankNotifications from "./pages/bloodbank/Notifications";

/* ============================================================
   ADMIN
============================================================ */

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/Users";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import AdminAuditLogs from "./pages/admin/AuditLogs";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ====================================================
              PUBLIC ROUTES
          ==================================================== */}

          <Route path="/" element={<Home />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* ====================================================
              USER ROUTES
              One USER account can donate AND request blood.
          ==================================================== */}

          <Route
            element={
              <ProtectedRoute allowedRoles={["USER"]} />
            }
          >
            <Route
              path="/user/dashboard"
              element={<UserDashboard />}
            />

            <Route
              path="/user/profile"
              element={<UserProfile />}
            />

            <Route
              path="/user/availability"
              element={<Availability />}
            />

            <Route
              path="/user/create-request"
              element={<CreateBloodRequest />}
            />

            <Route
              path="/user/requests"
              element={<MyRequests />}
            />

            <Route
              path="/user/requests/:request_id"
              element={<RequestDetails />}
            />

            <Route
              path="/user/notifications"
              element={<Notifications />}
            />
          </Route>

          {/* ====================================================
              BLOOD BANK ROUTES
          ==================================================== */}

          <Route
            element={
              <ProtectedRoute allowedRoles={["BLOOD_BANK"]} />
            }
          >
            <Route
              path="/blood-bank/dashboard"
              element={<BloodBankDashboard />}
            />

            <Route
              path="/blood-bank/inventory"
              element={<Inventory />}
            />

            <Route
              path="/blood-bank/requests"
              element={<BloodBankRequests />}
            />

            <Route
              path="/blood-bank/donations"
              element={<BloodBankDonations />}
            />

            <Route
              path="/blood-bank/profile"
              element={<BloodBankProfile />}
            />

            <Route
              path="/blood-bank/notifications"
              element={<BloodBankNotifications />}
            />
          </Route>

          {/* ====================================================
              ADMIN ROUTES
          ==================================================== */}

          <Route
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]} />
            }
          >
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/users"
              element={<AdminUsers />}
            />

            <Route
              path="/admin/reports"
              element={<AdminReports />}
            />

            <Route
              path="/admin/settings"
              element={<AdminSettings />}
            />

            <Route
              path="/admin/audit-logs"
              element={<AdminAuditLogs />}
            />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;