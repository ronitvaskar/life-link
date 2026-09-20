import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";

import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Droplets,
  FilePlus2,
  Heart,
  HeartPulse,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";

function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(user || null);

  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [donationError, setDonationError] = useState("");

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestError, setRequestError] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notificationError, setNotificationError] = useState("");

  const [respondingRequestId, setRespondingRequestId] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");

  /* ---------------------------------------------------------
     FETCH PROFILE
  --------------------------------------------------------- */

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");

        if (response.data?.user) {
          setProfile(response.data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setProfile(user || null);
      }
    };

    fetchProfile();
  }, [user]);

  /* ---------------------------------------------------------
     FETCH DONATIONS
  --------------------------------------------------------- */

  const fetchDonations = async () => {
    try {
      setLoadingDonations(true);
      setDonationError("");

      const response = await api.get("/donations/my");

      setDonations(response.data?.donations || []);
    } catch (error) {
      console.error("Failed to fetch donations:", error);

      setDonationError(
        getApiErrorMessage(
          error,
          "Unable to load donation history."
        )
      );
    } finally {
      setLoadingDonations(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  /* ---------------------------------------------------------
     FETCH MATCHING BLOOD REQUESTS
  --------------------------------------------------------- */

  const fetchMatchingRequests = async () => {
    try {
      setLoadingRequests(true);
      setRequestError("");

      /*
       * The backend keeps this endpoint for compatibility.
       * It returns requests compatible with the logged-in USER.
       */
      const response = await api.get(
        "/blood-requests/donor/matches"
      );

      setRequests(response.data?.requests || []);
    } catch (error) {
      console.error(
        "Failed to fetch matching blood requests:",
        error
      );

      setRequestError(
        getApiErrorMessage(
          error,
          "Unable to load matching blood requests."
        )
      );
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchMatchingRequests();
  }, []);

  /* ---------------------------------------------------------
     FETCH NOTIFICATIONS
  --------------------------------------------------------- */

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      setNotificationError("");

      const response = await api.get("/notifications");

      setNotifications(response.data?.notifications || []);
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error
      );

      setNotificationError(
        getApiErrorMessage(
          error,
          "Unable to load notifications."
        )
      );
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* ---------------------------------------------------------
     DERIVED DATA
  --------------------------------------------------------- */

  const unreadNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.is_read
      ).length,
    [notifications]
  );

  const completedDonations = useMemo(
    () =>
      donations.filter(
        (donation) => donation.status === "COMPLETED"
      ).length,
    [donations]
  );

  const activeMatchingRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === "PENDING" ||
          request.status === "ACCEPTED" ||
          request.status === "PARTIALLY_FULFILLED"
      ).length,
    [requests]
  );

  const bloodGroup = profile?.blood_group || "Not set";

  const availability =
    profile?.availability_status ||
    (profile?.is_available ? "AVAILABLE" : "UNAVAILABLE");

  const isAvailable =
    availability === "AVAILABLE" ||
    availability === 1 ||
    availability === true;

  /* ---------------------------------------------------------
     NOTIFICATIONS
  --------------------------------------------------------- */

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.put(
        `/notifications/${notificationId}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.notification_id === notificationId
            ? {
                ...notification,
                is_read: 1,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.put("/notifications/read-all");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: 1,
        }))
      );
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );
    }
  };

  /* ---------------------------------------------------------
     REQUEST RESPONSE
  --------------------------------------------------------- */

  const handleRequestResponse = async (
    requestId,
    responseStatus
  ) => {
    try {
      setRespondingRequestId(requestId);
      setResponseMessage("");
      setRequestError("");

      const response = await api.post(
        `/blood-requests/${requestId}/respond`,
        {
          response_status: responseStatus,
        }
      );

      setResponseMessage(
        response.data?.message ||
          "Your response was submitted successfully."
      );

      setRequests((current) =>
        current.filter(
          (request) => request.request_id !== requestId
        )
      );
    } catch (error) {
      console.error(
        "Failed to respond to blood request:",
        error
      );

      setRequestError(
        getApiErrorMessage(
          error,
          "Unable to submit your response."
        )
      );
    } finally {
      setRespondingRequestId(null);
    }
  };

  /* ---------------------------------------------------------
     HELPERS
  --------------------------------------------------------- */

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case "EMERGENCY":
        return "bg-red-50 text-red-700 border-red-200";

      case "URGENT":
        return "bg-orange-50 text-orange-700 border-orange-200";

      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "COMPLETED":
      case "FULFILLED":
        return "bg-emerald-50 text-emerald-700";

      case "SCHEDULED":
      case "ACCEPTED":
        return "bg-blue-50 text-blue-700";

      case "PARTIALLY_FULFILLED":
        return "bg-amber-50 text-amber-700";

      case "CANCELLED":
      case "REJECTED":
        return "bg-red-50 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-gray-900">

      {/* =====================================================
          TOP NAVIGATION
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-360 items-center justify-between px-5 py-3 lg:px-8">

          <button
            type="button"
            onClick={() => navigate("/user/dashboard")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/20">
              <Droplets className="h-6 w-6" />
            </div>

            <div className="text-left">
              <h1 className="text-lg font-extrabold tracking-tight text-gray-900">
                Life Link
              </h1>

              <p className="text-xs font-medium text-gray-500">
                Blood Donation Network
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-4">

            <button
              type="button"
              onClick={() =>
                scrollToSection("notifications-section")
              }
              className="relative flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <Bell className="h-5 w-5" />

              <span className="hidden sm:inline">
                Notifications
              </span>

              {unreadNotifications > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                  {unreadNotifications > 9
                    ? "9+"
                    : unreadNotifications}
                </span>
              )}
            </button>

            <div className="hidden h-8 w-px bg-gray-200 sm:block" />

            <div className="hidden items-center gap-3 md:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
                {(profile?.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="max-w-32">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {profile?.name || "User"}
                </p>

                <p className="text-xs text-gray-500">
                  USER
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />

              <span className="hidden sm:inline">
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-360 px-5 py-7 lg:px-8 lg:py-9">

        {/* ===================================================
            HERO / WELCOME
        =================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-red-700 via-red-600 to-rose-600 p-7 text-white shadow-xl shadow-red-900/10 lg:p-10">

          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-32 right-24 h-72 w-72 rounded-full bg-rose-300/10 blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-red-50">
                <ShieldCheck className="h-3.5 w-3.5" />
                Life Link Member
              </div>

              <h2 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Welcome back,{" "}
                {profile?.name || "User"}.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-red-50 sm:text-base">
                Manage your blood requests, donation
                availability, donation history, and
                connections with people who need help.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={() =>
                    navigate("/user/create-request")
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-red-600 shadow-lg transition hover:bg-red-50"
                >
                  <Plus className="h-4 w-4" />
                  Request Blood
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/user/availability")
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  <HeartPulse className="h-4 w-4" />
                  Donation Availability
                </button>

              </div>
            </div>

            {/* Blood group status */}

            <div className="flex items-center gap-5 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm lg:min-w-67.5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-black text-red-600 shadow-lg">
                {bloodGroup}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-red-100">
                  Blood Group
                </p>

                <p className="mt-1 text-lg font-bold">
                  {bloodGroup}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isAvailable
                        ? "bg-emerald-300"
                        : "bg-white/50"
                    }`}
                  />

                  <span className="text-xs font-semibold text-red-50">
                    {isAvailable
                      ? "Available to donate"
                      : "Currently unavailable"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            QUICK STATS
        =================================================== */}

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Heart className="h-5 w-5" />
              </div>

              <span className="text-xs font-semibold text-gray-400">
                LIFETIME
              </span>
            </div>

            <p className="mt-4 text-2xl font-extrabold text-gray-900">
              {completedDonations}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Completed donations
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <ClipboardList className="h-5 w-5" />
              </div>

              <span className="text-xs font-semibold text-gray-400">
                ACTIVE
              </span>
            </div>

            <p className="mt-4 text-2xl font-extrabold text-gray-900">
              {activeMatchingRequests}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Active matches
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <UsersRound className="h-5 w-5" />
              </div>

              <span className="text-xs font-semibold text-gray-400">
                MATCHES
              </span>
            </div>

            <p className="mt-4 text-2xl font-extrabold text-gray-900">
              {requests.length}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Compatible opportunities
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Bell className="h-5 w-5" />
              </div>

              <span className="text-xs font-semibold text-gray-400">
                INBOX
              </span>
            </div>

            <p className="mt-4 text-2xl font-extrabold text-gray-900">
              {unreadNotifications}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Unread notifications
            </p>
          </div>

        </section>

        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <section className="mt-8">

          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-red-600">
                Quick actions
              </p>

              <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
                What would you like to do?
              </h3>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            {/* Request Blood */}

            <button
              type="button"
              onClick={() =>
                navigate("/user/create-request")
              }
              className="group relative overflow-hidden rounded-2xl border border-red-100 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl"
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-red-50 transition group-hover:scale-150" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <FilePlus2 className="h-6 w-6" />
                  </div>

                  <ArrowRight className="h-5 w-5 text-gray-300 transition group-hover:translate-x-1 group-hover:text-red-600" />
                </div>

                <h4 className="mt-6 text-lg font-bold text-gray-900">
                  Request Blood
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Create a request and connect with compatible
                  users and blood banks.
                </p>

                <span className="mt-4 inline-flex text-sm font-bold text-red-600">
                  Create request
                  <ChevronRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </button>

            {/* My Requests */}

            <button
              type="button"
              onClick={() => navigate("/user/requests")}
              className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-orange-50 transition group-hover:scale-150" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <ClipboardList className="h-6 w-6" />
                  </div>

                  <ArrowRight className="h-5 w-5 text-gray-300 transition group-hover:translate-x-1 group-hover:text-orange-600" />
                </div>

                <h4 className="mt-6 text-lg font-bold text-gray-900">
                  My Blood Requests
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Track requests you created and monitor
                  their progress.
                </p>

                <span className="mt-4 inline-flex text-sm font-bold text-orange-600">
                  View requests
                  <ChevronRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </button>

            {/* Donate */}

            <button
              type="button"
              onClick={() =>
                navigate("/user/availability")
              }
              className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-50 transition group-hover:scale-150" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <HeartPulse className="h-6 w-6" />
                  </div>

                  <ArrowRight className="h-5 w-5 text-gray-300 transition group-hover:translate-x-1 group-hover:text-emerald-600" />
                </div>

                <h4 className="mt-6 text-lg font-bold text-gray-900">
                  Donate Blood
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Update your availability and help people
                  who need your blood group.
                </p>

                <span className="mt-4 inline-flex items-center text-sm font-bold text-emerald-600">
                  Manage availability
                  <ChevronRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </button>

            {/* Profile */}

            <button
              type="button"
              onClick={() => navigate("/user/profile")}
              className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-blue-50 transition group-hover:scale-150" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <UserRound className="h-6 w-6" />
                  </div>

                  <ArrowRight className="h-5 w-5 text-gray-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                </div>

                <h4 className="mt-6 text-lg font-bold text-gray-900">
                  My Profile
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Keep your personal information and blood
                  details up to date.
                </p>

                <span className="mt-4 inline-flex text-sm font-bold text-blue-600">
                  Manage profile
                  <ChevronRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </button>

          </div>
        </section>

        {/* ===================================================
            MATCHING REQUESTS + SIDE PANEL
        =================================================== */}

        <section
          id="matching-requests-section"
          className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]"
        >

          {/* Matching requests */}

          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">

            <div className="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <Droplets className="h-5 w-5" />
                  </div>

                  <h3 className="text-xl font-extrabold text-gray-900">
                    Matching Blood Requests
                  </h3>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  Requests compatible with your blood group.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchMatchingRequests}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {responseMessage && (
              <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                <p className="text-sm font-medium text-emerald-700">
                  {responseMessage}
                </p>
              </div>
            )}

            {loadingRequests && (
              <div className="p-12 text-center">
                <RefreshCw className="mx-auto h-7 w-7 animate-spin text-red-500" />

                <p className="mt-3 text-sm text-gray-500">
                  Finding compatible requests...
                </p>
              </div>
            )}

            {!loadingRequests && requestError && (
              <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-5">
                <div className="flex gap-3">
                  <XCircle className="h-5 w-5 shrink-0 text-red-600" />

                  <div>
                    <p className="font-semibold text-red-700">
                      Unable to load requests
                    </p>

                    <p className="mt-1 text-sm text-red-600">
                      {requestError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!loadingRequests &&
              !requestError &&
              requests.length === 0 && (
                <div className="p-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                    <Droplets className="h-7 w-7" />
                  </div>

                  <h4 className="mt-4 font-bold text-gray-800">
                    No matching requests
                  </h4>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                    There are currently no active blood
                    requests that match your blood group.
                  </p>
                </div>
              )}

            {!loadingRequests &&
              !requestError &&
              requests.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {requests.slice(0, 5).map((request) => (
                    <div
                      key={request.request_id}
                      className="p-6 transition hover:bg-gray-50/70"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">

                            <span className="text-sm font-bold text-gray-900">
                              Request #{request.request_id}
                            </span>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${getUrgencyStyle(
                                request.urgency
                              )}`}
                            >
                              {request.urgency}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusStyle(
                                request.status
                              )}`}
                            >
                              {request.status}
                            </span>

                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-3">

                            <div>
                              <p className="text-xs font-medium text-gray-400">
                                BLOOD GROUP
                              </p>

                              <p className="mt-1 font-bold text-red-600">
                                {request.blood_group}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-gray-400">
                                UNITS NEEDED
                              </p>

                              <p className="mt-1 font-bold text-gray-800">
                                {request.units_required}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-gray-400">
                                HOSPITAL
                              </p>

                              <p className="mt-1 truncate font-semibold text-gray-700">
                                {request.hospital_name || "—"}
                              </p>
                            </div>

                          </div>

                          {request.city && (
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                              <MapPin className="h-3.5 w-3.5" />
                              {request.city}
                            </div>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleRequestResponse(
                                request.request_id,
                                "INTERESTED"
                              )
                            }
                            disabled={
                              respondingRequestId ===
                              request.request_id
                            }
                            className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Interested
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleRequestResponse(
                                request.request_id,
                                "ACCEPTED"
                              )
                            }
                            disabled={
                              respondingRequestId ===
                              request.request_id
                            }
                            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Accept
                          </button>

                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}

            {requests.length > 5 && (
              <div className="border-t border-gray-100 p-4 text-center">
                <button
                  type="button"
                  onClick={() =>
                    scrollToSection(
                      "matching-requests-section"
                    )
                  }
                  className="text-sm font-bold text-red-600 hover:text-red-700"
                >
                  Showing 5 of {requests.length} matches
                </button>
              </div>
            )}

          </div>

          {/* Blood help panel */}

          <aside className="rounded-3xl bg-gray-900 p-6 text-white shadow-xl">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600">
              <HeartPulse className="h-6 w-6" />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-red-400">
              Make an impact
            </p>

            <h3 className="mt-2 text-2xl font-extrabold leading-tight">
              Your availability can save a life.
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Keep your donation availability updated so Life
              Link can connect you with compatible blood
              requests.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/user/availability")
              }
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-gray-900 transition hover:bg-gray-100"
            >
              Update availability
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-gray-400">
                  Blood group
                </p>

                <p className="mt-1 text-lg font-extrabold">
                  {bloodGroup}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-gray-400">
                  Status
                </p>

                <p className="mt-1 text-sm font-bold text-emerald-400">
                  {isAvailable
                    ? "Available"
                    : "Unavailable"}
                </p>
              </div>

            </div>
          </aside>

        </section>

        {/* ===================================================
            DONATION HISTORY
        =================================================== */}

        <section
          id="donations-section"
          className="mt-8 rounded-3xl border border-gray-200 bg-white shadow-sm"
        >

          <div className="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <h3 className="text-xl font-extrabold text-gray-900">
                  Donation History
                </h3>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Your contribution history with Life Link.
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 px-4 py-2 text-right">
              <p className="text-lg font-extrabold text-gray-900">
                {donations.length}
              </p>

              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Total donations
              </p>
            </div>

          </div>

          {loadingDonations && (
            <div className="p-12 text-center">
              <RefreshCw className="mx-auto h-7 w-7 animate-spin text-red-500" />

              <p className="mt-3 text-sm text-gray-500">
                Loading donation history...
              </p>
            </div>
          )}

          {!loadingDonations && donationError && (
            <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="font-semibold text-red-700">
                Unable to load donation history
              </p>

              <p className="mt-1 text-sm text-red-600">
                {donationError}
              </p>
            </div>
          )}

          {!loadingDonations &&
            !donationError &&
            donations.length === 0 && (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <Heart className="h-7 w-7" />
                </div>

                <h4 className="mt-4 font-bold text-gray-800">
                  No donations yet
                </h4>

                <p className="mt-2 text-sm text-gray-500">
                  Your completed donations will appear here.
                </p>
              </div>
            )}

          {!loadingDonations &&
            !donationError &&
            donations.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-190">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70 text-left">

                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Donation
                      </th>

                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Blood Bank
                      </th>

                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Blood Group
                      </th>

                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Date
                      </th>

                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Units
                      </th>

                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Status
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {donations.map((donation) => (
                      <tr
                        key={donation.donation_id}
                        className="transition hover:bg-gray-50/70"
                      >

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                              <Droplets className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="text-sm font-bold text-gray-800">
                                Donation #
                                {donation.donation_id}
                              </p>

                              <p className="text-xs text-gray-400">
                                Life Link record
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm font-semibold text-gray-700">
                          {donation.bank_name || "—"}
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-lg bg-red-50 px-3 py-1.5 text-sm font-extrabold text-red-600">
                            {donation.blood_group || "—"}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            {formatDate(
                              donation.donation_date
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm font-bold text-gray-800">
                          {donation.units || 0}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                              donation.status
                            )}`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {donation.status}
                          </span>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

        </section>

        {/* ===================================================
            NOTIFICATIONS
        =================================================== */}

        <section
          id="notifications-section"
          className="mt-8 rounded-3xl border border-gray-200 bg-white shadow-sm"
        >

          <div className="flex flex-col gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Bell className="h-5 w-5" />
                </div>

                <h3 className="text-xl font-extrabold text-gray-900">
                  Notifications
                </h3>

                {unreadNotifications > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                    {unreadNotifications} NEW
                  </span>
                )}

              </div>

              <p className="mt-2 text-sm text-gray-500">
                Important updates about your requests and
                donations.
              </p>
            </div>

            {unreadNotifications > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
              >
                Mark all as read
              </button>
            )}

          </div>

          {loadingNotifications && (
            <div className="p-12 text-center">
              <RefreshCw className="mx-auto h-7 w-7 animate-spin text-red-500" />

              <p className="mt-3 text-sm text-gray-500">
                Loading notifications...
              </p>
            </div>
          )}

          {!loadingNotifications &&
            notificationError && (
              <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-5">

                <p className="font-semibold text-red-700">
                  Unable to load notifications
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {notificationError}
                </p>

              </div>
            )}

          {!loadingNotifications &&
            !notificationError &&
            notifications.length === 0 && (
              <div className="p-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <Bell className="h-7 w-7" />
                </div>

                <h4 className="mt-4 font-bold text-gray-800">
                  You're all caught up
                </h4>

                <p className="mt-2 text-sm text-gray-500">
                  New Life Link updates will appear here.
                </p>

              </div>
            )}

          {!loadingNotifications &&
            !notificationError &&
            notifications.length > 0 && (
              <div className="divide-y divide-gray-100">

                {notifications.slice(0, 6).map(
                  (notification) => (
                    <div
                      key={notification.notification_id}
                      className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between ${
                        notification.is_read
                          ? "bg-white"
                          : "bg-red-50/40"
                      }`}
                    >

                      <div className="flex gap-4">

                        <div
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            notification.is_read
                              ? "bg-gray-100 text-gray-500"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          <Bell className="h-5 w-5" />
                        </div>

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <h4 className="font-bold text-gray-800">
                              {notification.title}
                            </h4>

                            {!notification.is_read && (
                              <span className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white">
                                NEW
                              </span>
                            )}

                          </div>

                          <p className="mt-1 text-sm leading-6 text-gray-600">
                            {notification.message}
                          </p>

                          <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">

                            <Clock3 className="h-3.5 w-3.5" />

                            {notification.created_at
                              ? new Date(
                                  notification.created_at
                                ).toLocaleString("en-IN")
                              : "Recently"}

                          </p>

                        </div>

                      </div>

                      {!notification.is_read && (
                        <button
                          type="button"
                          onClick={() =>
                            markNotificationAsRead(
                              notification.notification_id
                            )
                          }
                          className="self-start rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition hover:border-red-200 hover:text-red-600"
                        >
                          Mark as read
                        </button>
                      )}

                    </div>
                  )
                )}

              </div>
            )}

        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="mt-10 border-t border-gray-200 py-7">
          <div className="flex flex-col gap-3 text-center text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">

            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <Droplets className="h-4 w-4 text-red-500" />

              <span className="font-semibold text-gray-500">
                Life Link
              </span>

              <span>•</span>

              <span>
                Connecting people through blood donation.
              </span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure user experience
            </div>

          </div>
        </footer>

      </main>
    </div>
  );
}

export default UserDashboard;