import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  BellRing,
  Building2,
  Check,
  CheckCheck,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Info,
  HeartPulse,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchNotifications = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const response = await api.get("/notifications");

      setNotifications(response.data.notifications || []);
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Failed to load notifications."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    setError("");
    setActionLoading(notificationId);

    try {
      await api.put(
        `/notifications/${notificationId}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.notification_id === notificationId
            ? { ...notification, is_read: 1 }
            : notification
        )
      );
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Failed to mark notification as read."
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  const markAllAsRead = async () => {
    setError("");
    setActionLoading("all");

    try {
      await api.put("/notifications/read-all");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: 1,
        }))
      );
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Failed to mark all notifications as read."
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getNotificationIcon = (type) => {
    const normalizedType = type?.toUpperCase();

    if (
      normalizedType?.includes("EMERGENCY") ||
      normalizedType?.includes("URGENT")
    ) {
      return (
        <ShieldAlert className="h-5 w-5 text-red-600" />
      );
    }

    if (
      normalizedType?.includes("DONATION") ||
      normalizedType?.includes("BLOOD")
    ) {
      return (
        <HeartPulse className="h-5 w-5 text-red-600" />
      );
    }

    if (
      normalizedType?.includes("REQUEST") ||
      normalizedType?.includes("ALERT")
    ) {
      return (
        <AlertCircle className="h-5 w-5 text-orange-600" />
      );
    }

    if (
      normalizedType?.includes("SUCCESS") ||
      normalizedType?.includes("COMPLETED")
    ) {
      return (
        <CheckCheck className="h-5 w-5 text-green-600" />
      );
    }

    if (normalizedType?.includes("INFO")) {
      return (
        <Info className="h-5 w-5 text-blue-600" />
      );
    }

    return (
      <Bell className="h-5 w-5 text-red-600" />
    );
  };

  const getIconBackground = (type) => {
    const normalizedType = type?.toUpperCase();

    if (
      normalizedType?.includes("EMERGENCY") ||
      normalizedType?.includes("URGENT")
    ) {
      return "bg-red-50";
    }

    if (
      normalizedType?.includes("DONATION") ||
      normalizedType?.includes("BLOOD")
    ) {
      return "bg-red-50";
    }

    if (
      normalizedType?.includes("REQUEST") ||
      normalizedType?.includes("ALERT")
    ) {
      return "bg-orange-50";
    }

    if (
      normalizedType?.includes("SUCCESS") ||
      normalizedType?.includes("COMPLETED")
    ) {
      return "bg-green-50";
    }

    if (normalizedType?.includes("INFO")) {
      return "bg-blue-50";
    }

    return "bg-gray-100";
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-red-700 bg-red-600 text-white shadow-md">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="rounded-xl bg-white/15 p-2.5">
              <Building2 className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-lg font-bold sm:text-xl">
                Life Link
              </h1>

              <p className="text-xs text-red-100 sm:text-sm">
                Blood Bank Notifications
              </p>
            </div>
          </div>
        </header>

        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="text-center">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-red-600" />

            <p className="mt-4 font-semibold text-gray-700">
              Loading notifications...
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Please wait while we retrieve your notifications.
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
              <Building2 className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-lg font-bold sm:text-xl">
                Life Link
              </h1>

              <p className="text-xs text-red-100 sm:text-sm">
                Blood Bank Notifications
              </p>
            </div>
          </div>

          <Link
            to="/blood-bank/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 sm:px-4"
          >
            <ArrowLeft className="h-4 w-4" />

            <span className="hidden sm:inline">
              Back to Dashboard
            </span>

            <span className="sm:hidden">
              Back
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Hero */}
        <section className="mb-7 overflow-hidden rounded-2xl bg-linear-to-r from-red-600 to-red-500 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-red-100">
                <BellRing className="h-5 w-5" />

                <span className="text-sm font-medium">
                  Blood Bank Updates
                </span>
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Notifications
              </h2>

              <p className="mt-2 text-sm text-red-100 sm:text-base">
                Stay updated with blood requests, donations,
                inventory events, and important alerts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchNotifications(false)}
              disabled={refreshing}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />

              Refresh
            </button>
          </div>
        </section>

        {/* Notification summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-3">
                <Bell className="h-5 w-5 text-red-600" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Total Notifications
                </p>

                <p className="text-2xl font-bold text-gray-900">
                  {notifications.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-orange-50 p-3">
                  <BellRing className="h-5 w-5 text-orange-600" />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Unread Notifications
                  </p>

                  <p className="text-2xl font-bold text-gray-900">
                    {unreadCount}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={actionLoading === "all"}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm"
                >
                  {actionLoading === "all" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCheck className="h-4 w-4" />
                  )}

                  <span className="hidden sm:inline">
                    Mark All as Read
                  </span>

                  <span className="sm:hidden">
                    Mark All
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-semibold">
                Notification error
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchNotifications(false)}
              className="text-sm font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <Bell className="h-8 w-8 text-red-500" />
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-800">
              No notifications
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You don't have any notifications yet. New
              updates will appear here when there is activity
              related to your blood bank.
            </p>

            <button
              type="button"
              onClick={() => fetchNotifications(false)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              Check Again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Recent Notifications
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Your latest system updates and alerts.
                </p>
              </div>
            </div>

            {notifications.map((notification) => {
              const isUnread = !notification.is_read;
              const isMarking =
                actionLoading === notification.notification_id;

              return (
                <article
                  key={notification.notification_id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition sm:p-6 ${
                    isUnread
                      ? "border-red-200 shadow-red-100"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        getIconBackground(notification.type)
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4
                              className={`text-base sm:text-lg ${
                                isUnread
                                  ? "font-bold text-gray-900"
                                  : "font-semibold text-gray-800"
                              }`}
                            >
                              {notification.title}
                            </h4>

                            {isUnread && (
                              <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                                New
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm leading-6 text-gray-600">
                            {notification.message}
                          </p>
                        </div>

                        {!isUnread && (
                          <span className="inline-flex w-fit items-center gap-1 text-xs font-medium text-gray-400">
                            <Check className="h-3.5 w-3.5" />
                            Read
                          </span>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                          {notification.type && (
                            <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                              {notification.type}
                            </span>
                          )}

                          {notification.created_at && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                              <Clock3 className="h-3.5 w-3.5" />
                              {formatDate(notification.created_at)}
                            </span>
                          )}
                        </div>

                        {isUnread && (
                          <button
                            type="button"
                            onClick={() =>
                              markAsRead(
                                notification.notification_id
                              )
                            }
                            disabled={isMarking}
                            className="inline-flex w-fit items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isMarking ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4" />
                                Mark as Read
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mt-8 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          Life Link • Blood Donation & Blood Request Management System
        </div>
      </footer>
    </div>
  );
};

export default Notifications;