import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { getApiErrorMessage } from "../../utils/errorHandler";

const Profile = () => {
  const [profile, setProfile] = useState({
    bank_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/blood-banks/profile");

      if (response.data.profile) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Failed to load blood bank profile."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await api.put(
        "/blood-banks/profile",
        profile
      );

      if (response.data.profile) {
        setProfile(response.data.profile);
      }

      setMessage(
        "Blood bank profile updated successfully."
      );
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "Failed to update blood bank profile."
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-6">
          <Link
            to="/blood-bank/dashboard"
            className="text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-3 text-3xl font-bold">
            Life Link
          </h1>

          <h2 className="mt-1 text-2xl font-bold text-gray-800">
            Blood Bank Profile
          </h2>

          <p className="mt-1 text-gray-600">
            Manage your blood bank information.
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        {/* Profile Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-6 shadow"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Blood Bank Name */}
            <div>
              <label className="mb-1 block font-medium">
                Blood Bank Name
              </label>

              <input
                type="text"
                name="bank_name"
                value={profile.bank_name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1 block font-medium">
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block font-medium">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* City */}
            <div>
              <label className="mb-1 block font-medium">
                City
              </label>

              <input
                type="text"
                name="city"
                value={profile.city}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* State */}
            <div>
              <label className="mb-1 block font-medium">
                State
              </label>

              <input
                type="text"
                name="state"
                value={profile.state}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="mb-1 block font-medium">
                Address
              </label>

              <textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                rows="3"
                required
                className="w-full rounded-lg border px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
          >
            Save Profile
          </button>
        </form>

        {/* Footer */}
        <footer className="mt-8 border-t border-gray-200 pt-5 text-center text-sm text-gray-500">
          Life Link • Blood Donation & Blood Request Management System
        </footer>

      </div>
    </div>
  );
};

export default Profile;