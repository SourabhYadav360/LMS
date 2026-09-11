"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import StatCard from "@/components/dashboard/StatCard";

import { getAdminDashboard } from "@/services/admin.service";


// Icons
const BookIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);


const UsersIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);


const LibrarianIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);


const CategoryIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);


const RentalIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M3 12h18" />
    <path d="M12 3v18" />
    <path d="M5 5l14 14" />
    <path d="M19 5L5 19" />
  </svg>
);


const ReservationIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M6 2h12v20l-6-3-6 3V2z" />
  </svg>
);


const WalletIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="2" y="5" width="20" height="15" rx="2" />
    <path d="M16 12h4" />
  </svg>
);


const RefreshIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M20 11a8.1 8.1 0 00-15.5-2" />
    <path d="M4 4v5h5" />
    <path d="M4 13a8.1 8.1 0 0015.5 2" />
    <path d="M20 20v-5h-5" />
  </svg>
);


export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminDashboard();

      setDashboard(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const timer = window.setTimeout(fetchDashboard, 0);

    return () => window.clearTimeout(timer);
  }, []);


  return (
        <div className="space-y-6">

          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-medium text-blue-600">
                Overview
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Admin Dashboard
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Welcome back{user?.name ? `, ${user.name}` : ""}.
                Here&apos;s what&apos;s happening in your library.
              </p>
            </div>


            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshIcon />

              {loading ? "Refreshing..." : "Refresh"}
            </button>

          </div>


          {/* ================================= */}
          {/* ERROR */}
          {/* ================================= */}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <h3 className="font-semibold text-red-800">
                    Something went wrong
                  </h3>

                  <p className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                </div>

                <button
                  onClick={fetchDashboard}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Retry
                </button>

              </div>

            </div>
          )}


          {/* ================================= */}
          {/* LOADING */}
          {/* ================================= */}

          {loading && !dashboard && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="h-4 w-24 rounded bg-slate-200" />

                  <div className="mt-5 h-8 w-20 rounded bg-slate-200" />

                  <div className="mt-3 h-3 w-32 rounded bg-slate-100" />
                </div>
              ))}

            </div>
          )}


          {/* ================================= */}
          {/* STATS */}
          {/* ================================= */}

          {!loading && dashboard && (
            <>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                  title="Total Books"
                  value={dashboard.totalBooks}
                  description="Books available in library"
                  icon={<BookIcon />}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                />


                <StatCard
                  title="Total Members"
                  value={dashboard.totalMembers}
                  description="Registered library members"
                  icon={<UsersIcon />}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                />


                <StatCard
                  title="Total Librarians"
                  value={dashboard.totalLibrarians}
                  description="Active library staff"
                  icon={<LibrarianIcon />}
                  iconBg="bg-violet-50"
                  iconColor="text-violet-600"
                />


                <StatCard
                  title="Categories"
                  value={dashboard.totalCategories}
                  description="Book categories"
                  icon={<CategoryIcon />}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-600"
                />


                <StatCard
                  title="Total Rentals"
                  value={dashboard.totalRentals}
                  description="All rental records"
                  icon={<RentalIcon />}
                  iconBg="bg-cyan-50"
                  iconColor="text-cyan-600"
                />


                <StatCard
                  title="Reservations"
                  value={dashboard.totalReservations}
                  description="All reservation records"
                  icon={<ReservationIcon />}
                  iconBg="bg-pink-50"
                  iconColor="text-pink-600"
                />


                {/* Wallet */}
                <div className="group relative overflow-hidden rounded-2xl bg-slate-900 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:col-span-2 xl:col-span-2">

                  <div className="relative z-10 flex items-center justify-between">

                    <div>
                      <p className="text-sm font-medium text-slate-400">
                        Super Admin Wallet
                      </p>

                      <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">
                        ₹
                        {Number(
                          dashboard.currentWalletAmount || 0
                        ).toLocaleString("en-IN")}
                      </h2>

                      <p className="mt-2 text-sm text-slate-400">
                        Current wallet balance
                      </p>
                    </div>


                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-sm">
                      <WalletIcon />
                    </div>

                  </div>


                  {/* Decorative circles */}
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5" />

                  <div className="absolute -bottom-16 right-20 h-40 w-40 rounded-full bg-white/5" />

                </div>

              </div>


              {/* ================================= */}
              {/* QUICK ACTIONS */}
              {/* ================================= */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    Quick Actions
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Quickly access common administration tasks.
                  </p>
                </div>


                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                  <Link
                    href="/admin/books"
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <p className="font-semibold text-slate-800">
                      Manage Books
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Add and manage books
                    </p>
                  </Link>


                  <a
                    href="/admin/members"
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <p className="font-semibold text-slate-800">
                      Manage Members
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      View library members
                    </p>
                  </a>


                  <a
                    href="/admin/librarians"
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-violet-300 hover:bg-violet-50"
                  >
                    <p className="font-semibold text-slate-800">
                      Manage Librarians
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Manage library staff
                    </p>
                  </a>


                  <a
                    href="/admin/reports"
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-amber-300 hover:bg-amber-50"
                  >
                    <p className="font-semibold text-slate-800">
                      View Reports
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Check library reports
                    </p>
                  </a>

                </div>

              </div>

            </>
          )}

        </div>

  );
}