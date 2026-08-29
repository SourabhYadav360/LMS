"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getMe } from "@/services/auth.service";

export default function AdminDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await getMe();

        const currentUser =
          response.data.user;

        if (
          currentUser.role !==
          "SUPER_ADMIN"
        ) {
          router.replace("/login");
          return;
        }

        setUser(currentUser);
      } catch (error) {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="p-6">
        Loading dashboard...
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
          Manage your library from here.
        </p>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border rounded-xl p-6">
          <p className="text-gray-500">
            Total Librarians
          </p>

          <h2 className="text-3xl font-bold mt-2">
            0
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <p className="text-gray-500">
            Total Members
          </p>

          <h2 className="text-3xl font-bold mt-2">
            0
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <p className="text-gray-500">
            Total Books
          </p>

          <h2 className="text-3xl font-bold mt-2">
            0
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <p className="text-gray-500">
            Wallet Balance
          </p>

          <h2 className="text-3xl font-bold mt-2">
            ₹0
          </h2>
        </div>
      </div>

      {/* QUICK ACTIONS */}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() =>
              router.push(
                "/admin/librarians"
              )
            }
            className="bg-white border rounded-xl p-5 text-left hover:shadow-md"
          >
            <h3 className="font-semibold">
              Manage Librarians
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Create and manage librarians
            </p>
          </button>

          <button
            onClick={() =>
              router.push(
                "/admin/members"
              )
            }
            className="bg-white border rounded-xl p-5 text-left hover:shadow-md"
          >
            <h3 className="font-semibold">
              Manage Members
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              View and manage members
            </p>
          </button>

          <button
            onClick={() =>
              router.push(
                "/admin/books"
              )
            }
            className="bg-white border rounded-xl p-5 text-left hover:shadow-md"
          >
            <h3 className="font-semibold">
              Manage Books
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Manage library books
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}