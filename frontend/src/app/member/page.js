"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getMe } from "@/services/auth.service";
import { getMyRentals } from "@/services/rental.service";
import { getMyReservations } from "@/services/reservation.service";
import { getBooks } from "@/services/book.service";

export default function MemberDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeRentals, setActiveRentals] = useState(0);
  const [activeReservations, setActiveReservations] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [availableBooks, setAvailableBooks] = useState(0);

  // ======================================================
  // LOAD DASHBOARD DATA
  // ======================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        // USER
        const userResponse = await getMe();

        const currentUser =
          userResponse?.data?.user ||
          userResponse?.user ||
          userResponse?.data ||
          null;

        if (currentUser) {
          setUser(currentUser);

          setWalletBalance(
            Number(
              currentUser?.wallet?.balance ??
              currentUser?.walletBalance ??
              0
            )
          );
        }

        // RENTALS
        try {
          const rentalsResponse = await getMyRentals();

          const rentals =
            rentalsResponse?.data?.rentals ||
            rentalsResponse?.rentals ||
            [];

          const active = rentals.filter(
            (r) => r.status === "ACTIVE"
          ).length;

          setActiveRentals(active);
        } catch (err) {
          console.error("Error loading rentals:", err);
        }

        // RESERVATIONS
        try {
          const reservationsResponse =
            await getMyReservations();

          const reservations =
            reservationsResponse?.data?.reservations ||
            reservationsResponse?.reservations ||
            [];

          const active = reservations.filter(
            (r) =>
              r.status === "PENDING" ||
              r.status === "ACTIVE"
          ).length;

          setActiveReservations(active);
        } catch (err) {
          console.error(
            "Error loading reservations:",
            err
          );
        }

        // BOOKS
        try {
          const booksResponse = await getBooks();

          const books =
            booksResponse?.data?.books ||
            booksResponse?.books ||
            booksResponse?.data ||
            [];

          const available = books.filter(
            (book) =>
              Number(
                book.availableCopies ??
                book.available_copies ??
                0
              ) > 0
          ).length;

          setAvailableBooks(available);
        } catch (err) {
          console.error(
            "Error loading books:",
            err
          );
        }
      } catch (err) {
        console.error(
          "Dashboard error:",
          err
        );

        setError(
          err?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-900" />

          <p className="mt-4 text-sm text-gray-500">
            Loading dashboard...
          </p>

        </div>
      </div>
    );
  }

  // ======================================================
  // DASHBOARD
  // ======================================================

  return (
    <div className="space-y-6">

      {/* ==================================================
          WELCOME
      ================================================== */}

      <div>
        <h1 className="text-3xl font-bold text-blue-900">
          Welcome, {user?.name || "Member"}
        </h1>

        <p className="mt-1 text-gray-500">
          Here's your library dashboard at a glance.
        </p>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ==================================================
          DASHBOARD CARDS
      ================================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

        {/* ACTIVE RENTALS */}

        <Link href="/member/rentals">
          <div className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Active Rentals
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-900">
                  {activeRentals}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl">
                📖
              </div>

            </div>

            <p className="mt-4 text-xs font-medium text-blue-600">
              View rentals →
            </p>

          </div>
        </Link>

        {/* ACTIVE RESERVATIONS */}

        <Link href="/member/reservations">
          <div className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Active Reservations
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-900">
                  {activeReservations}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl">
                🔖
              </div>

            </div>

            <p className="mt-4 text-xs font-medium text-blue-600">
              View reservations →
            </p>

          </div>
        </Link>

        {/* WALLET */}

        <Link href="/member/wallet">
          <div className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Wallet Balance
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  ₹{walletBalance.toFixed(2)}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
                💳
              </div>

            </div>

            <p className="mt-4 text-xs font-medium text-green-600">
              Manage wallet →
            </p>

          </div>
        </Link>

        {/* AVAILABLE BOOKS */}

        <Link href="/member/books">
          <div className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Available Books
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-900">
                  {availableBooks}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl">
                📚
              </div>

            </div>

            <p className="mt-4 text-xs font-medium text-blue-600">
              Browse books →
            </p>

          </div>
        </Link>

      </div>

      {/* ==================================================
          QUICK LINKS
      ================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="text-lg font-bold text-gray-900">
          Quick Links
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">

          <Link
            href="/member/books"
            className="w-full rounded-lg border border-blue-600 px-4 py-3 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Browse Books
          </Link>

          <Link
            href="/member/rentals"
            className="w-full rounded-lg border border-blue-600 px-4 py-3 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            My Rentals
          </Link>

          <Link
            href="/member/reservations"
            className="w-full rounded-lg border border-blue-600 px-4 py-3 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            My Reservations
          </Link>

          <Link
            href="/member/wallet"
            className="w-full rounded-lg border border-green-600 px-4 py-3 text-center text-sm font-semibold text-green-600 transition hover:bg-green-50"
          >
            Wallet
          </Link>

        </div>

      </div>

    </div>
  );
}