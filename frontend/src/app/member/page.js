"use client";

import { useEffect, useState } from "react";

import {
  getMe,
} from "@/services/auth.service";

import {
  updateMember,
} from "@/services/member.service";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // ======================================================
  // GET PROFILE
  // ======================================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMe();

      console.log(
        "PROFILE RESPONSE:",
        response
      );

      const currentUser =
        response?.data?.user ||
        response?.user ||
        null;

      if (!currentUser) {
        setError("User information not found");
        return;
      }

      setUser(currentUser);

      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
      });
    } catch (error) {
      console.error(
        "Get profile error:",
        error
      );

      setError(
        error?.message ||
          "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadProfile();
  }, []);

  // ======================================================
  // INPUT CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ======================================================
  // UPDATE PROFILE
  // ======================================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      if (!formData.name.trim()) {
        setError("Name is required");
        return;
      }

      if (!formData.email.trim()) {
        setError("Email is required");
        return;
      }

      const userId =
        user?._id || user?.id;

      if (!userId) {
        setError("User ID not found");
        return;
      }

      const response = await updateMember(
        userId,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
        }
      );

      console.log(
        "UPDATE PROFILE RESPONSE:",
        response
      );

      setSuccess(
        "Profile updated successfully!"
      );

      // Latest profile data
      await loadProfile();
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      setError(
        error?.message ||
          "Failed to update profile"
      );
    } finally {
      setUpdating(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-900" />

          <p className="mt-4 text-sm text-gray-500">
            Loading profile...
          </p>

        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR WITHOUT USER
  // ======================================================

  if (!user) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">

        <p className="font-medium text-red-600">
          {error || "Profile not found"}
        </p>

        <button
          onClick={loadProfile}
          className="mt-4 rounded-lg bg-blue-900 px-5 py-2 text-sm font-semibold text-white"
        >
          Try Again
        </button>

      </div>
    );
  }

  const userId =
    user?._id || user?.id;

  return (
    <div className="space-y-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          My Profile
        </h1>

        <p className="mt-1 text-gray-500">
          View and update your account information.
        </p>
      </div>

      {/* ==================================================
          SUCCESS
      ================================================== */}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ==================================================
            PROFILE CARD
        ================================================== */}

        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">

          <div className="flex flex-col items-center text-center">

            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-900 text-3xl font-bold text-white">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "M"}
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {user.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {user.email}
            </p>

            <span className="mt-4 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-700">
              {user.role || "MEMBER"}
            </span>

          </div>

          <div className="mt-6 border-t pt-5">

            <div className="flex items-center justify-between">

              <span className="text-sm text-gray-500">
                Account Status
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  user.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.status || "ACTIVE"}
              </span>

            </div>

          </div>

        </div>

        {/* ==================================================
            EDIT PROFILE
        ================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-gray-900">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update your basic account details.
            </p>

          </div>

          <form
            onSubmit={handleUpdate}
            className="space-y-5"
          >

            {/* NAME */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              />

            </div>

            {/* EMAIL */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              />

            </div>

            {/* USER ID */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                User ID
              </label>

              <input
                type="text"
                value={userId || ""}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500"
              />

            </div>

            {/* ROLE */}

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Role
              </label>

              <input
                type="text"
                value={user.role || "MEMBER"}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500"
              />

            </div>

            {/* BUTTON */}

            <div className="flex justify-end pt-2">

              <button
                type="submit"
                disabled={updating}
                className="rounded-xl bg-blue-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-950 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {updating
                  ? "Updating..."
                  : "Save Changes"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}