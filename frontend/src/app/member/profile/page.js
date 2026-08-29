"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getMe } from "@/services/auth.service";

export default function MemberProfile() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const response = await getMe();

        const currentUser =
          response?.data?.user;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        // Member only
        if (currentUser.role !== "MEMBER") {
          router.replace("/login");
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error(
          "Profile error:",
          error
        );

        setError(
          error.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">
          {error}
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // ==========================================
  // PROFILE
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-3xl mx-auto">

        {/* Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            My Profile
          </h1>

          <p className="text-gray-500 mt-1">
            View your account information
          </p>
        </div>

        {/* Profile Card */}

        <div className="bg-white rounded-2xl shadow-sm p-6">

          {/* Name */}

          <div className="border-b pb-5 mb-5">
            <p className="text-sm text-gray-500">
              Name
            </p>

            <p className="text-lg font-semibold mt-1">
              {user.name}
            </p>
          </div>

          {/* Email */}

          <div className="border-b pb-5 mb-5">
            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="text-lg font-semibold mt-1">
              {user.email}
            </p>
          </div>

          {/* Role */}

          <div className="border-b pb-5 mb-5">
            <p className="text-sm text-gray-500">
              Role
            </p>

            <p className="text-lg font-semibold mt-1">
              {user.role}
            </p>
          </div>

          {/* Status */}

          <div className="border-b pb-5 mb-5">
            <p className="text-sm text-gray-500">
              Status
            </p>

            <span
              className="
                inline-block
                mt-2
                px-3
                py-1
                rounded-full
                text-sm
                font-medium
                bg-green-100
                text-green-700
              "
            >
              {user.status}
            </span>
          </div>

          {/* Created At */}

          <div>
            <p className="text-sm text-gray-500">
              Member Since
            </p>

            <p className="text-lg font-semibold mt-1">
              {user.createdAt
                ? new Date(
                    user.createdAt
                  ).toLocaleDateString()
                : "-"}
            </p>
          </div>

        </div>

        {/* Back Button */}

        <button
          onClick={() =>
            router.push(
              "/member/dashboard"
            )
          }
          className="
            mt-6
            px-5
            py-2.5
            rounded-lg
            bg-black
            text-white
            hover:opacity-90
            transition
          "
        >
          Back to Dashboard
        </button>

      </div>

    </div>
  );
}