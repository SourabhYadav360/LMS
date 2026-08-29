"use client";

import ReservationStatus from "./ReservationStatus";

const ReservationCard = ({
  reservation,
  onCancel,
}) => {
  // ======================================================
  // SAFETY CHECK
  // ======================================================

  if (!reservation) {
    return null;
  }

  const {
    id,
    status,
    reservedAt,
    expiresAt,
    approvedAt,
    rejectedAt,
    cancelledAt,
    completedAt,
    rejectionReason,
    cancellationReason,
    book,
  } = reservation;

  // ======================================================
  // DATE FORMATTER
  // ======================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ======================================================
  // CANCEL BUTTON CONDITION
  // ======================================================

  const canCancel =
    status === "PENDING" ||
    status === "APPROVED";

  // ======================================================
  // RETURN
  // ======================================================

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Reservation #{id}
          </p>

          <h2 className="mt-1 text-lg font-semibold text-gray-900">
            {book?.title || "Book unavailable"}
          </h2>

          {book?.author && (
            <p className="mt-1 text-sm text-gray-500">
              by {book.author}
            </p>
          )}
        </div>

        <ReservationStatus status={status} />
      </div>

      {/* ==================================================
          BOOK INFORMATION
      ================================================== */}

      {book && (
        <div className="mt-5 grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500">
              ISBN
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {book.isbn || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Book Status
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {book.status || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Available Copies
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {book.availableCopies ?? 0}
            </p>
          </div>
        </div>
      )}

      {/* ==================================================
          RESERVATION DETAILS
      ================================================== */}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-gray-500">
            Reserved At
          </p>

          <p className="mt-1 text-sm font-medium text-gray-800">
            {formatDateTime(reservedAt)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            Expires At
          </p>

          <p className="mt-1 text-sm font-medium text-gray-800">
            {formatDateTime(expiresAt)}
          </p>
        </div>

        {approvedAt && (
          <div>
            <p className="text-xs text-gray-500">
              Approved At
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {formatDateTime(approvedAt)}
            </p>
          </div>
        )}

        {rejectedAt && (
          <div>
            <p className="text-xs text-gray-500">
              Rejected At
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {formatDateTime(rejectedAt)}
            </p>
          </div>
        )}

        {cancelledAt && (
          <div>
            <p className="text-xs text-gray-500">
              Cancelled At
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {formatDateTime(cancelledAt)}
            </p>
          </div>
        )}

        {completedAt && (
          <div>
            <p className="text-xs text-gray-500">
              Completed At
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {formatDateTime(completedAt)}
            </p>
          </div>
        )}
      </div>

      {/* ==================================================
          REJECTION REASON
      ================================================== */}

      {status === "REJECTED" &&
        rejectionReason && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-semibold text-red-700">
              Rejection Reason
            </p>

            <p className="mt-1 text-sm text-red-600">
              {rejectionReason}
            </p>
          </div>
        )}

      {/* ==================================================
          CANCELLATION REASON
      ================================================== */}

      {status === "CANCELLED" &&
        cancellationReason && (
          <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-700">
              Cancellation Reason
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {cancellationReason}
            </p>
          </div>
        )}

      {/* ==================================================
          ACTIONS
      ================================================== */}

      {canCancel && (
        <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => onCancel(reservation)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Cancel Reservation
          </button>
        </div>
      )}
    </div>
  );
};

export default ReservationCard;