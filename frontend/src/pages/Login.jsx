import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Droplets,
  Eye,
  EyeOff,
  Heart,
  HeartHandshake,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/errorHandler";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      const { token, user } = response.data;

      login(token, user);

      const role = user?.role;

      if (role === "USER") {
        navigate("/user/dashboard");
      } else if (role === "BLOOD_BANK") {
        navigate("/blood-bank/dashboard");
      } else if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Login failed. Please check your email and password."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">

        {/* ============================================================
            LEFT — BRAND / PLATFORM SIDE
        ============================================================ */}

        <section className="relative hidden overflow-hidden lg:flex">

          {/* Background image */}

          <img
            src="/image/blood-donation-hero.png"
            alt="Blood donation healthcare"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Dark overlays */}

          <div className="absolute inset-0 bg-slate-950/85" />

          <div className="absolute inset-0 bg-linear-to-br from-red-950/80 via-slate-950/90 to-slate-950" />

          {/* Ambient glow */}

          <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-red-600/20 blur-3xl" />

          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />

          {/* Grid */}

          <div className="absolute inset-0 opacity-[0.035]">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                backgroundSize: "64px 64px",
              }}
            />
          </div>

          {/* Left content */}

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

            {/* Brand */}

            <Link
              to="/"
              className="group flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-950/50 transition duration-300 group-hover:scale-105">
                <Droplets className="h-6 w-6 fill-white text-white" />
              </div>

              <div>
                <div className="text-xl font-black tracking-tight text-white">
                  Life<span className="text-red-500"> Link</span>
                </div>

                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Connected blood care
                </div>
              </div>
            </Link>

            {/* Main message */}

            <div className="max-w-xl">

              {/* Eyebrow */}

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 text-red-400" />

                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-300">
                  Welcome back
                </span>
              </div>

              {/* Heading */}

              <h1 className="text-5xl font-black leading-[1.02] tracking-[-0.04em] text-white xl:text-6xl">
                One platform.
                <span className="mt-2 block text-red-500">
                  One connected network.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-base leading-8 text-slate-300">
                Sign in to continue managing your blood-care journey through
                Life Link's connected platform.
              </p>

              {/* Platform benefits */}

              <div className="mt-9 space-y-4">

                <PlatformBenefit
                  icon={HeartHandshake}
                  title="Connected workflows"
                  text="Keep users, blood banks, and blood requests connected."
                />

                <PlatformBenefit
                  icon={ShieldCheck}
                  title="Role-based access"
                  text="Your experience is tailored to the role you use on the platform."
                />

                <PlatformBenefit
                  icon={CheckCircle2}
                  title="Real-time operations"
                  text="Track requests, donations, inventory, and important updates."
                />

              </div>

              {/* Role cards */}

              <div className="mt-10 grid grid-cols-3 gap-3">

                <RoleCard
                  icon={UserRound}
                  title="Users"
                />

                <RoleCard
                  icon={Building2}
                  title="Blood Banks"
                />

                <RoleCard
                  icon={ShieldCheck}
                  title="Administrators"
                />

              </div>

            </div>

            {/* Footer */}

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <LockKeyhole className="h-3.5 w-3.5" />

              <span>
                Life Link — Blood Donation & Blood Request Management System
              </span>
            </div>

          </div>
        </section>

        {/* ============================================================
            RIGHT — LOGIN SIDE
        ============================================================ */}

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-5 py-10 sm:px-8 lg:px-12">

          {/* Background decorations */}

          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-red-100/70 blur-3xl" />

          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-200/80 blur-3xl" />

          <div className="relative z-10 w-full max-w-xl">

            {/* ========================================================
                MOBILE BRAND
            ======================================================== */}

            <div className="mb-8 flex items-center justify-between lg:hidden">

              <Link
                to="/"
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-600/20">
                  <Droplets className="h-5 w-5 fill-white text-white" />
                </div>

                <div>
                  <div className="text-lg font-black text-slate-950">
                    Life<span className="text-red-600"> Link</span>
                  </div>

                  <div className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Connected blood care
                  </div>
                </div>
              </Link>

              <Link
                to="/register"
                className="text-xs font-bold text-slate-600 transition hover:text-red-600"
              >
                Create account
              </Link>

            </div>

            {/* ========================================================
                LOGIN CARD
            ======================================================== */}

            <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/50">

              {/* Top accent */}

              <div className="h-1.5 bg-linear-to-r from-red-700 via-red-500 to-red-600" />

              <div className="p-7 sm:p-9 lg:p-10">

                {/* ====================================================
                    HEADER
                ==================================================== */}

                <div className="mb-9">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                        <LockKeyhole className="h-5 w-5" />
                      </div>

                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">
                        Secure access
                      </p>

                      <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                        Welcome back
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Sign in to continue to your Life Link account.
                      </p>

                    </div>

                    {/* Logo mark */}

                    <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white sm:flex">
                      <Droplets className="h-5 w-5 fill-red-500 text-red-500" />
                    </div>

                  </div>

                  {/* Progress */}

                  <div className="mt-7 flex items-center gap-2">

                    <div className="h-1.5 flex-1 rounded-full bg-red-600" />

                    <div className="h-1.5 flex-1 rounded-full bg-slate-100" />

                    <div className="h-1.5 flex-1 rounded-full bg-slate-100" />

                  </div>

                  <p className="mt-2 text-[10px] font-semibold text-slate-400">
                    Secure account access
                  </p>

                </div>

                {/* ====================================================
                    ERROR
                ==================================================== */}

                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <ShieldCheck className="h-4 w-4" />
                    </div>

                    <div>

                      <p className="text-xs font-black text-red-800">
                        Sign in unsuccessful
                      </p>

                      <p className="mt-1 text-xs leading-5 text-red-600">
                        {error}
                      </p>

                    </div>

                  </div>
                )}

                {/* ====================================================
                    LOGIN FORM
                ==================================================== */}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* Email */}

                  <div>

                    <label
                      htmlFor="email"
                      className="mb-2 block text-xs font-black text-slate-700"
                    >
                      Email address
                    </label>

                    <div className="relative">

                      <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Mail className="h-4 w-4" />
                      </div>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-14 pr-4 text-sm font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400 transition duration-200 hover:border-slate-300 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50"
                      />

                    </div>

                  </div>

                  {/* Password */}

                  <div>

                    <div className="mb-2 flex items-center justify-between">

                      <label
                        htmlFor="password"
                        className="text-xs font-black text-slate-700"
                      >
                        Password
                      </label>

                    </div>

                    <div className="relative">

                      <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <LockKeyhole className="h-4 w-4" />
                      </div>

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-14 pr-14 text-sm font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400 transition duration-200 hover:border-slate-300 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((current) => !current)
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* ==================================================
                      SECURITY NOTICE
                  ================================================== */}

                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-500 shadow-sm">
                      <ShieldCheck className="h-4 w-4" />
                    </div>

                    <div>

                      <p className="text-xs font-black text-slate-700">
                        Secure account access
                      </p>

                      <p className="mt-1 text-[10px] leading-5 text-slate-500">
                        Sign in using the credentials associated with your
                        Life Link account.
                      </p>

                    </div>

                  </div>

                  {/* ==================================================
                      SUBMIT
                  ================================================== */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-black text-white shadow-lg shadow-red-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/25 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                  >

                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                        Signing you in...
                      </>
                    ) : (
                      <>
                        Sign in to Life Link

                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}

                  </button>

                </form>

                {/* ====================================================
                    TRUST
                ==================================================== */}

                <div className="mt-6 flex items-center justify-center gap-2 text-center">

                  <BadgeCheck className="h-4 w-4 text-emerald-500" />

                  <p className="text-[10px] font-semibold text-slate-400">
                    Role-based authenticated access
                  </p>

                </div>

                {/* ====================================================
                    DIVIDER
                ==================================================== */}

                <div className="my-7 flex items-center gap-4">

                  <div className="h-px flex-1 bg-slate-100" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    New to Life Link?
                  </span>

                  <div className="h-px flex-1 bg-slate-100" />

                </div>

                {/* ====================================================
                    REGISTER BUTTON
                ==================================================== */}

                <Link
                  to="/register"
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 transition duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >

                  Create a Life Link account

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />

                </Link>

              </div>
            </div>

            {/* ========================================================
                BOTTOM INFORMATION
            ======================================================== */}

            <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center">

              <div className="flex items-center gap-2">

                <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />

                <span className="text-[10px] font-bold text-slate-400">
                  Connecting people with better blood-care workflows
                </span>

              </div>

              <p className="text-[10px] text-slate-400">
                Life Link • Blood Donation & Blood Request Management System
              </p>

            </div>

          </div>
        </section>

      </div>
    </div>
  );
}

/* ========================================================================
   PLATFORM BENEFIT
======================================================================== */

function PlatformBenefit({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-red-400">
        <Icon className="h-4 w-4" />
      </div>

      <div>

        <p className="text-sm font-black text-white">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {text}
        </p>

      </div>

    </div>
  );
}

/* ========================================================================
   ROLE CARD
======================================================================== */

function RoleCard({
  icon: Icon,
  title,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition duration-300 hover:border-white/20 hover:bg-white/10">

      <div className="flex items-center gap-2.5">

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
          <Icon className="h-3.5 w-3.5" />
        </div>

        <span className="text-[10px] font-bold text-slate-300">
          {title}
        </span>

      </div>

    </div>
  );
}

export default Login;