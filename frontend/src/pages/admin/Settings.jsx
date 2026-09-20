import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ToggleLeft,
  Hash,
  Bell,
  Siren,
  CalendarDays,
  ClipboardList,
  SlidersHorizontal,
} from "lucide-react";

import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const response = await api.get("/admin/settings");

      setSettings(response.data.settings || []);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Failed to load system settings."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleChange = (settingKey, value) => {
    setMessage("");
    setError("");

    setSettings((current) =>
      current.map((setting) =>
        setting.setting_key === settingKey
          ? {
              ...setting,
              setting_value: value,
            }
          : setting
      )
    );
  };

  const handleSave = async (setting) => {
    setMessage("");
    setError("");
    setSavingId(setting.setting_id);

    try {
      await api.put(
        `/admin/settings/${setting.setting_id}`,
        {
          setting_value: String(
            setting.setting_value
          ),
        }
      );

      setMessage(
        `${formatSettingName(
          setting.setting_key
        )} updated successfully.`
      );

      await fetchSettings(false);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Failed to update setting."
        )
      );
    } finally {
      setSavingId(null);
    }
  };

  const renderInput = (setting) => {
    const key = setting.setting_key;

    if (
      key === "emergency_request_enabled" ||
      key === "notifications_enabled"
    ) {
      const enabled =
        String(setting.setting_value).toLowerCase() ===
        "true";

      return (
        <div className="relative">
          <select
            value={enabled ? "true" : "false"}
            onChange={(e) =>
              handleChange(
                key,
                e.target.value
              )
            }
            className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
          >
            <option value="true">
              Enabled
            </option>

            <option value="false">
              Disabled
            </option>
          </select>

          <ToggleLeft className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
      );
    }

    return (
      <div className="relative">
        <input
          type="number"
          min="0"
          value={setting.setting_value}
          onChange={(e) =>
            handleChange(
              key,
              e.target.value
            )
          }
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm font-semibold text-gray-800 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
        />

        <Hash className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    );
  };

  const getSettingIcon = (key) => {
    switch (key) {
      case "minimum_donor_age":
        return CalendarDays;

      case "minimum_donation_interval":
        return CalendarDays;

      case "maximum_blood_request_units":
        return ClipboardList;

      case "emergency_request_enabled":
        return Siren;

      case "low_inventory_threshold":
        return SlidersHorizontal;

      case "notifications_enabled":
        return Bell;

      default:
        return SettingsIcon;
    }
  };

  const getSettingAccent = (key) => {
    switch (key) {
      case "emergency_request_enabled":
        return "bg-red-50 text-red-600";

      case "notifications_enabled":
        return "bg-blue-50 text-blue-600";

      case "low_inventory_threshold":
        return "bg-orange-50 text-orange-600";

      default:
        return "bg-gray-100 text-gray-600";
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
              Loading system settings...
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Retrieving application configuration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
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
                  <SettingsIcon className="h-5 w-5" />

                  <span className="text-sm font-medium">
                    Application Configuration
                  </span>
                </div>

                <h2 className="text-2xl font-bold sm:text-3xl">
                  System Settings
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-red-100 sm:text-base">
                  Configure application rules, request limits,
                  donation requirements, emergency requests,
                  notifications, and inventory thresholds.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchSettings(false)}
                disabled={refreshing}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh Settings
              </button>
            </div>
          </div>
        </section>

        {/* Information Banner */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-800 shadow-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <p className="font-semibold">
              Administrator controls
            </p>

            <p className="mt-1 text-sm leading-5 text-blue-700">
              Changes made here affect application behavior
              system-wide. Save each setting after modifying it.
            </p>
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 shadow-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Setting updated
              </p>

              <p className="mt-1 text-sm">
                {message}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-semibold">
                Unable to update settings
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchSettings(false)}
              className="text-sm font-semibold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Settings */}
        {settings.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
            <SettingsIcon className="mx-auto h-10 w-10 text-gray-300" />

            <h3 className="mt-4 font-bold text-gray-800">
              No settings found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              No system configuration settings are currently
              available.
            </p>
          </div>
        ) : (
          <section className="space-y-4">
            {settings.map((setting) => {
              const Icon = getSettingIcon(
                setting.setting_key
              );

              const iconAccent = getSettingAccent(
                setting.setting_key
              );

              const isSaving =
                savingId === setting.setting_id;

              return (
                <div
                  key={setting.setting_id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                    {/* Setting Information */}
                    <div className="flex flex-1 items-start gap-4">
                      <div
                        className={`shrink-0 rounded-xl p-3 ${iconAccent}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900">
                          {formatSettingName(
                            setting.setting_key
                          )}
                        </h3>

                        {setting.description && (
                          <p className="mt-1.5 text-sm leading-5 text-gray-500">
                            {setting.description}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-gray-400">
                          Setting ID: #
                          {setting.setting_id}
                        </p>
                      </div>
                    </div>

                    {/* Input */}
                    <div className="w-full lg:w-64">
                      {renderInput(setting)}
                    </div>

                    {/* Save */}
                    <div className="w-full lg:w-32">
                      <button
                        type="button"
                        onClick={() =>
                          handleSave(setting)
                        }
                        disabled={savingId !== null}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Bottom Information */}
        {settings.length > 0 && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <SettingsIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />

              <div>
                <h3 className="font-semibold text-gray-800">
                  Configuration management
                </h3>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                  System settings are managed by administrators
                  and changes are recorded for accountability.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-10 border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
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
   Setting Name Formatter
------------------------------------------------------- */

const formatSettingName = (key) => {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

export default Settings;