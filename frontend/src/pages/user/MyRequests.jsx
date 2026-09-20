import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Droplets,
  HeartPulse,
  Hospital,
  Plus,
  RefreshCw,
  Siren,
} from "lucide-react";

import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/blood-requests/my");

      setRequests(
        Array.isArray(response.data?.requests)
          ? response.data.requests
          : []
      );
    } catch (error) {
      console.error("Failed to load blood requests:", error);

      setError(
        getApiErrorMessage(
          error,
          "Failed to load your blood requests."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "FULFILLED":
        return "bg-green-100 text-green-700 border-green-200";

      case "PARTIALLY_FULFILLED":
        return "bg-amber-100 text-amber-700 border-amber-200";

      case "ACCEPTED":
        return "bg-blue-100 text-blue-700 border-blue-200";

      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";

      case "CANCELLED":
        return "bg-slate-100 text-slate-600 border-slate-200";

      default:
        return "bg-orange-100 text-orange-700 border-orange-200";
    }
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case "EMERGENCY":
        return "text-red-600 bg-red-50";

      case "URGENT":
        return "text-orange-600 bg-orange-50";

      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  const formatStatus = (status) => {
    return status?.replaceAll("_", " ") || "PENDING";
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not specified";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-red-500 bg-red-600 text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <HeartPulse size={24} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold sm:text-xl">
                My Blood Requests
              </h1>

              <p className="truncate text-xs text-red-100 sm:text-sm">
                Track and manage your blood requests
              </p>
            </div>
          </div>

          <Link
            to="/user/dashboard"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:px-4"
          >
            <ArrowLeft size={17} />

            <span className="hidden sm:inline">
              Back to Dashboard
            </span>

            <span className="sm:hidden">
              Back
            </span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Page heading */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-600">
              <ClipboardList size={17} />
              Request Management
            </div>

            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              My Blood Requests
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              View the blood requests you have created and monitor
              their current fulfillment status.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={fetchRequests}
              disabled={loading}
              aria-label="Refresh blood requests"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />

              Refresh
            </button>

            <Link
              to="/user/create-request"
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              <Plus size={17} />

              <span className="hidden sm:inline">
                New Request
              </span>

              <span className="sm:hidden">
                New
              </span>
            </Link>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="h-6 w-40 rounded bg-slate-200" />
                    <div className="mt-2 h-4 w-52 rounded bg-slate-200" />
                  </div>

                  <div className="h-7 w-28 rounded-full bg-slate-200" />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map(
                    (_, itemIndex) => (
                      <div key={itemIndex}>
                        <div className="h-3 w-20 rounded bg-slate-200" />

                        <div className="mt-2 h-5 w-24 rounded bg-slate-200" />
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={21}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div className="flex-1">
                <h3 className="font-semibold text-red-800">
                  Unable to load requests
                </h3>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchRequests}
                  className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <RefreshCw size={15} />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && requests.length === 0 && (
          <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Droplets size={30} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-900">
              No blood requests yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You have not created any blood requests. Create a
              request when you need compatible blood from other
              users or blood banks.
            </p>

            <Link
              to="/user/create-request"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              <Plus size={18} />
              Create Blood Request
            </Link>
          </div>
        )}

        {/* Request list */}
        {!loading && !error && requests.length > 0 && (
          <div className="space-y-5">
            {requests.map((request) => {
              const unitsRequired =
                Number(request.units_required) || 0;

              const unitsFulfilled =
                Number(request.units_fulfilled) || 0;

              const progress =
                unitsRequired > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (unitsFulfilled / unitsRequired) * 100
                      )
                    )
                  : 0;

              return (
                <article
                  key={request.request_id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
                >
                  {/* Request header */}
                  <div className="border-b border-slate-100 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                          <ClipboardList size={21} />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">
                              Request #{request.request_id}
                            </h3>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getUrgencyClass(
                                request.urgency
                              )}`}
                            >
                              <span className="inline-flex items-center gap-1">
                                <Siren size={12} />
                                {request.urgency || "NORMAL"}
                              </span>
                            </span>
                          </div>

                          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                            <Hospital size={15} />

                            {request.hospital_name ||
                              "Hospital not specified"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClass(
                          request.status
                        )}`}
                      >
                        {formatStatus(request.status)}
                      </span>
                    </div>
                  </div>

                  {/* Request information */}
                  <div className="p-5 sm:p-6">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl bg-red-50 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-red-600">
                          <Droplets size={15} />
                          Blood Group
                        </div>

                        <p className="mt-2 text-xl font-bold text-slate-900">
                          {request.blood_group || "—"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Units Required
                        </p>

                        <p className="mt-2 text-xl font-bold text-slate-900">
                          {unitsRequired}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Units Fulfilled
                        </p>

                        <p className="mt-2 text-xl font-bold text-slate-900">
                          {unitsFulfilled}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <CalendarDays size={15} />
                          Required By
                        </div>

                        <p className="mt-2 text-sm font-bold text-slate-900">
                          {formatDate(request.required_by_date)}
                        </p>
                      </div>
                    </div>

                    {/* Fulfillment progress */}
                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-700">
                          Fulfillment Progress
                        </p>

                        <p className="text-sm font-bold text-red-600">
                          {progress}%
                        </p>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-red-600 transition-all duration-500"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        {unitsFulfilled} of {unitsRequired} units
                        fulfilled
                      </p>
                    </div>

                    {/* Action */}
                    <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                      <Link
                        to={`/user/requests/${request.request_id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 sm:w-auto"
                      >
                        View Request Details
                        <ChevronRight size={17} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-6 border-t border-slate-200 bg-white py-6">
        <p className="text-center text-xs text-slate-500">
          Life Link • Blood Donation & Blood Request Management System
        </p>
      </footer>
    </div>
  );
}

export default MyRequests;