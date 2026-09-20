import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users as UsersIcon,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  UserX,
  Ban,
  Mail,
  Phone,
  Hash,
  HeartPulse,
  Building2,
  Settings,
} from "lucide-react";

import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const response = await api.get("/admin/users");

      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Failed to load users."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    setError("");
    setMessage("");
    setUpdatingUserId(userId);

    try {
      await api.put(`/admin/users/${userId}/status`, {
        status,
      });

      setMessage(`User status updated to ${status}.`);

      await fetchUsers(false);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Failed to update user status."
        )
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleStatusChange = (user) => {
    let newStatus;

    if (user.status === "ACTIVE") {
      newStatus = "INACTIVE";
    } else {
      newStatus = "ACTIVE";
    }

    const confirmed = window.confirm(
      `Change ${user.name}'s status to ${newStatus}?`
    );

    if (confirmed) {
      updateUserStatus(user.user_id, newStatus);
    }
  };

  const handleBlock = (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to block ${user.name}?`
    );

    if (confirmed) {
      updateUserStatus(user.user_id, "BLOCKED");
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "USER":
        return <HeartPulse className="h-4 w-4" />;

      case "BLOOD_BANK":
        return <Building2 className="h-4 w-4" />;

      case "ADMIN":
        return <ShieldCheck className="h-4 w-4" />;

      default:
        return <UsersIcon className="h-4 w-4" />;
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "USER":
        return "bg-red-50 text-red-700 border-red-200";

      case "BLOOD_BANK":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "ADMIN":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-50 text-green-700 border-green-200";

      case "BLOCKED":
        return "bg-red-50 text-red-700 border-red-200";

      case "INACTIVE":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle2 className="h-4 w-4" />;

      case "BLOCKED":
        return <Ban className="h-4 w-4" />;

      case "INACTIVE":
        return <UserX className="h-4 w-4" />;

      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const activeUsers = users.filter(
    (user) => user.status === "ACTIVE"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "INACTIVE"
  ).length;

  const blockedUsers = users.filter(
    (user) => user.status === "BLOCKED"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-red-700 bg-red-600 text-white shadow-md">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="rounded-xl bg-white/15 p-2.5">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-lg font-bold sm:text-xl">
                Life Link
              </h1>

              <p className="text-xs text-red-100 sm:text-sm">
                Administration Panel
              </p>
            </div>
          </div>
        </header>

        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="text-center">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-red-600" />

            <p className="mt-4 font-semibold text-gray-700">
              Loading users...
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Please wait while we retrieve user accounts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-red-700 bg-red-600 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-2.5">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-lg font-bold sm:text-xl">
                Life Link
              </h1>

              <p className="text-xs text-red-100 sm:text-sm">
                Administration Panel
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-lg bg-white/10 px-3 py-2 sm:flex">
            <ShieldCheck className="h-4 w-4" />

            <span className="text-sm font-semibold">
              Administrator
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Page Header */}
        <section className="mb-8">
          <Link
            to="/admin/dashboard"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>

          <div className="overflow-hidden rounded-2xl bg-linear-to-r from-red-600 to-red-500 p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2 text-red-100">
                  <UsersIcon className="h-5 w-5" />

                  <span className="text-sm font-medium">
                    Account Administration
                  </span>
                </div>

                <h2 className="text-2xl font-bold sm:text-3xl">
                  User Management
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-red-100 sm:text-base">
                  View registered users and manage their account
                  status across Life Link.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchUsers(false)}
                disabled={refreshing}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />

                Refresh Users
              </button>
            </div>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="mb-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-50 p-3">
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Total Accounts
                  </p>

                  <p className="text-2xl font-bold text-gray-900">
                    {users.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-green-50 p-3">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Active
                  </p>

                  <p className="text-2xl font-bold text-gray-900">
                    {activeUsers}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-yellow-50 p-3">
                  <UserX className="h-6 w-6 text-yellow-600" />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Inactive
                  </p>

                  <p className="text-2xl font-bold text-gray-900">
                    {inactiveUsers}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-red-50 p-3">
                  <Ban className="h-6 w-6 text-red-600" />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Blocked
                  </p>

                  <p className="text-2xl font-bold text-gray-900">
                    {blockedUsers}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Messages */}
        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 shadow-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Success
              </p>

              <p className="mt-1 text-sm">
                {message}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-semibold">
                Unable to complete action
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchUsers(false)}
              className="text-sm font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Desktop Table */}
        <section className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">
          <div className="border-b border-gray-200 px-6 py-5">
            <h3 className="text-lg font-bold text-gray-900">
              Registered Accounts
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Manage account activation and blocking.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    ID
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    User
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Contact
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Role
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center"
                    >
                      <UsersIcon className="mx-auto h-10 w-10 text-gray-300" />

                      <p className="mt-3 font-semibold text-gray-700">
                        No users found
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        There are currently no registered users.
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.user_id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                          <Hash className="h-4 w-4 text-gray-400" />
                          {user.user_id}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {user.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          User account
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {user.email}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {user.phone || "-"}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getRoleClass(
                            user.role
                          )}`}
                        >
                          {getRoleIcon(user.role)}
                          {user.role}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                            user.status
                          )}`}
                        >
                          {getStatusIcon(user.status)}
                          {user.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {user.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-500">
                            <ShieldCheck className="h-4 w-4" />
                            Admin Account
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(user)
                              }
                              disabled={
                                updatingUserId === user.user_id
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {updatingUserId === user.user_id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : user.status === "ACTIVE" ? (
                                <UserX className="h-3.5 w-3.5" />
                              ) : (
                                <UserCheck className="h-3.5 w-3.5" />
                              )}

                              {user.status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            {user.status !== "BLOCKED" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleBlock(user)
                                }
                                disabled={
                                  updatingUserId === user.user_id
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Ban className="h-3.5 w-3.5" />
                                Block
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Mobile Cards */}
        <section className="space-y-4 lg:hidden">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Registered Accounts
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Manage account activation and blocking.
            </p>
          </div>

          {users.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <UsersIcon className="mx-auto h-10 w-10 text-gray-300" />

              <p className="mt-3 font-semibold text-gray-700">
                No users found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                There are currently no registered users.
              </p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.user_id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">
                      {user.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      User ID: #{user.user_id}
                    </p>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                      user.status
                    )}`}
                  >
                    {getStatusIcon(user.status)}
                    {user.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                    <span className="break-all">
                      {user.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 shrink-0 text-gray-400" />

                    <span>
                      {user.phone || "-"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getRoleClass(
                      user.role
                    )}`}
                  >
                    {getRoleIcon(user.role)}
                    {user.role}
                  </span>

                  {user.role === "ADMIN" ? (
                    <span className="text-xs font-medium text-gray-400">
                      Protected Admin
                    </span>
                  ) : null}
                </div>

                {user.role !== "ADMIN" && (
                  <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(user)
                      }
                      disabled={
                        updatingUserId === user.user_id
                      }
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updatingUserId === user.user_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : user.status === "ACTIVE" ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}

                      {user.status === "ACTIVE"
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    {user.status !== "BLOCKED" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleBlock(user)
                        }
                        disabled={
                          updatingUserId === user.user_id
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Ban className="h-4 w-4" />
                        Block
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          Life Link • Blood Donation & Blood Request Management System
        </div>
      </footer>
    </div>
  );
};

export default Users;