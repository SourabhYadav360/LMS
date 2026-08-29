"use client";

import { useEffect, useState } from "react";

import { getBooks } from "@/services/book.service";
import { rentBook } from "@/services/rental.service";
import { createReservation } from "@/services/reservation.service";

export default function BooksPage() {
  const [books, setBooks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [rentingBook, setRentingBook] = useState(null);
  const [days, setDays] = useState(7);

  // ======================================================
  // LOAD BOOKS
  // GET /books
  // ======================================================

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBooks();

      console.log("BOOKS RESPONSE:", response);

      const booksData =
        response?.data?.books ||
        response?.data ||
        response?.books ||
        response ||
        [];

      setBooks(
        Array.isArray(booksData)
          ? booksData
          : []
      );
    } catch (error) {
      console.error(
        "Load books error:",
        error
      );

      setError(
        error?.message ||
          "Failed to load books"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadBooks();
  }, []);

  // ======================================================
  // RENT BOOK
  // POST /rentals
  // ======================================================

  const handleRent = async () => {
    if (!rentingBook) return;

    const bookId =
      rentingBook._id ||
      rentingBook.id;

    if (!bookId) {
      setError("Book ID not found");
      return;
    }

    if (
      !days ||
      Number(days) <= 0
    ) {
      setError(
        "Rental days must be greater than 0"
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      await rentBook({
        bookId,
        days: Number(days),
      });

      setMessage(
        "Book rented successfully!"
      );

      setRentingBook(null);
      setDays(7);

      // Available copies update karne ke liye
      await loadBooks();
    } catch (error) {
      console.error(
        "Rent book error:",
        error
      );

      setError(
        error?.message ||
          "Failed to rent book"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ======================================================
  // RESERVE BOOK
  // POST /reservations
  // ======================================================

  const handleReservation = async (
    bookId
  ) => {
    if (!bookId) {
      setError("Book ID not found");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      await createReservation(bookId);

      setMessage(
        "Book reservation created successfully!"
      );
    } catch (error) {
      console.error(
        "Reservation error:",
        error
      );

      setError(
        error?.message ||
          "Failed to create reservation"
      );
    } finally {
      setActionLoading(false);
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
            Loading books...
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
          Books
        </h1>

        <p className="mt-1 text-gray-500">
          Browse and rent available books.
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
          NO BOOKS
      ================================================== */}

      {books.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

          <div className="text-5xl">
            📚
          </div>

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            No Books Found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            There are currently no books available.
          </p>

        </div>
      ) : (
        /* ==================================================
           BOOK GRID
        ================================================== */

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {books.map((book) => {
            const bookId =
              book._id ||
              book.id;

            const availableCopies =
              Number(
                book.availableCopies ??
                  book.quantity ??
                  0
              );

            const isAvailable =
              availableCopies > 0;

            return (
              <div
                key={bookId}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                {/* BOOK ICON */}

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                  📚
                </div>

                {/* TITLE */}

                <h2 className="mt-5 text-xl font-bold text-gray-900">
                  {book.title}
                </h2>

                {/* AUTHOR */}

                <p className="mt-2 text-sm text-gray-500">
                  Author:{" "}
                  <span className="font-medium text-gray-700">
                    {book.author || "Unknown"}
                  </span>
                </p>

                {/* ISBN */}

                <p className="mt-1 text-sm text-gray-500">
                  ISBN:{" "}
                  <span className="font-medium text-gray-700">
                    {book.isbn || "N/A"}
                  </span>
                </p>

                {/* AVAILABLE COPIES */}

                <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-3">

                  <span className="text-sm text-gray-500">
                    Available Copies
                  </span>

                  <span
                    className={`font-bold ${
                      isAvailable
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {availableCopies}
                  </span>

                </div>

                {/* ACTIONS */}

                <div className="mt-5 flex gap-2">

                  {/* RENT */}

                  <button
                    type="button"
                    disabled={
                      !isAvailable ||
                      actionLoading
                    }
                    onClick={() =>
                      setRentingBook(book)
                    }
                    className="flex-1 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {isAvailable
                      ? "Rent"
                      : "Unavailable"}
                  </button>

                  {/* RESERVE */}

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() =>
                      handleReservation(bookId)
                    }
                    className="flex-1 rounded-lg border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reserve
                  </button>

                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* ==================================================
          RENT MODAL
      ================================================== */}

      {rentingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            {/* HEADER */}

            <div className="flex items-start justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Rent Book
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter rental duration.
                </p>
              </div>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() =>
                  setRentingBook(null)
                }
                className="text-xl text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>

            </div>

            {/* BOOK */}

            <div className="mt-5 rounded-xl bg-blue-50 p-4">

              <p className="text-sm text-blue-500">
                Book
              </p>

              <p className="mt-1 font-bold text-blue-900">
                {rentingBook.title}
              </p>

            </div>

            {/* DAYS */}

            <label className="mt-5 block text-sm font-medium text-gray-700">
              Rental Days
            </label>

            <input
              type="number"
              min="1"
              value={days}
              disabled={actionLoading}
              onChange={(e) =>
                setDays(e.target.value)
              }
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {/* BUTTONS */}

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleRent}
                className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {actionLoading
                  ? "Processing..."
                  : "Confirm Rent"}
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() =>
                  setRentingBook(null)
                }
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}