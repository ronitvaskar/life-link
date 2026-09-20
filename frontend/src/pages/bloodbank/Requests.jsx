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

function Requests() {
  const [requests, setRequests] = useState([]);
  const [bankId, setBankId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fulfillingId, setFulfillingId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const [requestsResponse, profileResponse] =
        await Promise.all([
          api.get("/blood-requests/blood-bank"),
          api.get("/blood-banks/profile"),
        ]);

      setRequests(requestsResponse.data.requests || []);

      const profile = profileResponse.data.profile;

      if (profile?.bank_id) {
        setBankId(profile.bank_id);
      } else {
        setError(
          "Blood bank profile information is incomplete. Please update your blood bank profile."
        );
      }
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Failed to load blood requests."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fulfillRequest = async (requestId, remainingUnits) => {
    setError("");
    setMessage("");

    if (!bankId) {
      setError(
        "Blood bank information is unavailable. Please refresh the page and try again."
      );
      return;
    }

    const units = window.prompt(
      `Enter number of units to fulfill (maximum ${remainingUnits}):`,
      remainingUnits
    );

    if (units === null) {
      return;
    }

    const unitsNumber = Number(units);

    if (
      !Number.isInteger(unitsNumber) ||
      unitsNumber <= 0
    ) {
      setError(
        "Please enter a valid positive whole number."
      );
      return;
    }

    if (unitsNumber > remainingUnits) {
      setError(
        `You can fulfill a maximum of ${remainingUnits} remaining unit${
          remainingUnits === 1 ? "" : "s"
        }.`
      );
      return;
    }

    try {
      setFulfillingId(requestId);

      const response = await api.put(
        `/blood-requests/${requestId}/fulfill`,
        {
          bank_id: bankId,
          units: unitsNumber,
        }
      );

      setMessage(
        response.data.message ||
          "Blood request fulfilled successfully."
      );

      await fetchRequests();
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Failed to fulfill blood request."
        )
      );
    } finally {
      setFulfillingId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "FULFILLED":
        return "bg-green-50 text-green-700 ring-1 ring-green-200";

      case "PARTIALLY_FULFILLED":
        return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200";

      case "ACCEPTED":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";

      case "REJECTED":
        return "bg-red-50 text-red-700 ring-1 ring-red-200";

      case "CANCELLED":
        return "bg-gray-100 text-gray-600 ring-1 ring-gray-200";

      default:
        return "bg-orange-50 text-orange-700 ring-1 ring-orange-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "FULFILLED":
        return <CheckCircle2 className="h-4 w-4" />;

      case "PARTIALLY_FULFILLED":
        return <Clock3 className="h-4 w-4" />;

      case "REJECTED":
        return <XCircle className="h-4 w-4" />;

      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;

      default:
        return <Clock3 className="h-4 w-4" />;
    }
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case "EMERGENCY":
        return "bg-red-100 text-red-700 ring-1 ring-red-200";

      case "URGENT":
        return "bg-orange-100 text-orange-700 ring-1 ring-orange-200";

      default:
        return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
    }
  };

  const formatStatus = (status) =>
    status?.replaceAll("_", " ") || "PENDING";

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalRequired = requests.reduce(
    (total, request) =>
      total + Number(request.units_required || 0),
    0
  );

  const totalFulfilled = requests.reduce(
    (total, request) =>
      total + Number(request.units_fulfilled || 0),
    0
  );

  const pendingCount = requests.filter(
    (request) =>
      request.status === "PENDING" ||
      request.status === "ACCEPTED"
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
                Blood Bank Requests
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
        {/* Page heading */}
        <section className="mb-7 overflow-hidden rounded-2xl bg-linear-to-r from-red-600 to-red-500 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-red-100">
                <HeartPulse className="h-5 w-5" />

                <span className="text-sm font-medium">
                  Request Management
                </span>
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Blood Requests
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-red-100 sm:text-base">
                Review incoming blood requests and fulfill them
                using your available inventory.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchRequests}
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

        {/* Summary cards */}
        {!loading && requests.length > 0 && (
          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-red-50 p-3">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>

                <span className="text-xs font-medium text-gray-400">
                  ACTIVE
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Active Requests
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {requests.length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-orange-50 p-3">
                  <Clock3 className="h-5 w-5 text-orange-600" />
                </div>

                <span className="text-xs font-medium text-gray-400">
                  PENDING
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Pending / Accepted
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-50 p-3">
                  <Droplets className="h-5 w-5 text-blue-600" />
                </div>

                <span className="text-xs font-medium text-gray-400">
                  REQUIRED
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Units Requested
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {totalRequired}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-green-50 p-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>

                <span className="text-xs font-medium text-gray-400">
                  FULFILLED
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Units Fulfilled
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {totalFulfilled}
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-red-600" />

            <p className="mt-4 font-medium text-gray-700">
              Loading blood requests...
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Please wait while we retrieve the latest requests.
            </p>
          </div>
        ) : requests.length === 0 ? (
          /* Empty */
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <FileText className="h-8 w-8 text-red-500" />
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-800">
              No active requests
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              There are currently no blood requests available
              for your blood bank to manage.
            </p>

            <button
              type="button"
              onClick={fetchRequests}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              Check Again
            </button>
          </div>
        ) : (
          /* Requests */
          <div className="space-y-5">
            {requests.map((request) => {
              const required = Number(
                request.units_required || 0
              );

              const fulfilled = Number(
                request.units_fulfilled || 0
              );

              const remaining = Math.max(
                required - fulfilled,
                0
              );

              const isFulfilling =
                fulfillingId === request.request_id;

              return (
                <article
                  key={request.request_id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Request top */}
                  <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-red-50 p-3">
                          <FileText className="h-5 w-5 text-red-600" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                              Request #{request.request_id}
                            </h3>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getUrgencyClass(
                                request.urgency
                              )}`}
                            >
                              {request.urgency === "EMERGENCY" && (
                                <ShieldAlert className="h-3.5 w-3.5" />
                              )}

                              {request.urgency || "NORMAL"}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <Building2 className="h-4 w-4" />

                            {request.hospital_name ||
                              "Hospital not specified"}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                          request.status
                        )}`}
                      >
                        {getStatusIcon(request.status)}

                        {formatStatus(request.status)}
                      </span>
                    </div>
                  </div>

                  {/* Main details */}
                  <div className="px-5 py-5 sm:px-6">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                      <div className="rounded-xl bg-red-50 p-4">
                        <div className="flex items-center gap-2 text-sm text-red-600">
                          <Droplets className="h-4 w-4" />
                          Blood Group
                        </div>

                        <p className="mt-2 text-2xl font-bold text-red-700">
                          {request.blood_group}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">
                          Required
                        </p>

                        <p className="mt-2 text-xl font-bold text-gray-900">
                          {required}

                          <span className="ml-1 text-sm font-medium text-gray-500">
                            units
                          </span>
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">
                          Fulfilled
                        </p>

                        <p className="mt-2 text-xl font-bold text-green-600">
                          {fulfilled}

                          <span className="ml-1 text-sm font-medium text-gray-500">
                            units
                          </span>
                        </p>
                      </div>

                      <div className="rounded-xl bg-orange-50 p-4">
                        <p className="text-sm text-orange-600">
                          Remaining
                        </p>

                        <p className="mt-2 text-xl font-bold text-orange-700">
                          {remaining}

                          <span className="ml-1 text-sm font-medium text-orange-600">
                            units
                          </span>
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CalendarDays className="h-4 w-4" />
                          Required By
                        </div>

                        <p className="mt-2 font-bold text-gray-900">
                          {formatDate(
                            request.required_by_date
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-600">
                          Fulfillment Progress
                        </span>

                        <span className="font-semibold text-gray-800">
                          {required > 0
                            ? Math.min(
                                Math.round(
                                  (fulfilled / required) * 100
                                ),
                                100
                              )
                            : 0}
                          %
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-red-600 transition-all"
                          style={{
                            width: `${
                              required > 0
                                ? Math.min(
                                    (fulfilled / required) * 100,
                                    100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-gray-100 p-2">
                          <CalendarDays className="h-4 w-4 text-gray-600" />
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Request Date
                          </p>

                          <p className="text-sm font-semibold text-gray-800">
                            {formatDate(
                              request.request_date
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-gray-100 p-2">
                          <UserRound className="h-4 w-4 text-gray-600" />
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Patient
                          </p>

                          <p className="text-sm font-semibold text-gray-800">
                            {request.patient_name ||
                              "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {request.notes && (
                      <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />

                          <p className="text-sm font-semibold text-gray-700">
                            Request Notes
                          </p>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          {request.notes}
                        </p>
                      </div>
                    )}

                    {/* Action */}
                    {remaining > 0 &&
                      request.status !== "CANCELLED" &&
                      request.status !== "REJECTED" && (
                        <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {remaining} unit
                              {remaining === 1 ? "" : "s"} still required
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Fulfillment will update inventory
                              automatically.
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={
                              isFulfilling || !bankId
                            }
                            onClick={() =>
                              fulfillRequest(
                                request.request_id,
                                remaining
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isFulfilling ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                Fulfill Request
                              </>
                            )}
                          </button>
                        </div>
                      )}

                    {remaining === 0 && (
                      <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />

                        <div>
                          <p className="text-sm font-semibold">
                            Request fully fulfilled
                          </p>

                          <p className="mt-0.5 text-xs text-green-600">
                            All requested units have been supplied.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
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

export default Requests;