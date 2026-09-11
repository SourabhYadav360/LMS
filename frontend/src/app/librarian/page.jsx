"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useAuth } from "@/context/AuthContext";
import { getLibrarianDashboard } from "@/services/librarian.service";

export default function LibrarianDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getLibrarianDashboard();

      setDashboard(response.data);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to load dashboard.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(
      loadDashboard,
      0
    );

    return () =>
      window.clearTimeout(timer);
  }, []);

  const cards = dashboard
    ? [
        [
          "Total books",
          dashboard.totalBooks,
          "Books in the library",
        ],
        [
          "Available books",
          dashboard.availableBooks,
          "Titles with available copies",
        ],
        [
          "Total members",
          dashboard.totalMembers,
          "Registered members",
        ],
        [
          "Active rentals",
          dashboard.activeRentals,
          "Currently borrowed",
        ],
        [
          "Reservations",
          dashboard.pendingReservations,
          "Pending reservations",
        ],
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Overview
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Librarian Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Welcome back
            {user?.name ? `, ${user.name}` : ""}. Here is
            today&apos;s library activity.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={loadDashboard}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !dashboard && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 5 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-xl border bg-white"
              />
            )
          )}
        </div>
      )}

      {!loading && dashboard && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(
              ([
                title,
                value,
                description,
              ]) => (
                <StatCard
                  key={title}
                  title={title}
                  value={value}
                  description={description}
                />
              )
            )}

            <div className="rounded-xl bg-slate-900 p-5 text-white shadow-sm sm:col-span-2 xl:col-span-2">
              <p className="text-sm font-medium text-slate-400">
                Librarian wallet
              </p>

              <p className="mt-3 text-4xl font-bold">
                ₹
                {Number(
                  dashboard.wallet?.balance || 0
                ).toLocaleString("en-IN")}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Rental earnings available in your
                wallet
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Daily operations
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Operation
                label="Books available"
                value={dashboard.availableBooks}
              />

              <Operation
                label="Active rentals"
                value={dashboard.activeRentals}
              />

              <Operation
                label="Pending reservations"
                value={
                  dashboard.pendingReservations
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function Operation({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}