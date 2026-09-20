import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Droplets,
  FileText,
  HeartPulse,
  Loader2,
  RefreshCw,
  ShieldAlert,
  UserRound,
  XCircle,
} from "lucide-react";

import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";

function Donations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [completingId, setCompletingId] = useState(null);

  const fetchDonations = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/donations/blood-bank");
      setDonations(response.data.donations || []);
    } catch (error) {
      setError(
        getApiErrorMessage(error, "Failed to load donations.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const completeDonation = async (donationId) => {
    setError("");
    setMessage("");

    const confirmed = window.confirm(
      "Are you sure you want to mark this donation as completed?\n\nThis will add the donated units to blood bank inventory."
    );

    if (!confirmed) {
      return;
    }

    try {
      setCompletingId(donationId);

      const response = await api.put(
        `/donations/${donationId}/complete`
      );

      setMessage(
        response.data.message ||
          "Donation completed successfully."
      );

      await fetchDonations();
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Failed to complete donation."
        )
      );
    } finally {
      setCompletingId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-50 text-green-700 ring-1 ring-green-200";

      case "CANCELLED":
        return "bg-gray-100 text-gray-600 ring-1 ring-gray-200";

      default:
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4" />;

      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;

      default:
        return <Clock3 className="h-4 w-4" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalUnits = donations.reduce(
    (total, donation) =>
      total + Number(donation.units || 0),
    0
  );

  const completedDonations = donations.filter(
    (donation) => donation.status === "COMPLETED"
  );

  const completedUnits = completedDonations.reduce(
    (total, donation) =>
      total + Number(donation.units || 0),
    0
  );

  const scheduledCount = donations.filter(
    (donation) => donation.status === "SCHEDULED"
  ).length;

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
                Blood Bank Donations
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

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Hero */}
        <section className="mb-7 overflow-hidden rounded-2xl bg-linear-to-r from-red-600 to-red-500 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-red-100">
                <HeartPulse className="h-5 w-5" />

                <span className="text-sm font-medium">
                  Donation Management
                </span>
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Donations
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-red-100 sm:text-base">
                Review user donations and manage donation
                completion. Completed donations are added to your
                blood inventory automatically.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchDonations}
              disabled={loading}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />

              Refresh
            </button>
          </div>
        </section>

        {/* Alerts */}
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
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Unable to complete action
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        {!loading && donations.length > 0 && (
          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Donations */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-red-50 p-3">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>

                <span className="text-xs font-medium text-gray-400">
                  RECORDS
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Total Donations
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {donations.length}
              </p>
            </div>

            {/* Scheduled */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-50 p-3">
                  <Clock3 className="h-5 w-5 text-blue-600" />
                </div>

                <span className="text-xs font-medium text-gray-400">
                  UPCOMING
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Scheduled Donations
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {scheduledCount}
              </p>
            </div>

            {/* Completed */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-green-50 p-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>

                <span className="text-xs font-medium text-gray-400">
                  COMPLETED
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Completed Donations
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {completedDonations.length}
              </p>
            </div>

            {/* Units */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-purple-50 p-3">
                  <Droplets className="h-5 w-5 text-purple-600" />
                </div>

                <span className="text-xs font-medium text-gray-400">
                  UNITS
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Completed Units
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {completedUnits}
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-red-600" />

            <p className="mt-4 font-medium text-gray-700">
              Loading donations...
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Please wait while we retrieve the latest donation records.
            </p>
          </div>
        ) : donations.length === 0 ? (
          /* Empty */
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <Droplets className="h-8 w-8 text-red-500" />
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-800">
              No donations found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              There are currently no donation records associated
              with this blood bank.
            </p>

            <button
              type="button"
              onClick={fetchDonations}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              Check Again
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Donation Records
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Manage scheduled donations and review completed contributions.
                    </p>
                  </div>

                  <div className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                    {totalUnits} total units
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Donation
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        User
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Blood Group
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Units
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Date
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {donations.map((donation) => {
                      const isCompleting =
                        completingId === donation.donation_id;

                      return (
                        <tr
                          key={donation.donation_id}
                          className="transition hover:bg-gray-50"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-gray-100 p-2">
                                <FileText className="h-4 w-4 text-gray-600" />
                              </div>

                              <div>
                                <p className="font-bold text-gray-800">
                                  #{donation.donation_id}
                                </p>

                                <p className="text-xs text-gray-400">
                                  Donation record
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <UserRound className="h-4 w-4 text-gray-400" />

                              <span className="font-medium text-gray-700">
                                {donation.donor_name || "User"}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 font-bold text-red-600">
                              <Droplets className="h-4 w-4" />
                              {donation.blood_group}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span className="font-semibold text-gray-800">
                              {donation.units}
                            </span>

                            <span className="ml-1 text-sm text-gray-400">
                              units
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CalendarDays className="h-4 w-4 text-gray-400" />
                              {formatDate(donation.donation_date)}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                                donation.status
                              )}`}
                            >
                              {getStatusIcon(donation.status)}
                              {donation.status}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            {donation.status === "SCHEDULED" ? (
                              <button
                                type="button"
                                disabled={isCompleting}
                                onClick={() =>
                                  completeDonation(
                                    donation.donation_id
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isCompleting ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Complete
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-sm font-medium text-gray-400">
                                No action
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="space-y-4 md:hidden">
              {donations.map((donation) => {
                const isCompleting =
                  completingId === donation.donation_id;

                return (
                  <article
                    key={donation.donation_id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-red-50 p-3">
                          <Droplets className="h-5 w-5 text-red-600" />
                        </div>

                        <div>
                          <p className="font-bold text-gray-900">
                            Donation #{donation.donation_id}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {donation.donor_name || "User"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClass(
                          donation.status
                        )}`}
                      >
                        {getStatusIcon(donation.status)}
                        {donation.status}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-red-50 p-3">
                        <p className="text-xs text-red-500">
                          Blood Group
                        </p>

                        <p className="mt-1 text-lg font-bold text-red-700">
                          {donation.blood_group}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">
                          Units
                        </p>

                        <p className="mt-1 text-lg font-bold text-gray-800">
                          {donation.units}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-4 w-4 text-gray-400" />

                        <div>
                          <p className="text-xs text-gray-500">
                            Donation Date
                          </p>

                          <p className="text-sm font-semibold text-gray-800">
                            {formatDate(donation.donation_date)}
                          </p>
                        </div>
                      </div>

                      {donation.notes && (
                        <div className="flex items-start gap-3">
                          <FileText className="mt-0.5 h-4 w-4 text-gray-400" />

                          <div>
                            <p className="text-xs text-gray-500">
                              Notes
                            </p>

                            <p className="text-sm text-gray-700">
                              {donation.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {donation.status === "SCHEDULED" && (
                      <button
                        type="button"
                        disabled={isCompleting}
                        onClick={() =>
                          completeDonation(
                            donation.donation_id
                          )
                        }
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isCompleting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Complete Donation
                          </>
                        )}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>

      <footer className="mt-8 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          Life Link • Blood Donation & Blood Request Management System
        </div>
      </footer>
    </div>
  );
}

export default Donations;