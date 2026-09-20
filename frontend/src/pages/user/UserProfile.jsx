import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  Droplets,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Clock3,
  Save,
} from "lucide-react";

function UserProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);

  const [accountData, setAccountData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [formData, setFormData] = useState({
    blood_group: "",
    date_of_birth: "",
    address: "",
    city: "",
    state: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const [profileResponse, userResponse] = await Promise.all([
        api.get("/users/profile"),
        api.get("/users/me"),
      ]);

      const currentProfile = profileResponse.data.user;
      const currentUser = userResponse.data.user;

      setProfile(currentProfile);
      setUser(currentUser);

      setAccountData({
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        phone: currentUser?.phone || "",
      });

      setFormData({
        blood_group: currentProfile?.blood_group || "",
        date_of_birth: currentProfile?.date_of_birth
          ? String(currentProfile.date_of_birth).substring(0, 10)
          : "",
        address: currentProfile?.address || "",
        city: currentProfile?.city || "",
        state: currentProfile?.state || "",
      });
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Failed to load user profile."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleAccountChange = (event) => {
    const { name, value } = event.target;

    setAccountData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleAccountSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const cleanedAccountData = {
      name: accountData.name.trim(),
      email: accountData.email.trim().toLowerCase(),
      phone: accountData.phone.trim(),
    };

    if (
      !cleanedAccountData.name ||
      !cleanedAccountData.email ||
      !cleanedAccountData.phone
    ) {
      setError("Please complete all account information fields.");
      return;
    }

    setSavingAccount(true);

    try {
      const response = await api.put(
        "/users/me",
        cleanedAccountData
      );

      const updatedUser = response.data.user;

      setUser(updatedUser);

      setAccountData({
        name: updatedUser?.name || "",
        email: updatedUser?.email || "",
        phone: updatedUser?.phone || "",
      });

      setMessage(
        "Account information updated successfully."
      );
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Failed to update account information."
        )
      );
    } finally {
      setSavingAccount(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const cleanedFormData = {
      blood_group: formData.blood_group.trim(),
      date_of_birth: formData.date_of_birth,
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
    };

    if (
      !cleanedFormData.blood_group ||
      !cleanedFormData.date_of_birth ||
      !cleanedFormData.address ||
      !cleanedFormData.city ||
      !cleanedFormData.state
    ) {
      setError(
        "Please complete all user profile fields."
      );
      return;
    }

    setSavingProfile(true);

    try {
      const response = await api.post(
        "/users/profile",
        cleanedFormData
      );

      setProfile(response.data.user || profile);

      setMessage(
        "User profile saved successfully."
      );
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Failed to save user profile."
        )
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-red-100 border-t-red-600" />

          <p className="mt-4 text-gray-600">
            Loading user profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-linear-to-r from-red-700 via-red-600 to-rose-600 text-white shadow-lg">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <Droplets className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-xl font-bold">
                  User Profile
                </h1>

                <p className="text-sm text-red-100">
                  Life Link
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/user/dashboard")}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Page Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            User Account
          </p>

          <h2 className="mt-1 text-3xl font-bold text-gray-900">
            My User Profile
          </h2>

          <p className="mt-2 text-gray-600">
            View your account information and keep your
            blood donation and personal details up to date.
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Account Information */}
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Account Information
              </h3>

              <p className="text-sm text-gray-500">
                Update your name, email address and phone number.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAccountSubmit}
            className="mt-6 space-y-5"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="account_name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Full Name
              </label>

              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="account_name"
                  name="name"
                  type="text"
                  required
                  value={accountData.name}
                  onChange={handleAccountChange}
                  autoComplete="name"
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="account_email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="account_email"
                  name="email"
                  type="email"
                  required
                  value={accountData.email}
                  onChange={handleAccountChange}
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="account_phone"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Phone Number
              </label>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="account_phone"
                  name="phone"
                  type="tel"
                  required
                  value={accountData.phone}
                  onChange={handleAccountChange}
                  autoComplete="tel"
                  className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Save Account */}
            <div className="flex justify-end border-t border-gray-100 pt-5">
              <button
                type="submit"
                disabled={savingAccount}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-5 w-5" />

                {savingAccount
                  ? "Saving..."
                  : "Save Account Information"}
              </button>
            </div>
          </form>
        </section>

        {/* User Information */}
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Droplets className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">
                User Information
              </h3>

              <p className="text-sm text-gray-500">
                Important information used for blood donation
                and blood request matching.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Blood Group */}
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm text-gray-500">
                Blood Group
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {profile?.blood_group || "Not set"}
              </p>
            </div>

            {/* Date of Birth */}
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays className="h-4 w-4" />
                Date of Birth
              </div>

              <p className="mt-2 font-semibold text-gray-900">
                {formatDate(profile?.date_of_birth)}
              </p>
            </div>

            {/* Gender */}
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Gender
              </p>

              <p className="mt-2 font-semibold text-gray-900">
                {profile?.gender || "Not provided"}
              </p>
            </div>

            {/* Last Donation */}
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock3 className="h-4 w-4" />
                Last Donation
              </div>

              <p className="mt-2 font-semibold text-gray-900">
                {profile?.last_donation_date
                  ? formatDate(profile.last_donation_date)
                  : "No donation recorded"}
              </p>
            </div>
          </div>
        </section>

        {/* Editable Profile */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <MapPin className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Update User Details
              </h3>

              <p className="text-sm text-gray-500">
                Update your blood group, date of birth and address.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6"
          >
            {/* Blood Group + DOB */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="blood_group"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Blood Group
                </label>

                <select
                  id="blood_group"
                  name="blood_group"
                  required
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
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

              <div>
                <label
                  htmlFor="date_of_birth"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Date of Birth
                </label>

                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  required
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  autoComplete="bday"
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Address
              </label>

              <textarea
                id="address"
                name="address"
                rows="3"
                required
                value={formData.address}
                onChange={handleChange}
                autoComplete="street-address"
                className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                placeholder="Enter your address"
              />
            </div>

            {/* City + State */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  autoComplete="address-level2"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  State
                </label>

                <input
                  id="state"
                  name="state"
                  type="text"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  autoComplete="address-level1"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                  placeholder="Enter state"
                />
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end border-t border-gray-100 pt-6">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-5 w-5" />

                {savingProfile
                  ? "Saving..."
                  : "Save User Profile"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default UserProfile;