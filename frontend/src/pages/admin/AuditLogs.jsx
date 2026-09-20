import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  FileText,
  User,
  Clock,
  Activity,
  AlertCircle,
  Database,
  LogIn,
  UserPlus,
  HeartPulse,
  ClipboardList,
  Settings,
  Users,
  Package,
  Search,
} from "lucide-react";

import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/admin/audit-logs");

      setLogs(response.data.audit_logs || []);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Failed to load audit logs.")
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getActionIcon = (action = "") => {
    const value = action.toLowerCase();

    if (value.includes("login")) return LogIn;
    if (value.includes("register")) return UserPlus;
    if (value.includes("donation")) return HeartPulse;
    if (value.includes("request")) return ClipboardList;
    if (value.includes("setting")) return Settings;
    if (value.includes("user")) return Users;
    if (value.includes("inventory")) return Package;

    return Activity;
  };

  const getActionStyle = (action = "") => {
    const value = action.toLowerCase();

    if (value.includes("login")) {
      return "bg-blue-100 text-blue-700";
    }

    if (value.includes("register")) {
      return "bg-green-100 text-green-700";
    }

    if (value.includes("donation")) {
      return "bg-red-100 text-red-700";
    }

    if (value.includes("request")) {
      return "bg-purple-100 text-purple-700";
    }

    if (value.includes("setting")) {
      return "bg-orange-100 text-orange-700";
    }

    if (value.includes("inventory")) {
      return "bg-cyan-100 text-cyan-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  const getRoleStyle = (role = "") => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "bg-red-100 text-red-700";

      case "USER":
        return "bg-green-100 text-green-700";

      case "BLOOD_BANK":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatRole = (role = "") => {
    if (!role) return "-";

    return role
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatAction = (action = "") => {
    if (!action) return "-";

    return action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-red-600 animate-spin" />
          </div>

          <h2 className="text-lg font-semibold text-gray-800">
            Loading audit logs...
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Please wait while we retrieve system activity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-red-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-16 flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl truncate">
                  Life Link
                </h1>

                <p className="text-xs sm:text-sm text-red-100">
                  System Audit Logs
                </p>
              </div>
            </div>

            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-medium shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />

              <span className="hidden sm:inline">
                Dashboard
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero */}
        <section className="rounded-2xl bg-linear-to-r from-red-700 via-red-600 to-rose-600 text-white p-5 sm:p-7 shadow-lg mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5" />

                <span className="text-sm font-semibold text-red-100">
                  Administration
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold">
                Audit Logs
              </h2>

              <p className="mt-2 text-sm sm:text-base text-red-100 max-w-2xl">
                Review important system activities, user actions,
                authentication events, and administrative changes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchAuditLogs(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-red-700 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed font-semibold transition shadow-sm"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />

              {refreshing ? "Refreshing..." : "Refresh Logs"}
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-red-800">
                  Unable to load audit logs
                </p>

                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchAuditLogs(false)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Logs
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {logs.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  User Actions
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {
                    logs.filter((log) =>
                      (log.action || "")
                        .toLowerCase()
                        .includes("user")
                    ).length
                  }
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Donation Activity
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {
                    logs.filter((log) =>
                      (log.action || "")
                        .toLowerCase()
                        .includes("donation")
                    ).length
                  }
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  System Activity
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {
                    logs.filter((log) =>
                      ["setting", "inventory", "request"].some(
                        (keyword) =>
                          (log.action || "")
                            .toLowerCase()
                            .includes(keyword)
                      )
                    ).length
                  }
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </section>

        {/* Logs */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Activity History
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {logs.length} audit{" "}
                {logs.length === 1 ? "entry" : "entries"} recorded
              </p>
            </div>

            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <Search className="w-4 h-4" />
              System activity records
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>

              <h3 className="text-lg font-semibold text-gray-800">
                No audit logs found
              </h3>

              <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                System activities will appear here once users or
                administrators perform logged actions.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        ID
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        User
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Action
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Role
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Description
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => {
                      const ActionIcon = getActionIcon(log.action);

                      return (
                        <tr
                          key={log.audit_id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-5 py-4 text-sm font-medium text-gray-700">
                            #{log.audit_id}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-500" />
                              </div>

                              <div>
                                <p className="font-medium text-gray-900">
                                  {log.user_name || "-"}
                                </p>

                                <p className="text-xs text-gray-500 mt-0.5">
                                  {log.user_email || "-"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${getActionStyle(
                                log.action
                              )}`}
                            >
                              <ActionIcon className="w-3.5 h-3.5" />
                              {formatAction(log.action)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${getRoleStyle(
                                log.user_role
                              )}`}
                            >
                              {formatRole(log.user_role)}
                            </span>
                          </td>

                          <td className="px-5 py-4 max-w-md">
                            <p className="text-sm text-gray-700 leading-6">
                              {log.description || "-"}
                            </p>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4 text-gray-400" />

                              {log.created_at
                                ? new Date(
                                    log.created_at
                                  ).toLocaleString()
                                : "-"}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards */}
              <div className="lg:hidden divide-y divide-gray-100">
                {logs.map((log) => {
                  const ActionIcon = getActionIcon(log.action);

                  return (
                    <div
                      key={log.audit_id}
                      className="p-5 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {log.user_name || "-"}
                            </p>

                            <p className="text-xs text-gray-500 truncate">
                              {log.user_email || "-"}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                          #{log.audit_id}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${getActionStyle(
                            log.action
                          )}`}
                        >
                          <ActionIcon className="w-3.5 h-3.5" />
                          {formatAction(log.action)}
                        </span>

                        <span
                          className={`inline-flex px-2.5 py-1.5 rounded-lg text-xs font-semibold ${getRoleStyle(
                            log.user_role
                          )}`}
                        >
                          {formatRole(log.user_role)}
                        </span>
                      </div>

                      <div className="mt-4 rounded-xl bg-gray-50 p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Description
                        </p>

                        <p className="text-sm text-gray-700 leading-6">
                          {log.description || "-"}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-4 h-4 text-gray-400" />

                        {log.created_at
                          ? new Date(
                              log.created_at
                            ).toLocaleString()
                          : "-"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Life Link • Administrative Audit Trail
        </div>
      </main>
    </div>
  );
};

export default AuditLogs;