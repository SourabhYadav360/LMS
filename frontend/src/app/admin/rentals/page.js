"use client";

import React, { useEffect, useState } from "react";

import {
  getAllRentals,
} from "@/services/rental.service";

import RentalTable from "@/components/rentals/RentalTable";
import RentalDetails from "@/components/rentals/RentalDetails";

const RentalsPage = () => {
  const [rentals, setRentals] = useState([]);

  const [selectedRental, setSelectedRental] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ======================================================
  // GET ALL RENTALS
  // ======================================================

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAllRentals();

      setRentals(
        response?.data?.rentals || []
      );
    } catch (error) {
      console.error(
        "Get rentals error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to fetch rentals"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchRentals();
  }, []);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">
          Loading rentals...
        </p>
      </div>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="space-y-6 p-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-semibold">
            Rentals
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage book rental records
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRentals}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
        >
          Refresh
        </button>

      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">

          <p className="text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchRentals}
            className="mt-2 text-sm font-medium text-red-700 underline"
          >
            Try Again
          </button>

        </div>
      )}

      {/* ==================================================
          STATS
      ================================================== */}

      {!error && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* TOTAL */}

          <div className="rounded-lg border bg-white p-5">

            <p className="text-sm text-gray-500">
              Total Rentals
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {rentals.length}
            </p>

          </div>

          {/* ACTIVE */}

          <div className="rounded-lg border bg-white p-5">

            <p className="text-sm text-gray-500">
              Active Rentals
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {
                rentals.filter(
                  (rental) =>
                    rental.status ===
                    "ACTIVE"
                ).length
              }
            </p>

          </div>

          {/* RETURNED */}

          <div className="rounded-lg border bg-white p-5">

            <p className="text-sm text-gray-500">
              Returned
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {
                rentals.filter(
                  (rental) =>
                    rental.status ===
                    "RETURNED"
                ).length
              }
            </p>

          </div>

        </div>
      )}

      {/* ==================================================
          RENTAL TABLE
      ================================================== */}

      {!error && (
        <RentalTable
          rentals={rentals}
          onView={(rental) => {
            setSelectedRental(rental);
          }}
        />
      )}

      {/* ==================================================
          RENTAL DETAILS MODAL
      ================================================== */}

      {selectedRental && (
        <RentalDetails
          rental={selectedRental}
          onClose={() => {
            setSelectedRental(null);
          }}
        />
      )}

    </div>
  );
};

export default RentalsPage;