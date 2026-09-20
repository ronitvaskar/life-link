import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Droplets,
  Package,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchInventory = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.get("/inventory/dashboard");
      setInventory(response.data.inventory || []);
    } catch (error) {
      setError(
        getApiErrorMessage(error, "Failed to load inventory.")
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const getStockStatus = (units) => {
    const value = Number(units || 0);

    if (value === 0) {
      return {
        label: "Out of Stock",
        className: "border-red-200 bg-red-50 text-red-700",
        icon: AlertTriangle,
      };
    }

    if (value <= 5) {
      return {
        label: "Low Stock",
        className: "border-orange-200 bg-orange-50 text-orange-700",
        icon: AlertTriangle,
      };
    }

    return {
      label: "Available",
      className: "border-green-200 bg-green-50 text-green-700",
      icon: CheckCircle2,
    };
  };

  const totalUnits = inventory.reduce(
    (total, item) =>
      total + Number(item.units_available || 0),
    0
  );

  const lowStockCount = inventory.filter(
    (item) => Number(item.units_available || 0) <= 5
  ).length;

  const availableCount = inventory.filter(
    (item) => Number(item.units_available || 0) > 5
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-red-700 bg-red-600 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Droplets className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold sm:text-xl">
                Life Link
              </h1>

              <p className="text-xs text-red-100 sm:text-sm">
                Blood Inventory Management
              </p>
            </div>
          </div>

          <Link
            to="/blood-bank/dashboard"
            className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:px-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              Back to Dashboard
            </span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Page Heading */}
        <section className="mb-8 overflow-hidden rounded-2xl bg-linear-to-r from-red-600 via-red-600 to-rose-600 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-red-100">
                <Package className="h-4 w-4" />
                Inventory Management
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Blood Inventory
              </h2>

              <p className="mt-2 text-sm leading-6 text-red-100 sm:text-base">
                Monitor available blood units across all blood
                groups and quickly identify stock that needs
                attention.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs text-red-100">
                  Inventory Status
                </p>

                <p className="font-semibold">
                  Live Overview
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-semibold">
                  Unable to load inventory
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchInventory(true)}
              disabled={refreshing}
              className="flex w-fit items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Try Again
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Total Units */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Available Units
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-800">
                  {loading ? (
                    <span className="inline-block h-9 w-20 animate-pulse rounded bg-slate-200" />
                  ) : (
                    totalUnits
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Across all blood groups
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                <Package className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Available Groups */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Healthy Stock Groups
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-800">
                  {loading ? (
                    <span className="inline-block h-9 w-12 animate-pulse rounded bg-slate-200" />
                  ) : (
                    availableCount
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Above low-stock threshold
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Low Stock */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Low / Empty Groups
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-800">
                  {loading ? (
                    <span className="inline-block h-9 w-12 animate-pulse rounded bg-slate-200" />
                  ) : (
                    lowStockCount
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Groups needing attention
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </section>

        {/* Inventory Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Inventory Details
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Current stock level for each blood group.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchInventory(true)}
              disabled={refreshing}
              className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-5 sm:p-6">
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex animate-pulse items-center gap-4 rounded-xl bg-slate-50 p-5"
                  >
                    <div className="h-10 w-10 rounded-full bg-slate-200" />
                    <div className="h-4 w-24 rounded bg-slate-200" />
                    <div className="ml-auto h-4 w-16 rounded bg-slate-200" />
                    <div className="h-6 w-24 rounded-full bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          ) : inventory.length === 0 ? (
            <div className="p-10 text-center sm:p-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Package className="h-8 w-8 text-slate-400" />
              </div>

              <h3 className="mt-5 text-xl font-semibold text-slate-800">
                No inventory found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                There are currently no inventory records available
                for this blood bank.
              </p>

              <button
                type="button"
                onClick={() => fetchInventory(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Inventory
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Blood Group
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Units Available
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Last Updated
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {inventory.map((item) => {
                      const stockStatus = getStockStatus(
                        item.units_available
                      );

                      const StatusIcon = stockStatus.icon;

                      return (
                        <tr
                          key={item.blood_group}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                <Droplets className="h-5 w-5 text-red-600" />
                              </div>

                              <span className="text-lg font-bold text-red-600">
                                {item.blood_group}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span className="text-lg font-bold text-slate-800">
                              {Number(item.units_available || 0)}
                            </span>

                            <span className="ml-1 text-sm text-slate-500">
                              units
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${stockStatus.className}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {stockStatus.label}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-500">
                            {item.last_updated
                              ? new Date(
                                  item.last_updated
                                ).toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 p-4 md:hidden">
                {inventory.map((item) => {
                  const stockStatus = getStockStatus(
                    item.units_available
                  );

                  const StatusIcon = stockStatus.icon;

                  return (
                    <div
                      key={item.blood_group}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
                            <Droplets className="h-5 w-5 text-red-600" />
                          </div>

                          <div>
                            <p className="text-lg font-bold text-red-600">
                              {item.blood_group}
                            </p>

                            <p className="text-xs text-slate-500">
                              Blood group
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-800">
                            {Number(item.units_available || 0)}
                          </p>

                          <p className="text-xs text-slate-500">
                            units
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${stockStatus.className}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {stockStatus.label}
                        </span>

                        <span className="text-right text-xs text-slate-500">
                          {item.last_updated
                            ? new Date(
                                item.last_updated
                              ).toLocaleString()
                            : "-"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Information */}
        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

            <div>
              <h4 className="font-semibold text-blue-900">
                Inventory Monitoring
              </h4>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Blood groups with five units or fewer are shown as
                low stock. Groups with zero available units are
                marked as out of stock so they can be addressed
                quickly.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 pt-6 text-center">
          <p className="text-sm text-slate-500">
            Life Link • Blood Donation & Blood Request Management System
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Safe and organized blood inventory management.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default Inventory;