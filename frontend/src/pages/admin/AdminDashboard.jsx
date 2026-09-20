import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Gauge,
  LayoutDashboard,
  Loader2,
  LogOut,
  RefreshCw,
  Settings,
  Shield,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";

const AdminDashboard = () => {
  const { logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     FETCH USERS
  ========================================================= */

  const fetchUsers = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.get("/admin/users");

      const fetchedUsers = response.data?.users || [];

      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Failed to load admin users:", err);

      setError(
        getApiErrorMessage(
          err,
          "Failed to load admin dashboard data."
        )
      );
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchUsers(false);
  }, []);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const statistics = useMemo(() => {
    const total = users.length;

    const regularUsers = users.filter(
      (user) => user.role === "USER"
    ).length;

    const bloodBanks = users.filter(
      (user) => user.role === "BLOOD_BANK"
    ).length;

    const administrators = users.filter(
      (user) => user.role === "ADMIN"
    ).length;

    const active = users.filter(
      (user) => user.status === "ACTIVE"
    ).length;

    const inactive = users.filter(
      (user) => user.status === "INACTIVE"
    ).length;

    const blocked = users.filter(
      (user) => user.status === "BLOCKED"
    ).length;

    const availableToDonate = users.filter(
      (user) =>
        user.role === "USER" &&
        user.status === "ACTIVE" &&
        user.blood_group &&
        user.availability_status === "AVAILABLE"
    ).length;

    const profilesCompleted = users.filter(
      (user) =>
        user.role === "USER" &&
        user.blood_group
    ).length;

    return {
      total,
      regularUsers,
      bloodBanks,
      administrators,
      active,
      inactive,
      blocked,
      availableToDonate,
      profilesCompleted,
    };
  }, [users]);

  const percentage = (value) => {
    if (!statistics.total) return 0;

    return Math.round(
      (value / statistics.total) * 100
    );
  };

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7fafc]">

        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-slate-800">
                  Life Link
                </h1>

                <p className="text-xs font-medium text-slate-500">
                  Administration Console
                </p>
              </div>

            </div>

            <div className="hidden items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 sm:flex">

              <Shield className="h-4 w-4 text-blue-600" />

              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Secure Admin Area
              </span>

            </div>

          </div>
        </header>

        <div className="flex min-h-[75vh] items-center justify-center px-5">

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-800">
              Loading administration console
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Retrieving the latest Life Link system information.
            </p>

          </div>

        </div>

      </div>
    );
  }

  /* =========================================================
     MAIN DASHBOARD
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f7fafc] text-slate-800">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">

          {/* BRAND */}

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-800">
                Life Link
              </h1>

              <p className="text-xs font-medium text-slate-500">
                Administration Console
              </p>
            </div>

          </div>

          {/* HEADER ACTIONS */}

          <div className="flex items-center gap-3">

            <div className="hidden items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 md:flex">

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Shield className="h-4 w-4" />
              </div>

              <div>

                <p className="text-xs font-bold text-slate-700">
                  Administrator
                </p>

                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Full system access
                </p>

              </div>

            </div>

            {/* REFRESH BUTTON */}

            <button
              type="button"
              onClick={() => fetchUsers(true)}
              disabled={refreshing}
              aria-label="Refresh dashboard"
              title="Refresh dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >

              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />

              <span className="hidden sm:inline">
                {refreshing ? "Refreshing..." : "Refresh"}
              </span>

            </button>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={logout}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-bold text-white shadow-sm shadow-red-500/20 transition hover:bg-red-600 hover:shadow-md"
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
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-7 lg:px-8 lg:py-9">

        {/* ===================================================
            PAGE INTRO
        =================================================== */}

        <section className="mb-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
                  <LayoutDashboard className="h-4 w-4" />
                </span>

                <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-500">
                  Administration
                </span>

              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
                System Overview
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Monitor Life Link, manage accounts, review
                operational activity, and maintain the platform
                from one centralized workspace.
              </p>

            </div>

            {/* SYSTEM STATUS */}

            <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

              <span className="relative flex h-2.5 w-2.5">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />

              </span>

              <span className="text-xs font-bold text-emerald-700">
                SYSTEM OPERATIONAL
              </span>

            </div>

          </div>

        </section>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mb-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">
              <XCircle className="h-5 w-5" />
            </div>

            <div className="flex-1">

              <p className="font-bold text-red-800">
                Unable to load dashboard data
              </p>

              <p className="mt-1 text-sm leading-6 text-red-600">
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={() => fetchUsers(true)}
              disabled={refreshing}
              className="rounded-lg px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              Retry
            </button>

          </div>
        )}

        {/* ===================================================
            PRIMARY METRICS
        =================================================== */}

        <section className="mb-8">

          <div className="mb-4 flex items-end justify-between">

            <div>

              <h3 className="text-lg font-extrabold text-slate-800">
                Platform Metrics
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Current account and donation availability statistics.
              </p>

            </div>

            <div className="hidden items-center gap-2 text-xs font-semibold text-slate-400 sm:flex">

              <Clock3 className="h-3.5 w-3.5" />

              Live data

            </div>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* TOTAL ACCOUNTS */}

            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">

              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>

                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                  Accounts
                </span>

              </div>

              <div className="mt-6">

                <p className="text-sm font-semibold text-slate-500">
                  Total Accounts
                </p>

                <div className="mt-1 flex items-end gap-2">

                  <p className="text-3xl font-black tracking-tight text-slate-800">
                    {statistics.total}
                  </p>

                  <span className="mb-1 text-xs font-semibold text-slate-400">
                    registered
                  </span>

                </div>

              </div>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">

                <div className="h-full w-full rounded-full bg-blue-500" />

              </div>

            </div>

            {/* REGULAR USERS */}

            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-lg">

              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <UserRound className="h-5 w-5" />
                </div>

                <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-red-500">
                  USER
                </span>

              </div>

              <div className="mt-6">

                <p className="text-sm font-semibold text-slate-500">
                  Regular Users
                </p>

                <div className="mt-1 flex items-end gap-2">

                  <p className="text-3xl font-black tracking-tight text-slate-800">
                    {statistics.regularUsers}
                  </p>

                  <span className="mb-1 text-xs font-semibold text-slate-400">
                    accounts
                  </span>

                </div>

              </div>

              <div className="mt-5 flex items-center gap-2">

                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{
                      width: `${percentage(
                        statistics.regularUsers
                      )}%`,
                    }}
                  />

                </div>

                <span className="text-[10px] font-bold text-slate-400">
                  {percentage(statistics.regularUsers)}%
                </span>

              </div>

            </div>

            {/* BLOOD BANKS */}

            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg">

              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Building2 className="h-5 w-5" />
                </div>

                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-600">
                  BANK
                </span>

              </div>

              <div className="mt-6">

                <p className="text-sm font-semibold text-slate-500">
                  Blood Banks
                </p>

                <div className="mt-1 flex items-end gap-2">

                  <p className="text-3xl font-black tracking-tight text-slate-800">
                    {statistics.bloodBanks}
                  </p>

                  <span className="mb-1 text-xs font-semibold text-slate-400">
                    registered
                  </span>

                </div>

              </div>

              <div className="mt-5 flex items-center gap-2">

                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{
                      width: `${percentage(
                        statistics.bloodBanks
                      )}%`,
                    }}
                  />

                </div>

                <span className="text-[10px] font-bold text-slate-400">
                  {percentage(statistics.bloodBanks)}%
                </span>

              </div>

            </div>

            {/* AVAILABLE TO DONATE */}

            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">

              <div className="flex items-start justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <UserCheck className="h-5 w-5" />
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
                  LIVE
                </span>

              </div>

              <div className="mt-6">

                <p className="text-sm font-semibold text-slate-500">
                  Available to Donate
                </p>

                <div className="mt-1 flex items-end gap-2">

                  <p className="text-3xl font-black tracking-tight text-slate-800">
                    {statistics.availableToDonate}
                  </p>

                  <span className="mb-1 text-xs font-semibold text-slate-400">
                    users
                  </span>

                </div>

              </div>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${percentage(
                      statistics.availableToDonate
                    )}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            ACCOUNT HEALTH + COMPOSITION
        =================================================== */}

        <section className="mb-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">

          {/* ACCOUNT HEALTH */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Activity className="h-5 w-5" />
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-800">
                    Account Health
                  </h3>

                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Current account status across the platform.
                </p>

              </div>

              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">

                <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                <span className="text-xs font-bold text-emerald-700">
                  {statistics.active} active
                </span>

              </div>

            </div>

            <div className="mt-7 space-y-5">

              {/* ACTIVE */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                    <span className="text-sm font-semibold text-slate-600">
                      Active accounts
                    </span>

                  </div>

                  <span className="text-sm font-extrabold text-slate-800">
                    {statistics.active}
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${percentage(
                        statistics.active
                      )}%`,
                    }}
                  />

                </div>

              </div>

              {/* INACTIVE */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />

                    <span className="text-sm font-semibold text-slate-600">
                      Inactive accounts
                    </span>

                  </div>

                  <span className="text-sm font-extrabold text-slate-800">
                    {statistics.inactive}
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{
                      width: `${percentage(
                        statistics.inactive
                      )}%`,
                    }}
                  />

                </div>

              </div>

              {/* BLOCKED */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />

                    <span className="text-sm font-semibold text-slate-600">
                      Blocked accounts
                    </span>

                  </div>

                  <span className="text-sm font-extrabold text-slate-800">
                    {statistics.blocked}
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-rose-500 transition-all"
                    style={{
                      width: `${percentage(
                        statistics.blocked
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

          {/* PLATFORM COMPOSITION */}

          <div className="rounded-3xl border border-blue-100 bg-linear-to-br from-blue-50 via-white to-red-50 p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                <Gauge className="h-5 w-5" />
              </div>

              <span className="rounded-full border border-blue-100 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Platform
              </span>

            </div>

            <h3 className="mt-6 text-xl font-extrabold text-slate-800">
              Account Composition
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Distribution of Life Link accounts by system role.
            </p>

            <div className="mt-7 space-y-5">

              {/* USERS */}

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500">
                    <UserRound className="h-4 w-4" />
                  </div>

                  <div>

                    <p className="text-sm font-bold text-slate-700">
                      Users
                    </p>

                    <p className="text-xs text-slate-400">
                      General accounts
                    </p>

                  </div>

                </div>

                <p className="text-lg font-extrabold text-slate-800">
                  {statistics.regularUsers}
                </p>

              </div>

              {/* BLOOD BANKS */}

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Building2 className="h-4 w-4" />
                  </div>

                  <div>

                    <p className="text-sm font-bold text-slate-700">
                      Blood Banks
                    </p>

                    <p className="text-xs text-slate-400">
                      Registered facilities
                    </p>

                  </div>

                </div>

                <p className="text-lg font-extrabold text-slate-800">
                  {statistics.bloodBanks}
                </p>

              </div>

              {/* ADMINISTRATORS */}

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <Shield className="h-4 w-4" />
                  </div>

                  <div>

                    <p className="text-sm font-bold text-slate-700">
                      Administrators
                    </p>

                    <p className="text-xs text-slate-400">
                      System operators
                    </p>

                  </div>

                </div>

                <p className="text-lg font-extrabold text-slate-800">
                  {statistics.administrators}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            DONATION READINESS
        =================================================== */}

        <section className="mb-8 rounded-3xl border border-red-100 bg-linear-to-r from-white via-red-50/40 to-rose-50/50 p-6 shadow-sm">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">
                <Activity className="h-6 w-6" />
              </div>

              <div>

                <h3 className="text-lg font-extrabold text-slate-800">
                  Donation Readiness
                </h3>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  Users who have supplied a blood group and are
                  currently available to donate.
                </p>

              </div>

            </div>

            <div className="flex items-center gap-6">

              <div className="text-right">

                <p className="text-2xl font-black text-slate-800">
                  {statistics.availableToDonate}
                </p>

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Available
                </p>

              </div>

              <div className="h-10 w-px bg-slate-200" />

              <div className="text-right">

                <p className="text-2xl font-black text-slate-800">
                  {statistics.profilesCompleted}
                </p>

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Blood profiles
                </p>

              </div>

            </div>

          </div>

          <div className="mt-6 overflow-hidden rounded-full bg-slate-100">

            <div
              className="h-2 rounded-full bg-linear-to-r from-red-500 via-rose-500 to-pink-500 transition-all"
              style={{
                width: `${Math.min(
                  100,
                  percentage(
                    statistics.availableToDonate
                  )
                )}%`,
              }}
            />

          </div>

        </section>

        {/* ===================================================
            ADMINISTRATION TOOLS
        =================================================== */}

        <section>

          <div className="mb-5">

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Settings className="h-5 w-5" />
              </div>

              <h3 className="text-lg font-extrabold text-slate-800">
                Administration Tools
              </h3>

            </div>

            <p className="mt-2 text-sm text-slate-500">
              Manage the core operational areas of Life Link.
            </p>

          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            {/* USER MANAGEMENT */}

            <Link
              to="/admin/users"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>

                <ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-600" />

              </div>

              <h4 className="mt-6 text-lg font-extrabold text-slate-800">
                User Management
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                View accounts, review roles, and manage account
                statuses.
              </p>

              <div className="mt-5 flex items-center gap-1 text-sm font-bold text-blue-600">

                Manage accounts

                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />

              </div>

            </Link>

            {/* REPORTS */}

            <Link
              to="/admin/reports"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <BarChart3 className="h-5 w-5" />
                </div>

                <ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-purple-600" />

              </div>

              <h4 className="mt-6 text-lg font-extrabold text-slate-800">
                Reports & Analytics
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Review donation, request, inventory, and system
                performance reports.
              </p>

              <div className="mt-5 flex items-center gap-1 text-sm font-bold text-purple-600">

                Open reports

                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />

              </div>

            </Link>

            {/* SETTINGS */}

            <Link
              to="/admin/settings"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Settings className="h-5 w-5" />
                </div>

                <ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-600" />

              </div>

              <h4 className="mt-6 text-lg font-extrabold text-slate-800">
                System Settings
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Configure application limits, controls, and
                operational settings.
              </p>

              <div className="mt-5 flex items-center gap-1 text-sm font-bold text-amber-600">

                Configure system

                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />

              </div>

            </Link>

            {/* AUDIT LOGS */}

            <Link
              to="/admin/audit-logs"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FileText className="h-5 w-5" />
                </div>

                <ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600" />

              </div>

              <h4 className="mt-6 text-lg font-extrabold text-slate-800">
                Audit Logs
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Review important activities and administrative
                actions across the platform.
              </p>

              <div className="mt-5 flex items-center gap-1 text-sm font-bold text-emerald-600">

                Review activity

                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />

              </div>

            </Link>

          </div>

        </section>

        {/* ===================================================
            ADMIN SUMMARY
        =================================================== */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-blue-100 bg-linear-to-br from-blue-50 via-white to-red-50 p-6 shadow-sm sm:p-8">

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-500">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Administration Summary
                </span>

              </div>

              <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
                Life Link is managing{" "}
                {statistics.total}{" "}
                {statistics.total === 1
                  ? "account"
                  : "accounts"}.
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">

                The platform currently includes{" "}

                <span className="font-bold text-red-500">
                  {statistics.regularUsers} users
                </span>
                ,{" "}

                <span className="font-bold text-amber-600">
                  {statistics.bloodBanks} blood banks
                </span>
                , and{" "}

                <span className="font-bold text-purple-600">
                  {statistics.administrators} administrators
                </span>
                .

              </p>

            </div>

            <Link
              to="/admin/users"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-red-500/20 transition hover:bg-red-600 hover:shadow-lg"
            >

              Open User Management

              <ArrowRight className="h-4 w-4" />

            </Link>

          </div>

        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="mt-10 border-t border-slate-200 py-7">

          <div className="flex flex-col gap-3 text-center text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">

            <div className="flex items-center justify-center gap-2 sm:justify-start">

              <ShieldCheck className="h-4 w-4 text-red-500" />

              <span className="font-bold text-slate-500">
                Life Link
              </span>

              <span>•</span>

              <span>
                Administration Console
              </span>

            </div>

            <div className="flex items-center justify-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              Secure administrative environment

            </div>

          </div>

        </footer>

      </main>

    </div>
  );
};

export default AdminDashboard;