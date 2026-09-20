import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  ClipboardPlus,
  Droplets,
  FileText,
  HeartPulse,
  Info,
  Save,
  ShieldAlert,
  Siren,
} from "lucide-react";

import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";

function CreateBloodRequest() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    blood_group: "",
    units_required: "",
    required_by_date: "",
    urgency: "NORMAL",
    hospital_name: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      // Prevent any future cleanup issues if this component
      // is unmounted while a success navigation is pending.
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setMessage("");
    setError("");

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const bloodGroup = formData.blood_group.trim();
    const unitsRequired = Number(formData.units_required);
    const hospitalName = formData.hospital_name.trim();
    const notes = formData.notes.trim();

    if (!bloodGroup) {
      setError("Please select a blood group.");
      return;
    }

    if (
      !Number.isInteger(unitsRequired) ||
      unitsRequired < 1
    ) {
      setError("Units required must be at least 1.");
      return;
    }

    if (!formData.required_by_date) {
      setError("Please select the required-by date.");
      return;
    }

    if (!hospitalName) {
      setError("Please enter the hospital name.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.post("/blood-requests", {
        blood_group: bloodGroup,
        units_required: unitsRequired,
        required_by_date: formData.required_by_date,
        urgency: formData.urgency,
        hospital_name: hospitalName,
        notes: notes || null,
      });

      setMessage(
        response.data?.message ||
          "Blood request created successfully."
      );

      setFormData({
        blood_group: "",
        units_required: "",
        required_by_date: "",
        urgency: "NORMAL",
        hospital_name: "",
        notes: "",
      });

      window.setTimeout(() => {
        navigate("/user/dashboard");
      }, 1200);
    } catch (error) {
      console.error("Failed to create blood request:", error);

      setError(
        getApiErrorMessage(
          error,
          "Failed to create blood request."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-100";

  const labelClass =
    "flex items-center gap-2 text-sm font-semibold text-slate-700";

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-red-500 bg-red-600 text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <HeartPulse size={24} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold sm:text-xl">
                Create Blood Request
              </h1>

              <p className="truncate text-xs text-red-100 sm:text-sm">
                Request blood from compatible users and blood banks
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
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Intro Banner */}
        <div className="mb-6 rounded-2xl bg-linear-to-r from-red-600 to-red-500 p-6 text-white shadow-sm">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 sm:flex">
              <ClipboardPlus size={25} />
            </div>

            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                Request Blood
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-red-50">
                Provide accurate blood and hospital details so
                compatible users and blood banks can respond to
                your request.
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5 text-sm text-green-700">
            <ShieldAlert
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Request created successfully
              </p>

              <p className="mt-0.5">
                {message}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Unable to create request
              </p>

              <p className="mt-0.5">
                {error}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Blood Requirement */}
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Droplets size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Blood Requirement
                  </h3>

                  <p className="text-sm text-slate-500">
                    Specify the blood type and quantity needed
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
              {/* Blood Group */}
              <div>
                <label
                  htmlFor="blood-group"
                  className={labelClass}
                >
                  <Droplets
                    size={16}
                    className="text-red-600"
                  />

                  Blood Group

                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <select
                  id="blood-group"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  required
                  disabled={saving}
                  className={inputClass}
                >
                  <option value="">
                    Select blood group
                  </option>

                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Units */}
              <div>
                <label
                  htmlFor="units-required"
                  className={labelClass}
                >
                  <Droplets size={16} />

                  Units Required

                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="units-required"
                  type="number"
                  name="units_required"
                  value={formData.units_required}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  required
                  disabled={saving}
                  className={inputClass}
                  placeholder="Enter number of units"
                />

                <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                  <Info
                    size={14}
                    className="mt-0.5 shrink-0"
                  />

                  Maximum allowed units are controlled by system
                  settings.
                </p>
              </div>
            </div>
          </section>

          {/* Request Priority */}
          <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Siren size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Request Priority
                  </h3>

                  <p className="text-sm text-slate-500">
                    Tell compatible users how urgently blood is needed
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
              {/* Required Date */}
              <div>
                <label
                  htmlFor="required-by-date"
                  className={labelClass}
                >
                  <CalendarDays size={16} />

                  Required By Date

                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="required-by-date"
                  type="date"
                  name="required_by_date"
                  value={formData.required_by_date}
                  onChange={handleChange}
                  min={today}
                  required
                  disabled={saving}
                  className={inputClass}
                />
              </div>

              {/* Urgency */}
              <div>
                <label
                  htmlFor="urgency"
                  className={labelClass}
                >
                  <Siren size={16} />

                  Urgency
                </label>

                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  disabled={saving}
                  className={inputClass}
                >
                  <option value="NORMAL">
                    Normal
                  </option>

                  <option value="URGENT">
                    Urgent
                  </option>

                  <option value="EMERGENCY">
                    Emergency
                  </option>
                </select>

                <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                  <Info
                    size={14}
                    className="mt-0.5 shrink-0"
                  />

                  Emergency requests may be disabled by the
                  administrator.
                </p>
              </div>
            </div>
          </section>

          {/* Hospital Details */}
          <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Building2 size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Hospital Details
                  </h3>

                  <p className="text-sm text-slate-500">
                    Provide the hospital where blood is required
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <label
                htmlFor="hospital-name"
                className={labelClass}
              >
                <Building2 size={16} />

                Hospital Name

                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                id="hospital-name"
                type="text"
                name="hospital_name"
                value={formData.hospital_name}
                onChange={handleChange}
                required
                disabled={saving}
                className={inputClass}
                placeholder="Enter hospital name"
              />
            </div>
          </section>

          {/* Additional Notes */}
          <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <FileText size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Additional Information
                  </h3>

                  <p className="text-sm text-slate-500">
                    Add any useful information about the request
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <label
                htmlFor="request-notes"
                className={labelClass}
              >
                <FileText size={16} />

                Notes
              </label>

              <textarea
                id="request-notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="5"
                maxLength="1000"
                disabled={saving}
                className={inputClass}
                placeholder="Add any additional information that may help users or blood banks..."
              />

              <p className="mt-2 text-right text-xs text-slate-400">
                {formData.notes.length}/1000
              </p>
            </div>
          </section>

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/user/dashboard"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={17} />

              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating Request...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Blood Request
                </>
              )}
            </button>
          </div>
        </form>

        {/* Safety Information */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
          <Info
            size={19}
            className="mt-0.5 shrink-0"
          />

          <p className="leading-6">
            <span className="font-semibold">
              Important:
            </span>{" "}
            Please verify the blood group, required quantity,
            hospital information, and required date before
            submitting your request.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-4 border-t border-slate-200 bg-white py-6">
        <p className="text-center text-xs text-slate-500">
          Life Link • Blood Donation & Blood Request Management System
        </p>
      </footer>
    </div>
  );
}

export default CreateBloodRequest;