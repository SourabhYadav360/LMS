"use client";

import { useEffect, useState } from "react";

import {
  getMyRentals,
  returnBook,
} from "@/services/rental.service";

export default function RentalsPage() {
  const [rentals, setRentals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ======================================================
  // LOAD MY RENTALS
  // GET /rentals/my-rentals
  // ======================================================

  const loadRentals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyRentals();

      console.log("MY RENTALS RESPONSE:", response);

      const rentalsData =
        response?.data?.rentals ||
        response?.data ||
        response?.rentals ||
        response ||
        [];

      setRentals(
        Array.isArray(rentalsData)
          ? rentalsData
          : []
      );
    } catch (error) {
      console.error(
        "Load rentals error:",
        error
      );

      setError(
        error?.message ||
          "Failed to load rentals"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadRentals();
  }, []);

  // ======================================================
  // RETURN BOOK
  // POST /rentals/:rentalId/return
  // ======================================================

  const handleReturn = async (rentalId) => {
    if (!rentalId) {
      setError("Rental ID not found");
      return;
    }

    try {
      setReturningId(rentalId);
      setError("");
      setMessage("");

      await returnBook(rentalId);

      setMessage(
        "Book returned successfully!"
      );

      // Updated rentals list
      await loadRentals();
    } catch (error) {
      console.error(
        "Return book error:",
        error
      );

      setError(
        error?.message ||
          "Failed to return book"
      );
    } finally {
      setReturningId(null);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-900" />

          <p className="mt-4 text-sm text-gray-500">
            Loading rentals...
          </p>

        </div>
      </div>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="space-y-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div>
        <h1 className="text-3xl font-bold text-blue-900">
          My Rentals
        </h1>

        <p className="mt-1 text-gray-500">
          Books currently rented by you.
        </p>
      </div>

      {/* ==================================================
          SUCCESS MESSAGE
      ================================================== */}

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {/* ==================================================
          ERROR MESSAGE
      ================================================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ==================================================
          EMPTY STATE
      ================================================== */}

      {rentals.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

          <div className="text-5xl">
            📖
          </div>

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            No Rentals Found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            You don't have any rented books.
          </p>

        </div>
      ) : (
        /* ==================================================
           RENTALS TABLE
        ================================================== */

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              {/* ==================================================
                  TABLE HEADER
              ================================================== */}

              <thead className="bg-blue-50">

                <tr>

                  <th className="p-4 text-left text-sm font-semibold text-blue-900">
                    Book
                  </th>

                  <th className="p-4 text-left text-sm font-semibold text-blue-900">
                    Quantity
                  </th>

                  <th className="p-4 text-left text-sm font-semibold text-blue-900">
                    Amount
                  </th>

                  <th className="p-4 text-left text-sm font-semibold text-blue-900">
                    Start Date
                  </th>

                  <th className="p-4 text-left text-sm font-semibold text-blue-900">
                    Due Date
                  </th>

                  <th className="p-4 text-left text-sm font-semibold text-blue-900">
                    Status
                  </th>

                  <th className="p-4 text-left text-sm font-semibold text-blue-900">
                    Action
                  </th>

                </tr>

              </thead>

              {/* ==================================================
                  TABLE BODY
              ================================================== */}

              <tbody>

                {rentals.map((rental) => {
                  const rentalId =
                    rental._id ||
                    rental.id;

                  const book =
                    rental.book || {};

                  const bookTitle =
                    book.title ||
                    rental.bookTitle ||
                    "Book";

                  const status =
                    rental.status ||
                    "UNKNOWN";

                  const normalizedStatus =
                    String(status).toLowerCase();

                  const isReturned =
                    normalizedStatus ===
                      "returned" ||
                    normalizedStatus ===
                      "completed";

                  const isOverdue =
                    normalizedStatus ===
                    "overdue";

                  return (
                    <tr
                      key={rentalId}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >

                      {/* BOOK */}

                      <td className="p-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                            📚
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {bookTitle}
                            </p>

                            {book.author && (
                              <p className="text-xs text-gray-500">
                                {book.author}
                              </p>
                            )}
                          </div>

                        </div>

                      </td>

                      {/* QUANTITY */}

                      <td className="p-4 text-sm text-gray-600">
                        {rental.quantity || 1} {rental.quantity > 1 ? "copies" : "copy"}
                      </td>

                      {/* AMOUNT */}

                      <td className="p-4 text-sm font-semibold text-gray-900">
                        ₹{rental.rentalAmount || 0}
                      </td>

                      {/* START DATE */}

                      <td className="p-4 text-sm text-gray-600">
                        {rental.startDate
                          ? new Date(
                              rental.startDate
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* DUE DATE */}

                      <td className="p-4 text-sm text-gray-600">
                        {rental.dueDate
                          ? new Date(
                              rental.dueDate
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      {/* STATUS */}

                      <td className="p-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            isReturned
                              ? "bg-green-100 text-green-700"
                              : isOverdue
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {status}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="p-4">

                        {!isReturned ? (
                          <button
                            type="button"
                            disabled={
                              returningId ===
                              rentalId
                            }
                            onClick={() =>
                              handleReturn(
                                rentalId
                              )
                            }
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            {returningId ===
                            rentalId
                              ? "Returning..."
                              : "Return"}
                          </button>
                        ) : (
                          <span className="text-sm font-medium text-green-600">
                            Returned ✓
                          </span>
                        )}

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
}