"use client";

import { useEffect, useState } from "react";

import { getBooks } from "@/services/book.service";
import { rentBook } from "@/services/rental.service";
import {
  createReservation,
  getMyReservations,
} from "@/services/reservation.service";
import { getMyWallet } from "@/services/wallet.service";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [rentingBook, setRentingBook] = useState(null);
  const [days, setDays] = useState(7);
  const [quantity, setQuantity] = useState(1);
  const [reservedBookIds, setReservedBookIds] = useState([]);

  // ======================================================
  // LOAD WALLET BALANCE
  // ======================================================

  const loadWalletBalance = async () => {
    try {
      const walletResponse = await getMyWallet();

      const walletData =
        walletResponse?.data?.wallet ||
        walletResponse?.wallet ||
        walletResponse?.data ||
        null;

      const balance =
        walletData?.balance ??
        walletData?.walletBalance ??
        0;

      setWalletBalance(Number(balance));
    } catch (error) {
      console.error("Load wallet error:", error);
      setWalletBalance(0);
    }
  };

  // ======================================================
  // LOAD BOOKS
  // ======================================================

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBooks();

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
      console.error("Load books error:", error);

      setError(
        error?.message ||
          "Failed to load books"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMyReservationStatus = async () => {
    try {
      const reservationsResponse = await getMyReservations();

      const reservations =
        reservationsResponse?.data?.reservations ||
        reservationsResponse?.reservations ||
        [];

      const activeReservationIds = reservations
        .filter(
          (r) =>
            r?.status === "PENDING" ||
            r?.status === "APPROVED"
        )
        .map((r) => String(r?.bookId ?? r?.book?.id ?? ""))
        .filter(Boolean);

      setReservedBookIds(activeReservationIds);
    } catch (error) {
      console.error("Load reservation status error:", error);
      setReservedBookIds([]);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadBooks(),
        loadWalletBalance(),
        loadMyReservationStatus(),
      ]);
    };

    loadData();
  }, []);

  // ======================================================
  // RENT BOOK
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

    const rentalDays = Number(days);
    const rentalQuantity = Number(quantity);

    if (
      !Number.isInteger(rentalDays) ||
      rentalDays <= 0
    ) {
      setError(
        "Rental days must be greater than 0"
      );
      return;
    }

    if (
      !Number.isInteger(rentalQuantity) ||
      rentalQuantity <= 0
    ) {
      setError(
        "Quantity must be greater than 0"
      );
      return;
    }

    const availableCopies = Number(
      rentingBook.availableCopies ??
      rentingBook.quantity ??
      0
    );

    if (rentalQuantity > availableCopies) {
      setError(
        `Only ${availableCopies} copies are available`
      );
      return;
    }

    // ₹1 per day per copy
    const totalCost =
      rentalDays *
      rentalQuantity *
      1;

    // Wallet minus me nahi jana chahiye
    if (walletBalance < totalCost) {
      setError(
        `Insufficient wallet balance. Required: ₹${totalCost}, Available: ₹${walletBalance}`
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      await rentBook({
        bookId,
        days: rentalDays,
        quantity: rentalQuantity,
      });

      setMessage(
        "Book rented successfully!"
      );

      setRentingBook(null);
      setDays(7);
      setQuantity(1);

      // Latest data reload
      await Promise.all([
        loadBooks(),
        loadWalletBalance(),
      ]);
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
  // ======================================================

  const handleReservation = async (
    bookId
  ) => {
    if (!bookId) {
      setError("Book ID not found");
      return;
    }

    const bookIdStr = String(bookId);

    if (reservedBookIds.includes(bookIdStr)) {
      setError("You already have an active reservation for this book.");
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

      await loadMyReservationStatus();
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
  // RENT MODAL CALCULATION
  // ======================================================

  const estimatedTotal =
    Number(quantity || 0) *
    Number(days || 0) *
    1;

  const hasEnoughBalance =
    walletBalance >= estimatedTotal;

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-bold text-blue-900">
          Books
        </h1>

        <p className="mt-1 text-gray-500">
          Browse and rent available books.
        </p>
      </div>

      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* BOOKS */}

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
            const alreadyReserved =
              reservedBookIds.includes(
                String(
                  bookId
                )
              );
            const reserveDisabled =
              alreadyReserved ||
              actionLoading;

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

                {/* AVAILABLE + PRICE */}

                <div className="mt-4 rounded-lg bg-gray-50 p-3">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs text-gray-500">
                        Available Copies
                      </p>

                      <p
                        className={`text-lg font-bold ${
                          isAvailable
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {availableCopies}
                      </p>
                    </div>

                    <div className="text-right">

                      <p className="text-xs text-gray-500">
                        Rent Price
                      </p>

                      <p className="text-lg font-bold text-blue-900">
                        ₹1/day/copy
                      </p>

                    </div>

                  </div>

                  {/* RENT INFO */}

                  <p className="mt-2 text-xs text-gray-500">
                    Book rent is ₹1 per day per copy.
                  </p>

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
                    onClick={() => {

                      setRentingBook(book);
                      setQuantity(1);
                      setDays(7);
                      setError("");
                      setMessage("");

                    }}
                    className="flex-1 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {isAvailable
                      ? "Rent"
                      : "Unavailable"}
                  </button>

                  {/* RESERVE ONLY WHEN NO COPIES */}

                  {!isAvailable && (
                    <button
                      type="button"
                      disabled={reserveDisabled}
                      onClick={() =>
                        handleReservation(bookId)
                      }
                      className="flex-1 rounded-lg border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {alreadyReserved
                        ? "Reserved"
                        : "Reserve"}
                    </button>
                  )}

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
                  Complete rental details
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

            {/* BOOK NAME */}

            <div className="mt-5 rounded-xl bg-blue-50 p-4">

              <p className="text-sm text-blue-500">
                Book Name
              </p>

              <p className="mt-1 font-bold text-blue-900">
                {rentingBook.title}
              </p>

            </div>

            {/* AVAILABLE COPIES */}

            <div className="mt-4 rounded-lg border border-gray-200 p-3">

              <p className="text-sm text-gray-600">

                Available Copies:{" "}

                <span className="font-bold text-green-600">
                  {Number(
                    rentingBook.availableCopies ??
                    rentingBook.quantity ??
                    0
                  )}
                </span>

              </p>

            </div>

            {/* RENTAL DAYS */}

            <label className="mt-4 block text-sm font-medium text-gray-700">
              Rental Days
            </label>

            <input
              type="number"
              min="1"
              value={days}
              disabled={actionLoading}
              onChange={(e) => {
                const value = e.target.value;

                setDays(
                  value === ""
                    ? ""
                    : Number(value)
                );
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {/* QUANTITY */}

            <label className="mt-4 block text-sm font-medium text-gray-700">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              max={Number(
                rentingBook.availableCopies ??
                rentingBook.quantity ??
                1
              )}
              value={quantity}
              disabled={actionLoading}
              onChange={(e) => {

                const value =
                  e.target.value;

                setQuantity(
                  value === ""
                    ? ""
                    : Number(value)
                );

              }}
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {/* PRICE SUMMARY */}

            <div className="mt-4 space-y-2 rounded-lg bg-gray-50 p-3">

              {/* RENT PRICE */}

              <div className="flex justify-between text-sm">

                <span className="text-gray-600">
                  Rent Price
                </span>

                <span className="font-medium text-gray-900">
                  ₹1/day/copy
                </span>

              </div>

              {/* TOTAL */}

              <div className="flex justify-between text-sm">

                <span className="text-gray-600">
                  Estimated Total
                </span>

                <span className="font-bold text-blue-900">
                  ₹{estimatedTotal}
                </span>

              </div>

              {/* WALLET */}

              <div className="border-t border-gray-200 pt-2">

                <div className="flex justify-between">

                  <span className="text-sm text-gray-600">
                    Wallet Balance
                  </span>

                  <span
                    className={`font-bold ${
                      hasEnoughBalance
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ₹{walletBalance.toFixed(2)}
                  </span>

                </div>

              </div>

            </div>

            {/* INSUFFICIENT BALANCE */}

            {!hasEnoughBalance && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-red-600">
                  Insufficient wallet balance.
                </p>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={loadWalletBalance}
                  className="w-full rounded-lg border border-blue-600 px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Refresh Wallet Balance
                </button>
              </div>
            )}

            {/* BUTTONS */}

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                disabled={
                  actionLoading ||
                  !hasEnoughBalance ||
                  Number(quantity) <= 0 ||
                  Number(days) <= 0
                }
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