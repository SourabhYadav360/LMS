"use client";

import { useState } from "react";
import { rentBook } from "@/services/rental.service";

const RentBookModal = ({
  isOpen,
  onClose,
  book,
  onSuccess,
}) => {
  const [days, setDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal open nahi hai
  if (!isOpen) {
    return null;
  }

  // Book available nahi hai
  const isUnavailable =
    !book || book.availableCopies <= 0;

  // Rental amount = ₹1 per day
  const rentalAmount = Number(days || 0);

  // ======================================================
  // HANDLE RENT
  // ======================================================

  const handleRent = async (e) => {
    e.preventDefault();

    setError("");

    // Basic validation
    if (!book?.id) {
      setError("Book information is missing");
      return;
    }

    if (!days || Number(days) <= 0) {
      setError("Rental days must be greater than 0");
      return;
    }

    if (isUnavailable) {
      setError("This book is currently unavailable");
      return;
    }

    try {
      setLoading(true);

      const response = await rentBook({
        bookId: book.id,
        days: Number(days),
      });

      // Parent component ko response bhejenge
      if (onSuccess) {
        onSuccess(response);
      }

      // Modal close
      onClose();

      // Reset
      setDays(1);
      setError("");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to rent book";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const handleClose = () => {
    if (loading) return;

    setError("");
    setDays(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Rent Book
          </h2>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="text-2xl text-gray-500 hover:text-gray-800 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* ==================================================
            BODY
        ================================================== */}

        <form
          onSubmit={handleRent}
          className="space-y-5 p-6"
        >

          {/* BOOK DETAILS */}

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {book?.title || "Book"}
            </h3>

            {book?.author && (
              <p className="mt-1 text-sm text-gray-500">
                Author: {book.author}
              </p>
            )}

            <p className="mt-2 text-sm">
              Available Copies:{" "}
              <span
                className={
                  isUnavailable
                    ? "font-semibold text-red-600"
                    : "font-semibold text-green-600"
                }
              >
                {book?.availableCopies ?? 0}
              </span>
            </p>
          </div>

          {/* UNAVAILABLE MESSAGE */}

          {isUnavailable && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              This book is currently unavailable.
            </div>
          )}

          {/* RENTAL DAYS */}

          <div>
            <label
              htmlFor="rental-days"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Rental Days
            </label>

            <input
              id="rental-days"
              type="number"
              min="1"
              value={days}
              onChange={(e) =>
                setDays(e.target.value)
              }
              disabled={loading || isUnavailable}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              placeholder="Enter rental days"
            />
          </div>

          {/* PRICE */}

          <div className="rounded-lg border bg-blue-50 p-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Rental Rate</span>
              <span>₹1 / day</span>
            </div>

            <div className="mt-2 flex justify-between">
              <span className="font-medium text-gray-700">
                Total Rental Amount
              </span>

              <span className="text-lg font-bold text-blue-600">
                ₹{rentalAmount}
              </span>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ==================================================
              BUTTONS
          ================================================== */}

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                isUnavailable ||
                !days ||
                Number(days) <= 0
              }
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Renting..."
                : "Rent Book"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default RentBookModal;