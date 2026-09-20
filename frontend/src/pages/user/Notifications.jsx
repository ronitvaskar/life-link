import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Clock3,
  Inbox,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.notifications || []);
    } catch (error) {
      setError(
        getApiErrorMessage(error, "Failed to load notifications.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    setMarkingId(notificationId);
    setError("");

    try {
      await api.put(`/notifications/${notificationId}/read`);

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
      setMarkingId(null);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    setError("");

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
          "Failed to mark notifications as read."
        )
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const getNotificationIcon = (notification) => {
    const type = notification.type?.toUpperCase();

    if (type === "REQUEST" || type === "BLOOD_REQUEST") {
      return <BellRing size={21} />;
    }

    if (type === "SUCCESS" || type === "FULFILLMENT") {
      return <CheckCheck size={21} />;
    }

    return <Bell size={21} />;
  };

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-red-600 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold sm:text-xl">
              Life Link
            </h1>

            <p className="text-xs text-red-100 sm:text-sm">
              User Notifications
            </p>
          </div>

          <Link
            to="/user/dashboard"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:px-4"
          >
            <ArrowLeft size={16} />

            <span className="hidden sm:inline">
              Back to Dashboard
            </span>

            <span className="sm:hidden">
              Back
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Page Heading */}
        <div className="mb-8 rounded-2xl bg-linear-to-r from-red-600 to-red-500 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <BellRing size={25} />
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-red-100">
                  <Sparkles size={15} />
                  Stay Informed
                </div>

                <h2 className="text-2xl font-bold sm:text-3xl">
                  Notifications
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-red-100 sm:text-base">
                  Stay updated about your blood requests, user responses,
                  fulfillment, and other important activities.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-white/10 px-5 py-3 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">
                {unreadCount}
              </p>

              <p className="text-xs text-red-100">
                Unread
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Your Notifications
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {notifications.length === 0
                ? "No notifications available."
                : `${notifications.length} ${
                    notifications.length === 1
                      ? "notification"
                      : "notifications"
                  }`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={fetchNotifications}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />

              Refresh
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={markingAll}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {markingAll ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <CheckCheck size={16} />
                )}

                {markingAll
                  ? "Updating..."
                  : "Mark All as Read"}
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-red-800">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={fetchNotifications}
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
              >
                <div className="flex gap-4">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-gray-200" />

                  <div className="flex-1">
                    <div className="h-5 w-48 rounded bg-gray-200" />

                    <div className="mt-3 h-4 w-full rounded bg-gray-200" />

                    <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />

                    <div className="mt-4 h-3 w-32 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Inbox
                className="text-gray-500"
                size={30}
              />
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-800">
              No Notifications Yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You don't have any notifications right now. Updates about
              your blood requests and user responses will appear here.
            </p>

            <Link
              to="/user/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <ArrowLeft size={17} />
              Return to Dashboard
            </Link>
          </div>
        ) : (
          /* Notification List */
          <div className="space-y-4">
            {notifications.map((notification) => {
              const isUnread = !notification.is_read;

              return (
                <div
                  key={notification.notification_id}
                  className={`rounded-2xl border p-5 shadow-sm transition sm:p-6 ${
                    isUnread
                      ? "border-red-200 bg-red-50/70 shadow-red-100"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    {/* Icon */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        isUnread
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {getNotificationIcon(notification)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-600" />
                          )}

                          <h3
                            className={`text-base sm:text-lg ${
                              isUnread
                                ? "font-bold text-gray-900"
                                : "font-semibold text-gray-800"
                            }`}
                          >
                            {notification.title}
                          </h3>
                        </div>

                        {isUnread && (
                          <span className="w-fit rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                            Unread
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {notification.message}
                      </p>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock3 size={14} />
                          {formatDate(notification.created_at)}
                        </div>

                        {isUnread && (
                          <button
                            type="button"
                            onClick={() =>
                              markAsRead(notification.notification_id)
                            }
                            disabled={
                              markingId === notification.notification_id
                            }
                            className="inline-flex w-fit items-center gap-2 rounded-lg border border-red-600 bg-white px-3.5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {markingId === notification.notification_id ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Check size={16} />
                            )}

                            {markingId === notification.notification_id
                              ? "Updating..."
                              : "Mark as Read"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Information Card */}
        {!loading && notifications.length > 0 && (
          <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <Bell
                  className="text-blue-600"
                  size={19}
                />
              </div>

              <div>
                <h4 className="font-semibold text-blue-900">
                  Keep an eye on your notifications
                </h4>

                <p className="mt-1 text-sm leading-6 text-blue-800">
                  Important updates about your blood requests and user
                  responses will be displayed here.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-500 sm:px-6">
          © {new Date().getFullYear()} Life Link. Helping connect people
          with blood donors and blood banks.
        </div>
      </footer>
    </div>
  );
}

export default Notifications;