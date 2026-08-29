"use client";

import { useEffect, useState } from "react";
import { getLibrarianDashboard } from "@/services/librarian.service";

export default function LibrarianDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getLibrarianDashboard();

        console.log("Librarian Dashboard:", response);

        setDashboard(response.data);
      } catch (error) {
        console.error("Dashboard Error:", error);

        setError(
          error.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

          <p className="mt-4 text-sm text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gray-50 p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-700">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // SAFE VALUES
  // ==========================================

  const totalBooks = dashboard?.totalBooks || 0;
  const availableBooks = dashboard?.availableBooks || 0;
  const totalMembers = dashboard?.totalMembers || 0;
  const activeRentals = dashboard?.activeRentals || 0;
  const pendingReservations =
    dashboard?.pendingReservations || 0;

  const currentlyRented = Math.max(
    0,
    totalBooks - availableBooks
  );

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 p-6">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-8">
        <p className="text-sm font-medium text-gray-500">
          Library Management
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Librarian Dashboard
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Overview of your library operations
        </p>
      </div>

      {/* ======================================
          STAT CARDS
      ====================================== */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

        <StatCard
          title="Total Books"
          value={totalBooks}
          icon="📚"
        />

        <StatCard
          title="Available Books"
          value={availableBooks}
          icon="📖"
        />

        <StatCard
          title="Total Members"
          value={totalMembers}
          icon="👥"
        />

        <StatCard
          title="Active Rentals"
          value={activeRentals}
          icon="🔄"
        />

        <StatCard
          title="Pending Reservations"
          value={pendingReservations}
          icon="⏳"
        />

      </div>

      {/* ======================================
          OVERVIEW
      ====================================== */}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        {/* ====================================
            BOOK OVERVIEW
        ==================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Book Overview
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current inventory status
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
              📚
            </div>
          </div>

          <div className="mt-6 space-y-5">

            <OverviewRow
              label="Total Books"
              value={totalBooks}
            />

            <OverviewRow
              label="Available Books"
              value={availableBooks}
            />

            <OverviewRow
              label="Currently Rented"
              value={currentlyRented}
            />

          </div>
        </div>

        {/* ====================================
            ACTIVITY OVERVIEW
        ==================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Library Activity
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current library activity
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
              📊
            </div>
          </div>

          <div className="mt-6 space-y-5">

            <OverviewRow
              label="Total Members"
              value={totalMembers}
            />

            <OverviewRow
              label="Active Rentals"
              value={activeRentals}
            />

            <OverviewRow
              label="Pending Reservations"
              value={pendingReservations}
            />

          </div>
        </div>
      </div>

      {/* ======================================
          QUICK ACTIONS
      ====================================== */}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Quickly access common library operations
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <QuickAction
            title="Manage Books"
            description="View and manage books"
            href="/librarian/books"
            icon="📚"
          />

          <QuickAction
            title="Manage Members"
            description="View library members"
            href="/librarian/members"
            icon="👥"
          />

          <QuickAction
            title="Rentals"
            description="View rental activity"
            href="/librarian/rentals"
            icon="🔄"
          />

          <QuickAction
            title="Reservations"
            description="Manage reservations"
            href="/librarian/reservations"
            icon="⏳"
          />

        </div>
      </div>
    </div>
  );
}

// ======================================================
// STAT CARD
// ======================================================

function StatCard({ title, value, icon }) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold text-gray-900">
            {value}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>

      </div>
    </div>
  );
}

// ======================================================
// OVERVIEW ROW
// ======================================================

function OverviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">

      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="font-semibold text-gray-900">
        {value}
      </span>

    </div>
  );
}

// ======================================================
// QUICK ACTION
// ======================================================

function QuickAction({
  title,
  description,
  href,
  icon,
}) {
  return (
    <a
      href={href}
      className="group rounded-xl border border-gray-200 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md"
    >
      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg">
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            {title}
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        </div>

      </div>
    </a>
  );
}