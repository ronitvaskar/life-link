import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronDown,
  Droplets,
  Heart,
  HeartHandshake,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "USER",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const response = await api.post("/auth/register", formData);

      const { token, user } = response.data;

      if (token) {
        login(token, user);

        if (user?.role === "USER") {
          navigate("/user/dashboard");
        } else if (user?.role === "BLOOD_BANK") {
          navigate("/blood-bank/dashboard");
        } else {
          navigate("/");
        }
      } else {
        navigate("/login");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">

        {/* ============================================================
            LEFT — BRAND / PRODUCT SIDE
        ============================================================ */}

        <section className="relative hidden overflow-hidden lg:flex">

          {/* Background image */}

          <img
            src="/image/blood-donation-hero.png"
            alt="Blood donation healthcare"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Dark overlay */}

          <div className="absolute inset-0 bg-slate-950/85" />

          <div className="absolute inset-0 bg-linear-to-br from-red-950/80 via-slate-950/85 to-slate-950" />

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

          {/* Content */}

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

            {/* Brand */}

            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-950/50">
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

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 text-red-400" />

                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-300">
                  Join the network
                </span>
              </div>

              <h1 className="text-5xl font-black leading-[1.02] tracking-[-0.04em] text-white xl:text-6xl">
                Better connected.
                <span className="mt-2 block text-red-500">
                  Better coordinated.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-base leading-8 text-slate-300">
                Create your Life Link account and become part of a connected
                platform bringing users, blood banks, and administrators
                together.
              </p>

              {/* Benefits */}

              <div className="mt-9 space-y-4">

                <RegisterBenefit
                  icon={HeartHandshake}
                  title="Connect with the right workflow"
                  text="Access tools designed specifically for your account type."
                />

                <RegisterBenefit
                  icon={ShieldCheck}
                  title="Controlled access"
                  text="Your platform experience is organized around role-based permissions."
                />

                <RegisterBenefit
                  icon={ActivityIcon}
                  title="Stay informed"
                  text="Track requests, donations, inventory, and important updates."
                />

              </div>

              {/* Network cards */}

              <div className="mt-10 grid grid-cols-3 gap-3">

                <NetworkCard
                  icon={UserRound}
                  title="Users"
                />

                <NetworkCard
                  icon={Building2}
                  title="Blood Banks"
                />

                <NetworkCard
                  icon={ShieldCheck}
                  title="Administrators"
                />

              </div>
            </div>

            {/* Bottom */}

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <LockKeyhole className="h-3.5 w-3.5" />

              <span>
                Life Link — Blood Donation & Blood Request Management System
              </span>
            </div>

          </div>
        </section>

        {/* ============================================================
            RIGHT — REGISTRATION
        ============================================================ */}

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-5 py-10 sm:px-8 lg:px-12">

          {/* Mobile background accents */}

          <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-red-100/70 blur-3xl" />

          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-200/80 blur-3xl" />

          <div className="relative z-10 w-full max-w-xl">

            {/* Mobile brand */}

            <div className="mb-8 flex items-center justify-between lg:hidden">

              <Link to="/" className="flex items-center gap-3">

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
                to="/login"
                className="text-xs font-bold text-slate-600 transition hover:text-red-600"
              >
                Sign in
              </Link>

            </div>

            {/* Main card */}

            <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/50">

              {/* Top accent */}

              <div className="h-1.5 bg-linear-to-r from-red-700 via-red-500 to-red-600" />

              <div className="p-7 sm:p-9 lg:p-10">

                {/* Header */}

                <div className="mb-8">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                        <UserRound className="h-5 w-5" />
                      </div>

                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">
                        Life Link account
                      </p>

                      <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                        Create your account
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Start using the connected blood-care platform.
                      </p>

                    </div>

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
                    Account setup
                  </p>

                </div>

                {/* Error */}

                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <ShieldCheck className="h-4 w-4" />
                    </div>

                    <div>

                      <p className="text-xs font-black text-red-800">
                        Registration could not be completed
                      </p>

                      <p className="mt-1 text-xs leading-5 text-red-600">
                        {error}
                      </p>

                    </div>

                  </div>
                )}

                {/* Form */}

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Full Name */}

                  <FormField
                    id="name"
                    name="name"
                    label="Full name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    icon={UserRound}
                    required
                  />

                  {/* Email */}

                  <FormField
                    id="email"
                    name="email"
                    label="Email address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    icon={Mail}
                    required
                  />

                  {/* Phone */}

                  <FormField
                    id="phone"
                    name="phone"
                    label="Phone number"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    icon={Phone}
                    required
                  />

                  {/* Password */}

                  <FormField
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a secure password"
                    icon={LockKeyhole}
                    minLength={6}
                    required
                  />

                  {/* Account Type */}

                  <div>

                    <label
                      htmlFor="role"
                      className="mb-2 block text-xs font-black text-slate-700"
                    >
                      Account type
                    </label>

                    <div className="relative">

                      <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Users className="h-4 w-4" />
                      </div>

                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-14 pr-11 text-sm font-semibold text-slate-800 outline-none transition duration-200 hover:border-slate-300 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50"
                      >
                        <option value="USER">User</option>
                        <option value="BLOOD_BANK">Blood Bank</option>
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    </div>

                    {/* Account type description */}

                    <RoleDescription role={formData.role} />

                  </div>

                  {/* Submit */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 text-sm font-black text-white shadow-lg shadow-red-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/25 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                  >

                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                        Creating your account...
                      </>
                    ) : (
                      <>
                        Create account

                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}

                  </button>

                </form>

                {/* Trust */}

                <div className="mt-6 flex items-center justify-center gap-2 text-center">

                  <ShieldCheck className="h-4 w-4 text-emerald-500" />

                  <p className="text-[10px] font-semibold text-slate-400">
                    Your account is protected by authenticated access controls.
                  </p>

                </div>

                {/* Divider */}

                <div className="my-7 flex items-center gap-4">

                  <div className="h-px flex-1 bg-slate-100" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Already registered?
                  </span>

                  <div className="h-px flex-1 bg-slate-100" />

                </div>

                {/* Sign in */}

                <Link
                  to="/login"
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 transition duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  Sign in to Life Link

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

              </div>
            </div>

            {/* Bottom text */}

            <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center">

              <div className="flex items-center gap-2">

                <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />

                <span className="text-[10px] font-bold text-slate-400">
                  Connected healthcare workflow
                </span>

              </div>

              <p className="text-[10px] text-slate-400">
                By creating an account, you agree to use the Life Link system
                responsibly.
              </p>

            </div>

          </div>
        </section>

      </div>
    </div>
  );
}

/* ========================================================================
   FORM FIELD
======================================================================== */

function FormField({
  id,
  name,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  required = false,
  minLength,
}) {
  return (
    <div>

      <label
        htmlFor={id}
        className="mb-2 block text-xs font-black text-slate-700"
      >
        {label}
      </label>

      <div className="relative">

        <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors">
          <Icon className="h-4 w-4" />
        </div>

        <input
          id={id}
          name={name}
          type={type}
          required={required}
          minLength={minLength}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={
            type === "password"
              ? "new-password"
              : type === "email"
                ? "email"
                : name === "name"
                  ? "name"
                  : name === "phone"
                    ? "tel"
                    : "off"
          }
          className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-14 pr-4 text-sm font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400 transition duration-200 hover:border-slate-300 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-50"
        />

      </div>
    </div>
  );
}

/* ========================================================================
   ACCOUNT TYPE DESCRIPTION
======================================================================== */

function RoleDescription({ role }) {
  const roleData = {
    USER: {
      icon: Heart,
      title: "Donate or request blood",
      text: "Use one account to manage your profile, donation availability, blood requests, matching, responses, and donation history.",
    },

    BLOOD_BANK: {
      icon: Building2,
      title: "Operate blood inventory",
      text: "Manage inventory, donations, blood requests, and fulfillment operations for your blood bank.",
    },
  };

  const data = roleData[role] || roleData.USER;
  const Icon = data.icon;

  return (
    <div className="mt-3 flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>

      <div>

        <p className="text-xs font-black text-slate-700">
          {data.title}
        </p>

        <p className="mt-1 text-[10px] leading-5 text-slate-500">
          {data.text}
        </p>

      </div>

    </div>
  );
}

/* ========================================================================
   LEFT SIDE BENEFITS
======================================================================== */

function RegisterBenefit({
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
   NETWORK CARD
======================================================================== */

function NetworkCard({
  icon: Icon,
  title,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">

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

/* ========================================================================
   ACTIVITY ICON
======================================================================== */

function ActivityIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

export default Register;