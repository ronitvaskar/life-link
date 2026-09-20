import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Droplets,
  FileText,
  Hospital,
  MessageCircle,
  RefreshCw,
  UserRound,
  Users,
  AlertTriangle,
} from "lucide-react";
import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";

function RequestDetails() {
  const { request_id } = useParams();

  const [request, setRequest] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const [requestResponse, responsesResponse] = await Promise.all([
        api.get(`/blood-requests/${request_id}`),
        api.get(`/blood-requests/${request_id}/responses`),
      ]);

      setRequest(requestResponse.data.request);
      setResponses(responsesResponse.data.responses || []);
    } catch (error) {
      setError(
        getApiErrorMessage(error, "Failed to load request details.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [request_id]);

  const getStatusClass = (status) => {
    switch (status) {
      case "FULFILLED":
        return "bg-green-100 text-green-700 border-green-200";
      case "PARTIALLY_FULFILLED":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-orange-100 text-orange-700 border-orange-200";
    }
  };

  const getResponseStatusClass = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-700 border-green-200";
      case "INTERESTED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "COMPLETED":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case "EMERGENCY":
        return "bg-red-100 text-red-700 border-red-200";
      case "URGENT":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "-";
    return status.replaceAll("_", " ");
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString();
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-30 bg-red-600 text-white shadow-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <div>
              <h1 className="text-lg font-bold sm:text-xl">
                Life Link
              </h1>

              <p className="text-xs text-red-100 sm:text-sm">
                Request Details
              </p>
            </div>

            <Link
              to="/user/requests"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:px-4"
            >
              <ArrowLeft size={16} />

              <span className="hidden sm:inline">
                Back
              </span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 rounded-lg bg-gray-200" />

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-6 h-7 w-56 rounded bg-gray-200" />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index}>
                    <div className="mb-2 h-4 w-24 rounded bg-gray-200" />
                    <div className="h-6 w-32 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>

            <div className="h-40 rounded-2xl bg-white shadow-sm" />
            <div className="h-56 rounded-2xl bg-white shadow-sm" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-30 bg-red-600 text-white shadow-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <div>
              <h1 className="text-lg font-bold sm:text-xl">
                Life Link
              </h1>

              <p className="text-xs text-red-100 sm:text-sm">
                Request Details
              </p>
            </div>

            <Link
              to="/user/requests"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:px-4"
            >
              <ArrowLeft size={16} />

              <span className="hidden sm:inline">
                Back
              </span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle
                className="text-red-600"
                size={28}
              />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-800">
              Unable to Load Request
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-gray-600">
              {error}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={fetchDetails}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <RefreshCw size={17} />
                Try Again
              </button>

              <Link
                to="/user/requests"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
              >
                <ArrowLeft size={17} />
                Back to My Requests
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const unitsRequired = Number(request.units_required || 0);
  const unitsFulfilled = Number(request.units_fulfilled || 0);
  const remainingUnits = Math.max(
    unitsRequired - unitsFulfilled,
    0
  );

  const fulfillmentPercentage =
    unitsRequired > 0
      ? Math.min(
          (unitsFulfilled / unitsRequired) * 100,
          100
        )
      : 0;

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
              Request Details
            </p>
          </div>

          <Link
            to="/user/requests"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:px-4"
          >
            <ArrowLeft size={16} />

            <span className="hidden sm:inline">
              Back to Requests
            </span>

            <span className="sm:hidden">
              Back
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Page Heading */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-600">
                <FileText size={17} />
                Blood Request Management
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Request #{request.request_id}
              </h2>

              <p className="mt-2 max-w-2xl text-gray-600">
                Review your blood request, fulfillment progress,
                and user responses.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClass(
                  request.status
                )}`}
              >
                {request.status === "FULFILLED" && (
                  <CheckCircle2
                    className="mr-2"
                    size={16}
                  />
                )}

                {formatStatus(request.status)}
              </span>

              <span
                className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${getUrgencyClass(
                  request.urgency
                )}`}
              >
                <AlertTriangle
                  className="mr-2"
                  size={16}
                />

                {request.urgency}
              </span>
            </div>
          </div>
        </div>

        {/* Request Summary */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="border-b border-gray-100 bg-linear-to-r from-red-50 to-white px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
                <Droplets
                  className="text-red-600"
                  size={22}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Request Information
                </h3>

                <p className="text-sm text-gray-500">
                  Details submitted with this blood request
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Droplets size={16} />
                  Blood Group
                </div>

                <p className="mt-2 text-xl font-bold text-red-600">
                  {request.blood_group}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Droplets size={16} />
                  Units Required
                </div>

                <p className="mt-2 text-xl font-bold text-gray-900">
                  {unitsRequired}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle2 size={16} />
                  Units Fulfilled
                </div>

                <p className="mt-2 text-xl font-bold text-green-600">
                  {unitsFulfilled}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock3 size={16} />
                  Remaining Units
                </div>

                <p className="mt-2 text-xl font-bold text-orange-600">
                  {remainingUnits}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Hospital size={16} />
                  Hospital
                </div>

                <p className="mt-2 font-semibold text-gray-900">
                  {request.hospital_name || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarDays size={16} />
                  Required By
                </div>

                <p className="mt-2 font-semibold text-gray-900">
                  {formatDate(request.required_by_date)}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarDays size={16} />
                  Request Date
                </div>

                <p className="mt-2 font-semibold text-gray-900">
                  {formatDate(request.request_date)}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <AlertTriangle size={16} />
                  Urgency
                </div>

                <span
                  className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${getUrgencyClass(
                    request.urgency
                  )}`}
                >
                  {request.urgency}
                </span>
              </div>
            </div>

            {request.notes && (
              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex items-start gap-3">
                  <MessageCircle
                    className="mt-0.5 shrink-0 text-blue-600"
                    size={19}
                  />

                  <div>
                    <p className="font-semibold text-blue-900">
                      Request Notes
                    </p>

                    <p className="mt-1 text-sm leading-6 text-blue-800">
                      {request.notes}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Fulfillment Progress */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  <CheckCircle2
                    className="text-green-600"
                    size={21}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Fulfillment Progress
                  </h3>

                  <p className="text-sm text-gray-500">
                    Track how much of your request has been
                    fulfilled.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-2xl font-bold text-gray-900">
                {unitsFulfilled} / {unitsRequired}
              </p>

              <p className="text-sm text-gray-500">
                units fulfilled
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium text-gray-600">
                Fulfillment
              </span>

              <span className="font-bold text-red-600">
                {Math.round(fulfillmentPercentage)}%
              </span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-red-600 transition-all duration-500"
                style={{
                  width: `${fulfillmentPercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {unitsRequired}
              </p>

              <p className="text-sm text-gray-500">
                Required
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {unitsFulfilled}
              </p>

              <p className="text-sm text-gray-500">
                Fulfilled
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {remainingUnits}
              </p>

              <p className="text-sm text-gray-500">
                Remaining
              </p>
            </div>
          </div>
        </section>

        {/* User Responses */}
        <section className="mt-6 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                  <Users
                    className="text-blue-600"
                    size={22}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    User Responses
                  </h3>

                  <p className="text-sm text-gray-500">
                    Users who have responded to this request
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700">
                {responses.length}{" "}
                {responses.length === 1
                  ? "Response"
                  : "Responses"}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {responses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                  <UserRound
                    className="text-blue-600"
                    size={26}
                  />
                </div>

                <h4 className="mt-4 text-lg font-semibold text-gray-800">
                  No User Responses Yet
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Responses will appear here when eligible users
                  respond to your blood request.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {responses.map((response) => (
                  <div
                    key={response.response_id}
                    className="rounded-xl border border-gray-200 p-5 transition hover:border-gray-300 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
                          <UserRound
                            className="text-red-600"
                            size={21}
                          />
                        </div>

                        <div>
                          <h4 className="font-bold text-gray-900">
                            {response.user_name ||
                              response.donor_name ||
                              "User"}
                          </h4>

                          <p className="mt-1 text-sm text-gray-500">
                            Blood Group:{" "}
                            <span className="font-semibold text-gray-700">
                              {response.blood_group || "-"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-sm font-semibold ${getResponseStatusClass(
                          response.response_status
                        )}`}
                      >
                        {formatStatus(
                          response.response_status
                        )}
                      </span>
                    </div>

                    {response.notes && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-4">
                        <div className="flex items-start gap-2">
                          <MessageCircle
                            className="mt-0.5 shrink-0 text-gray-500"
                            size={16}
                          />

                          <p className="text-sm leading-6 text-gray-600">
                            {response.notes}
                          </p>
                        </div>
                      </div>
                    )}

                    {response.response_date && (
                      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                        <Clock3 size={14} />

                        Responded on{" "}
                        {formatDateTime(
                          response.response_date
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link
            to="/user/requests"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-900"
          >
            <ArrowLeft size={17} />
            Back to My Requests
          </Link>

          <Link
            to="/user/create-request"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <Droplets size={17} />
            Create New Request
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-500 sm:px-6">
          © {new Date().getFullYear()} Life Link. Helping connect
          people with blood support.
        </div>
      </footer>
    </div>
  );
}

export default RequestDetails;