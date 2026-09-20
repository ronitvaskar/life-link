import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  Database,
  HeartPulse,
  ClipboardList,
  Package,
  Building2,
  CheckCircle2,
  FileBarChart,
} from "lucide-react";

import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const response = await api.get("/admin/reports");

      setReports(response.data);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Failed to load reports."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />

        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="text-center">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-red-600" />

            <p className="mt-4 font-semibold text-gray-700">
              Loading reports...
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Preparing system-wide reports and statistics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

              <div className="flex-1">
                <h2 className="font-bold text-red-800">
                  Unable to load reports
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => fetchReports(false)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const monthlyDonations =
    reports?.monthly_donations || [];

  const monthlyRequests =
    reports?.monthly_requests || [];

  const inventoryByGroup =
    reports?.inventory_by_group || [];

  const requestedGroups =
    reports?.most_requested_groups || [];

  const donatedGroups =
    reports?.most_donated_groups || [];

  const requestStatuses =
    reports?.request_statuses || [];

  const bankPerformance =
    reports?.blood_bank_performance || [];

  const totalDonatedUnits = monthlyDonations.reduce(
    (total, row) =>
      total + Number(row.total_units || 0),
    0
  );

  const totalRequestedUnits = monthlyRequests.reduce(
    (total, row) =>
      total + Number(row.units_requested || 0),
    0
  );

  const totalFulfilledUnits = monthlyRequests.reduce(
    (total, row) =>
      total + Number(row.units_fulfilled || 0),
    0
  );

  const totalInventoryUnits = inventoryByGroup.reduce(
    (total, row) =>
      total + Number(row.units_available || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Page Header */}
        <section className="mb-8">
          <Link
            to="/admin/dashboard"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>

          <div className="overflow-hidden rounded-2xl bg-linear-to-r from-red-600 to-red-500 p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2 text-red-100">
                  <FileBarChart className="h-5 w-5" />

                  <span className="text-sm font-medium">
                    System Analytics
                  </span>
                </div>

                <h2 className="text-2xl font-bold sm:text-3xl">
                  Life Link Reports
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-red-100 sm:text-base">
                  Review system-wide donation, blood request,
                  inventory, and blood bank performance data.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchReports(false)}
                disabled={refreshing}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />

                Refresh Reports
              </button>
            </div>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="mb-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              icon={HeartPulse}
              title="Donated Units"
              value={totalDonatedUnits}
              description="Reported donation units"
              iconClass="bg-red-50 text-red-600"
            />

            <SummaryCard
              icon={ClipboardList}
              title="Requested Units"
              value={totalRequestedUnits}
              description="Units requested"
              iconClass="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              icon={CheckCircle2}
              title="Fulfilled Units"
              value={totalFulfilledUnits}
              description="Units fulfilled"
              iconClass="bg-green-50 text-green-600"
            />

            <SummaryCard
              icon={Package}
              title="Current Inventory"
              value={totalInventoryUnits}
              description="Available blood units"
              iconClass="bg-purple-50 text-purple-600"
            />
          </div>
        </section>

        {/* Report Sections */}
        <div className="space-y-6">
          <ReportSection
            title="Monthly Donations"
            description="Donation activity grouped by month."
            icon={HeartPulse}
            data={monthlyDonations}
            columns={[
              "month",
              "donation_count",
              "total_units",
            ]}
          />

          <ReportSection
            title="Monthly Blood Requests"
            description="Blood request activity and fulfillment by month."
            icon={ClipboardList}
            data={monthlyRequests}
            columns={[
              "month",
              "request_count",
              "units_requested",
              "units_fulfilled",
            ]}
          />

          <ReportSection
            title="Inventory Summary"
            description="Current available blood inventory by blood group."
            icon={Package}
            data={inventoryByGroup}
            columns={[
              "blood_group",
              "units_available",
            ]}
          />

          <ReportSection
            title="Most Requested Blood Groups"
            description="Blood groups with the highest request activity."
            icon={BarChart3}
            data={requestedGroups}
            columns={[
              "blood_group",
              "request_count",
              "units_requested",
            ]}
          />

          <ReportSection
            title="Most Donated Blood Groups"
            description="Blood groups with the highest donation activity."
            icon={HeartPulse}
            data={donatedGroups}
            columns={[
              "blood_group",
              "donation_count",
              "units_donated",
            ]}
          />

          <ReportSection
            title="Fulfilled vs Rejected Requests"
            description="Overview of blood request outcomes."
            icon={CheckCircle2}
            data={requestStatuses}
            columns={[
              "status",
              "request_count",
            ]}
          />

          <ReportSection
            title="Blood Bank Performance"
            description="Donation and inventory performance across blood banks."
            icon={Building2}
            data={bankPerformance}
            columns={[
              "bank_name",
              "city",
              "completed_donations",
              "donated_units",
              "current_inventory",
            ]}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-10 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          Life Link • Blood Donation & Blood Request Management System
        </div>
      </footer>
    </div>
  );
};

/* -------------------------------------------------------
   Admin Header
------------------------------------------------------- */

const AdminHeader = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-red-700 bg-red-600 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/15 p-2.5">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-lg font-bold sm:text-xl">
              Life Link
            </h1>

            <p className="text-xs text-red-100 sm:text-sm">
              Administration Panel
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-lg bg-white/10 px-3 py-2 sm:flex">
          <ShieldCheck className="h-4 w-4" />

          <span className="text-sm font-semibold">
            Administrator
          </span>
        </div>
      </div>
    </header>
  );
};

/* -------------------------------------------------------
   Summary Card
------------------------------------------------------- */

const SummaryCard = ({
  icon: Icon,
  title,
  value,
  description,
  iconClass,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900">
            {value.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------
   Report Section
------------------------------------------------------- */

const ReportSection = ({
  title,
  description,
  icon: Icon,
  data,
  columns,
}) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-2.5">
            <Icon className="h-5 w-5 text-red-600" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {title}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!data || data.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <Database className="mx-auto h-10 w-10 text-gray-300" />

          <p className="mt-3 font-semibold text-gray-700">
            No data available
          </p>

          <p className="mt-1 text-sm text-gray-500">
            There is currently no report data for this section.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {formatColumnName(column)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {data.map((row, index) => (
                  <tr
                    key={index}
                    className="transition hover:bg-gray-50"
                  >
                    {columns.map((column) => (
                      <td
                        key={column}
                        className="whitespace-nowrap px-5 py-4 text-sm text-gray-700"
                      >
                        <FormattedValue
                          column={column}
                          value={row[column]}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="divide-y divide-gray-100 md:hidden">
            {data.map((row, index) => (
              <div
                key={index}
                className="space-y-3 p-5"
              >
                {columns.map((column) => (
                  <div
                    key={column}
                    className="flex items-start justify-between gap-4"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {formatColumnName(column)}
                    </span>

                    <span className="text-right text-sm font-medium text-gray-800">
                      <FormattedValue
                        column={column}
                        value={row[column]}
                      />
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

/* -------------------------------------------------------
   Value Formatting
------------------------------------------------------- */

const FormattedValue = ({ column, value }) => {
  if (value === null || value === undefined || value === "") {
    return <span className="text-gray-400">-</span>;
  }

  if (column === "status") {
    const statusClass =
      value === "FULFILLED"
        ? "bg-green-50 text-green-700 border-green-200"
        : value === "REJECTED"
        ? "bg-red-50 text-red-700 border-red-200"
        : value === "CANCELLED"
        ? "bg-gray-50 text-gray-600 border-gray-200"
        : "bg-yellow-50 text-yellow-700 border-yellow-200";

    return (
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}
      >
        {String(value).replace(/_/g, " ")}
      </span>
    );
  }

  if (column === "blood_group") {
    return (
      <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
        {value}
      </span>
    );
  }

  if (
    typeof value === "number" ||
    [
      "donation_count",
      "total_units",
      "request_count",
      "units_requested",
      "units_fulfilled",
      "units_available",
      "units_donated",
      "completed_donations",
      "donated_units",
      "current_inventory",
    ].includes(column)
  ) {
    return Number(value).toLocaleString();
  }

  return value;
};

/* -------------------------------------------------------
   Column Name Formatter
------------------------------------------------------- */

const formatColumnName = (column) => {
  return column
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

export default Reports;