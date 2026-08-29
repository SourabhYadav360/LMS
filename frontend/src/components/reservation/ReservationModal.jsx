"use client";

import { useState } from "react";

const ReservationModal = ({
  isOpen,
  onClose,
  onConfirm,
  reservation,
  loading = false,
}) => {
  const [reason, setReason] = useState("");

  // Modal open nahi hai
  if (!isOpen) {
    return null;
  }

  const handleConfirm = async () => {
    await onConfirm(reason);

    // Successful action ke baad input clear
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Cancel Reservation
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Are you sure you want to cancel this reservation?
          </p>
        </div>

        {/* ==================================================
            RESERVATION INFO
        ================================================== */}

        {reservation?.book && (
          <div className="mb-5 rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Book
            </p>

            <p className="font-medium text-gray-900">
              {reservation.book.title}
            </p>

            {reservation.book.author && (
              <p className="mt-1 text-sm text-gray-500">
                by {reservation.book.author}
              </p>
            )}
          </div>
        )}

        {/* ==================================================
            REASON
        ================================================== */}

        <div className="mb-5">
          <label
            htmlFor="reservation-cancel-reason"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Cancellation Reason
            <span className="ml-1 text-gray-400">
              (Optional)
            </span>
          </label>

          <textarea
            id="reservation-cancel-reason"
            value={reason}
            onChange={(e) =>
              setReason(e.target.value)
            }
            placeholder="Enter cancellation reason..."
            rows={4}
            disabled={loading}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
          />
        </div>

        {/* ==================================================
            ACTION BUTTONS
        ================================================== */}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Cancelling..."
              : "Cancel Reservation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;