"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getMe } from "@/services/auth.service";
import {
  getAdminDashboard,
} from "@/services/admin.service";

export default function AdminDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Check logged-in user
        const me =
          await getMe();

        const currentUser =
          me.data.user;

        // Only Super Admin
        if (
          currentUser.role !==
          "SUPER_ADMIN"
        ) {
          router.replace("/login");
          return;
        }

        setUser(currentUser);

        // Dashboard API
        const result =
          await getAdminDashboard();

        setDashboard(
          result.data
        );
      } catch (error) {
        console.error(error);

        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome, {user?.name}
        </h1>

        <p className="text-gray-500 mt-2">
          Library Management Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white border rounded-xl p-6">
          <p className="text-gray-500">
            Librarians
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {dashboard?.totalLibrarians || 0}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <p className="text-gray-500">
            Members
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {dashboard?.totalMembers || 0}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <p className="text-gray-500">
            Books
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {dashboard?.totalBooks || 0}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <p className="text-gray-500">
            Categories
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {dashboard?.totalCategories || 0}
          </h2>
        </div>

      </div>
    </div>
  );
}