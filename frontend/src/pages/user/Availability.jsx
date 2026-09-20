import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  HeartPulse,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  CalendarDays,
  Droplets,
  Clock3,
  Send,
} from "lucide-react";

import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";

function Availability() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [bloodBanks, setBloodBanks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingBanks, setLoadingBanks] = useState(true);

  const [saving, setSaving] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [bankId, setBankId] = useState("");
  const [donationDate, setDonationDate] = useState("");
  const [units, setUnits] = useState("1");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchBloodBanks();
  }, []);

  /* ---------------------------------------------------------
     FETCH PROFILE
  --------------------------------------------------------- */

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users/profile");

      if (response.data?.user) {
        setProfile(response.data.user);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);

      setError(
        getApiErrorMessage(
          error,
          "Failed to load availability information."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------
     FETCH ACTIVE BLOOD BANKS
  --------------------------------------------------------- */

  const fetchBloodBanks = async () => {
    try {
      setLoadingBanks(true);

      const response = await api.get("/blood-banks");

      setBloodBanks(response.data?.bloodBanks || []);
    } catch (error) {
      console.error("Failed to load blood banks:", error);

      setError(
        getApiErrorMessage(
          error,
          "Failed to load available blood banks."
        )
      );
    } finally {
      setLoadingBanks(false);
    }
  };

  /* ---------------------------------------------------------
     AVAILABILITY
  --------------------------------------------------------- */

  const handleAvailabilityChange = async (isAvailable) => {
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const response = await api.put("/users/availability", {
        is_available: isAvailable,
      });

      setProfile(response.data?.user || profile);

      setMessage(
        isAvailable
          ? "You are now available for blood donation matching."
          : "You are now unavailable for blood donation matching."
      );
    } catch (error) {
      console.error("Failed to update availability:", error);

      setError(
        getApiErrorMessage(
          error,
          "Failed to update availability."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------
     SCHEDULE DONATION
  --------------------------------------------------------- */

  const handleScheduleDonation = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!profile?.blood_group) {
      setError(
        "Please add your blood group to your profile before scheduling a donation."
      );
      return;
    }

    if (!isAvailable) {
      setError(
        "Please set your donation availability to Available before scheduling a donation."
      );
      return;
    }

    if (!bankId) {
      setError("Please select a blood bank.");
      return;
    }

    if (!donationDate) {
      setError("Please select a donation date.");
      return;
    }

    const selectedDate = new Date(`${donationDate}T00:00:00`);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(selectedDate.getTime())) {
      setError("Please select a valid donation date.");
      return;
    }

    if (selectedDate <= today) {
      setError("Donation date must be a future date.");
      return;
    }

    const parsedUnits = Number(units);

    if (!Number.isInteger(parsedUnits) || parsedUnits < 1) {
      setError("Donation units must be at least 1.");
      return;
    }

    try {
      setScheduling(true);

      const response = await api.post("/donations", {
        bank_id: Number(bankId),
        donation_date: donationDate,
        units: parsedUnits,
        notes: notes.trim() || null,
      });

      setMessage(
        response.data?.message ||
          "Your blood donation has been scheduled successfully."
      );

      setBankId("");
      setDonationDate("");
      setUnits("1");
      setNotes("");

      await fetchProfile();
    } catch (error) {
      console.error("Failed to schedule donation:", error);

      setError(
        getApiErrorMessage(
          error,
          "Unable to schedule your donation."
        )
      );
    } finally {
      setScheduling(false);
    }
  };

  /* ---------------------------------------------------------
     HELPERS
  --------------------------------------------------------- */

  const getTodayString = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getTomorrowString = () => {
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getBankLocation = (bank) => {
    return [bank.city, bank.state]
      .filter(Boolean)
      .join(", ");
  };

  /* ---------------------------------------------------------
     DERIVED DATA
  --------------------------------------------------------- */

  const isAvailable =
    profile?.availability_status === "AVAILABLE" ||
    profile?.is_available === true ||
    profile?.is_available === 1;

  const bloodGroup = profile?.blood_group || "";

  /* ---------------------------------------------------------
     LOADING
  --------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <HeartPulse className="mx-auto h-8 w-8 animate-pulse text-red-600" />

          <p className="mt-3 text-gray-600">
            Loading availability...
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bg-linear-to-r from-red-700 via-red-600 to-rose-600 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">

          <div className="flex items-center gap-4">

            <div className="rounded-2xl bg-white/15 p-3">
              <HeartPulse className="h-8 w-8" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Donation Availability
              </h1>

              <p className="text-sm text-red-100">
                Life Link
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={() => navigate("/user/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-4xl px-6 py-10">

        {/* PAGE INTRO */}

        <div className="mb-8">

          <p className="font-semibold uppercase tracking-wide text-red-600">
            Donation Settings
          </p>

          <h2 className="mt-2 text-4xl font-bold text-slate-900">
            Manage Your Availability
          </h2>

          <p className="mt-3 text-lg text-slate-600">
            Choose whether you can currently donate blood and schedule
            a donation with an available blood bank.
          </p>

        </div>

        {/* ===================================================
            GLOBAL MESSAGES
        =================================================== */}

        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <p>{error}</p>
          </div>
        )}

        {/* ===================================================
            CURRENT AVAILABILITY
        =================================================== */}

        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

          <div className="flex items-start gap-5">

            <div
              className={`rounded-2xl p-4 ${
                isAvailable
                  ? "bg-green-100"
                  : "bg-gray-100"
              }`}
            >
              <HeartPulse
                className={`h-9 w-9 ${
                  isAvailable
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                Current Availability
              </h3>

              <p className="mt-2 text-slate-600">
                Your availability controls whether you appear in
                compatible blood request matching results.
              </p>
            </div>

          </div>

          {/* STATUS */}

          <div
            className={`mt-8 rounded-2xl border p-6 ${
              isAvailable
                ? "border-green-200 bg-green-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >

            <div className="flex items-center gap-4">

              {isAvailable ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-gray-500" />
              )}

              <div>

                <p className="text-lg font-bold text-slate-900">
                  {isAvailable
                    ? "Currently Available"
                    : "Currently Unavailable"}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {isAvailable
                    ? "You may be matched with compatible blood requests and can schedule a donation."
                    : "You will not be included in new blood request matching results."}
                </p>

              </div>

            </div>

          </div>

          {/* BLOOD GROUP */}

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                <Droplets className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-500">
                  Your Blood Group
                </p>

                <p className="mt-1 text-xl font-extrabold text-red-700">
                  {bloodGroup || "Not set"}
                </p>
              </div>

            </div>

            {!bloodGroup && (
              <button
                type="button"
                onClick={() => navigate("/user/profile")}
                className="mt-4 text-sm font-bold text-red-600 hover:text-red-700"
              >
                Add your blood group in profile →
              </button>
            )}

          </div>

          {/* AVAILABILITY BUTTONS */}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">

            <button
              type="button"
              disabled={saving || isAvailable}
              onClick={() => handleAvailabilityChange(true)}
              className="rounded-xl bg-green-600 px-5 py-4 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && !isAvailable
                ? "Updating..."
                : "Set Me as Available"}
            </button>

            <button
              type="button"
              disabled={saving || !isAvailable}
              onClick={() => handleAvailabilityChange(false)}
              className="rounded-xl bg-slate-700 px-5 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && isAvailable
                ? "Updating..."
                : "Set Me as Unavailable"}
            </button>

          </div>

        </section>

        {/* ===================================================
            SCHEDULE DONATION
        =================================================== */}

        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

          <div className="flex items-start gap-5">

            <div className="rounded-2xl bg-red-50 p-4">
              <CalendarDays className="h-9 w-9 text-red-600" />
            </div>

            <div>

              <h3 className="text-2xl font-bold text-slate-900">
                Schedule a Donation
              </h3>

              <p className="mt-2 text-slate-600">
                Choose an available Life Link blood bank and a future
                date for your donation.
              </p>

            </div>

          </div>

          {!bloodGroup && (
            <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">

              <div className="flex items-start gap-3">

                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />

                <div>

                  <p className="font-bold text-orange-800">
                    Blood group required
                  </p>

                  <p className="mt-1 text-sm leading-6 text-orange-700">
                    Add your blood group to your profile before
                    scheduling a blood donation.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/user/profile")}
                    className="mt-3 font-bold text-orange-800 hover:underline"
                  >
                    Update profile →
                  </button>

                </div>

              </div>

            </div>
          )}

          {!isAvailable && bloodGroup && (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">

              <div className="flex items-start gap-3">

                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                <div>

                  <p className="font-bold text-blue-900">
                    Set your availability first
                  </p>

                  <p className="mt-1 text-sm leading-6 text-blue-800">
                    You need to be marked as available before
                    scheduling a donation.
                  </p>

                </div>

              </div>

            </div>
          )}

          <form
            onSubmit={handleScheduleDonation}
            className={`mt-8 space-y-6 ${
              !isAvailable || !bloodGroup
                ? "pointer-events-none opacity-60"
                : ""
            }`}
          >

            {/* BLOOD BANK */}

            <div>

              <label
                htmlFor="blood-bank"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Blood Bank
              </label>

              <div className="relative">

                <Building2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <select
                  id="blood-bank"
                  value={bankId}
                  onChange={(event) =>
                    setBankId(event.target.value)
                  }
                  disabled={
                    !isAvailable ||
                    !bloodGroup ||
                    loadingBanks ||
                    scheduling
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-12 py-3.5 text-sm font-medium text-gray-800 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                >

                  <option value="">
                    {loadingBanks
                      ? "Loading blood banks..."
                      : "Select a blood bank"}
                  </option>

                  {bloodBanks.map((bank) => (
                    <option
                      key={bank.bank_id}
                      value={bank.bank_id}
                    >
                      {bank.bank_name}
                      {getBankLocation(bank)
                        ? ` — ${getBankLocation(bank)}`
                        : ""}
                    </option>
                  ))}

                </select>

              </div>

              {!loadingBanks && bloodBanks.length === 0 && (
                <p className="mt-2 text-xs text-red-600">
                  No active blood banks are currently available.
                </p>
              )}

            </div>

            {/* DONATION DATE */}

            <div>

              <label
                htmlFor="donation-date"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Donation Date
              </label>

              <div className="relative">

                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="donation-date"
                  type="date"
                  min={getTomorrowString()}
                  value={donationDate}
                  onChange={(event) =>
                    setDonationDate(event.target.value)
                  }
                  disabled={
                    !isAvailable ||
                    !bloodGroup ||
                    scheduling
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-12 py-3.5 text-sm font-medium text-gray-800 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                />

              </div>

              <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                <Clock3 className="h-3.5 w-3.5" />
                Choose a future donation date.
              </p>

            </div>

            {/* UNITS */}

            <div>

              <label
                htmlFor="donation-units"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Units
              </label>

              <div className="relative">

                <Droplets className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <select
                  id="donation-units"
                  value={units}
                  onChange={(event) =>
                    setUnits(event.target.value)
                  }
                  disabled={
                    !isAvailable ||
                    !bloodGroup ||
                    scheduling
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-12 py-3.5 text-sm font-medium text-gray-800 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  <option value="1">1 unit</option>
                  <option value="2">2 units</option>
                  <option value="3">3 units</option>
                  <option value="4">4 units</option>
                  <option value="5">5 units</option>
                </select>

              </div>

            </div>

            {/* NOTES */}

            <div>

              <label
                htmlFor="donation-notes"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Notes
                <span className="ml-1 font-normal text-gray-400">
                  (optional)
                </span>
              </label>

              <textarea
                id="donation-notes"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                disabled={
                  !isAvailable ||
                  !bloodGroup ||
                  scheduling
                }
                rows={4}
                maxLength={500}
                placeholder="Add any optional information for the blood bank..."
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

              <p className="mt-2 text-right text-xs text-gray-400">
                {notes.length}/500
              </p>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={
                scheduling ||
                !isAvailable ||
                !bloodGroup ||
                !bankId ||
                !donationDate
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-4 font-bold text-white shadow-lg shadow-red-600/10 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {scheduling ? (
                <>
                  <HeartPulse className="h-5 w-5 animate-pulse" />
                  Scheduling Donation...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Schedule Donation
                </>
              )}

            </button>

          </form>

        </section>

        {/* ===================================================
            INFORMATION
        =================================================== */}

        <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">

          <div className="flex gap-4">

            <ShieldCheck className="h-6 w-6 shrink-0 text-blue-600" />

            <div>

              <h3 className="font-bold text-blue-900">
                Important Information
              </h3>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                Keep your availability updated whenever your donation
                status changes. Completing a donation may automatically
                make your account unavailable according to the donation
                interval rules.
              </p>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                Your scheduled donation will be reviewed and completed
                by the selected blood bank. Your donation history will
                appear on your Life Link dashboard.
              </p>

            </div>

          </div>

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
              Secure donation scheduling
            </div>

          </div>

        </footer>

      </main>
    </div>
  );
}

export default Availability;