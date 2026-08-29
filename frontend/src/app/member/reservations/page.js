"use client";

import { useEffect, useState } from "react";

import {
  getMyReservations,
  cancelReservation,
} from "@/services/reservation.service";

const ReservationsPage = () => {
  // ======================================================
  // RESERVATIONS
  // ======================================================

  const [reservations, setReservations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // ======================================================
  // ERROR / SUCCESS
  // ======================================================

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ======================================================
  // CANCEL
  // ======================================================

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const [selectedReservation, setSelectedReservation] =
    useState(null);

  const [cancelReason, setCancelReason] =
    useState("");

  const [cancelling, setCancelling] =
    useState(false);

  // ======================================================
  // FETCH RESERVATIONS
  // ======================================================

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getMyReservations();

      console.log(
        "MY RESERVATIONS:",
        response
      );

      setReservations(
        response?.data?.reservations || []
      );
    } catch (error) {
      console.error(
        "Get reservations error:",
        error
      );

      setError(
        error?.message ||
          "Failed to fetch reservations"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchReservations();
  }, []);

  // ======================================================
  // GET STATUS CONFIG
  // ======================================================

  const getStatusConfig = (status) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pending",
          className:
            "bg-yellow-100 text-yellow-700",
          dotClass:
            "bg-yellow-500",
        };

      case "APPROVED":
        return {
          label: "Approved",
          className:
            "bg-blue-100 text-blue-700",
          dotClass:
            "bg-blue-500",
        };

      case "COMPLETED":
        return {
          label: "Completed",
          className:
            "bg-green-100 text-green-700",
          dotClass:
            "bg-green-500",
        };

      case "CANCELLED":
        return {
          label: "Cancelled",
          className:
            "bg-gray-100 text-gray-600",
          dotClass:
            "bg-gray-500",
        };

      case "REJECTED":
        return {
          label: "Rejected",
          className:
            "bg-red-100 text-red-700",
          dotClass:
            "bg-red-500",
        };

      case "EXPIRED":
        return {
          label: "Expired",
          className:
            "bg-orange-100 text-orange-700",
          dotClass:
            "bg-orange-500",
        };

      default:
        return {
          label: status || "Unknown",
          className:
            "bg-gray-100 text-gray-600",
          dotClass:
            "bg-gray-500",
        };
    }
  };

  // ======================================================
  // OPEN CANCEL MODAL
  // ======================================================

  const openCancelModal = (
    reservation
  ) => {
    setSelectedReservation(
      reservation
    );

    setCancelReason("");

    setError("");

    setSuccess("");

    setShowCancelModal(true);
  };

  // ======================================================
  // CLOSE CANCEL MODAL
  // ======================================================

  const closeCancelModal = () => {
    if (cancelling) {
      return;
    }

    setShowCancelModal(false);

    setSelectedReservation(null);

    setCancelReason("");

    setError("");
  };

  // ======================================================
  // CANCEL RESERVATION
  // ======================================================

  const handleCancelReservation =
    async () => {
      if (!selectedReservation) {
        setError(
          "Reservation not selected"
        );

        return;
      }

      try {
        setCancelling(true);

        setError("");

        setSuccess("");

        const response =
          await cancelReservation(
            selectedReservation.id,
            cancelReason
          );

        console.log(
          "CANCEL RESERVATION RESPONSE:",
          response
        );

        // ------------------------------------------------
        // SUCCESS
        // ------------------------------------------------

        setSuccess(
          "Reservation cancelled successfully."
        );

        // ------------------------------------------------
        // CLOSE MODAL
        // ------------------------------------------------

        setShowCancelModal(false);

        setSelectedReservation(null);

        setCancelReason("");

        // ------------------------------------------------
        // REFRESH
        // ------------------------------------------------

        await fetchReservations();
      } catch (error) {
        console.error(
          "Cancel reservation error:",
          error
        );

        setError(
          error?.message ||
            "Failed to cancel reservation"
        );
      } finally {
        setCancelling(false);
      }
    };

  // ======================================================
  // CAN CANCEL?
  // ======================================================

  const canCancel = (status) => {
    return (
      status === "PENDING" ||
      status === "APPROVED"
    );
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ======================================================
  // CALCULATE ACTIVE COUNT
  // ======================================================

  const activeReservations =
    reservations.filter(
      (reservation) =>
        reservation.status ===
          "PENDING" ||
        reservation.status ===
          "APPROVED"
    ).length;

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

          <p className="mt-4 text-gray-600">
            Loading reservations...
          </p>

        </div>
      </div>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>

            <h1 className="text-3xl font-bold text-gray-900">
              My Reservations
            </h1>

            <p className="mt-1 text-gray-500">
              Track your reserved books and
              reservation queue status.
            </p>

          </div>

          {/* ACTIVE COUNT */}

          <div className="rounded-2xl border bg-white px-6 py-4 shadow-sm">

            <p className="text-sm text-gray-500">
              Active Reservations
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {activeReservations}
            </p>

          </div>

        </div>

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                ✓
              </div>

              <p className="text-sm font-medium text-green-700">
                {success}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="text-green-600 hover:text-green-800"
            >
              ✕
            </button>

          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {error &&
          !showCancelModal && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
                  !
                </div>

                <p className="text-sm font-medium text-red-700">
                  {error}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>

            </div>
          )}

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {reservations.length === 0 ? (

          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">

            <div className="text-7xl">
              📚
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              No reservations yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              You haven't reserved any books yet.
              Go to the books page and reserve a
              book to join the queue.
            </p>

          </div>

        ) : (

          /* ==================================================
             RESERVATION LIST
          ================================================== */

          <div className="space-y-5">

            {reservations.map(
              (
                reservation,
                index
              ) => {

                const statusConfig =
                  getStatusConfig(
                    reservation.status
                  );

                const book =
                  reservation.book;

                return (
                  <div
                    key={reservation.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                  >

                    {/* ==================================================
                        TOP BAR
                    ================================================== */}

                    <div className="flex flex-col gap-3 border-b bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-3">

                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                          #{index + 1}
                        </span>

                        <div>

                          <p className="text-xs text-gray-500">
                            Reservation ID
                          </p>

                          <p className="font-semibold text-gray-900">
                            #{reservation.id}
                          </p>

                        </div>

                      </div>

                      {/* STATUS */}

                      <span
                        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${statusConfig.className}`}
                      >

                        <span
                          className={`h-2 w-2 rounded-full ${statusConfig.dotClass}`}
                        />

                        {
                          statusConfig.label
                        }

                      </span>

                    </div>

                    {/* ==================================================
                        CONTENT
                    ================================================== */}

                    <div className="p-5">

                      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">

                        {/* BOOK */}

                        <div className="flex gap-4">

                          <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-4xl">
                            📚
                          </div>

                          <div className="min-w-0">

                            <h2 className="text-xl font-bold text-gray-900">
                              {
                                book?.title ||
                                "Book unavailable"
                              }
                            </h2>

                            <p className="mt-1 text-sm text-gray-600">
                              <span className="font-medium">
                                Author:
                              </span>{" "}
                              {book?.author ||
                                "N/A"}
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                              <span className="font-medium">
                                ISBN:
                              </span>{" "}
                              {book?.isbn ||
                                "N/A"}
                            </p>

                          </div>

                        </div>

                        {/* QUEUE INFO */}

                        <div className="rounded-xl bg-blue-50 p-4 lg:min-w-[230px]">

                          <div className="flex items-center gap-2">

                            <span className="text-lg">
                              🔄
                            </span>

                            <p className="font-semibold text-blue-900">
                              FIFO Queue
                            </p>

                          </div>

                          <p className="mt-2 text-xs leading-5 text-blue-700">
                            Reservations are processed
                            in the order they were
                            created.
                          </p>

                        </div>

                      </div>

                      {/* ==================================================
                          DETAILS
                      ================================================== */}

                      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                        {/* RESERVED */}

                        <div className="rounded-xl bg-gray-50 p-4">

                          <p className="text-xs text-gray-500">
                            Reserved At
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {formatDate(
                              reservation.reservedAt
                            )}
                          </p>

                        </div>

                        {/* EXPIRES */}

                        <div className="rounded-xl bg-gray-50 p-4">

                          <p className="text-xs text-gray-500">
                            Expires At
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {formatDate(
                              reservation.expiresAt
                            )}
                          </p>

                        </div>

                        {/* APPROVED */}

                        <div className="rounded-xl bg-gray-50 p-4">

                          <p className="text-xs text-gray-500">
                            Approved At
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {formatDate(
                              reservation.approvedAt
                            )}
                          </p>

                        </div>

                        {/* COMPLETED */}

                        <div className="rounded-xl bg-gray-50 p-4">

                          <p className="text-xs text-gray-500">
                            Completed At
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {formatDate(
                              reservation.completedAt
                            )}
                          </p>

                        </div>

                      </div>

                      {/* ==================================================
                          REJECTION / CANCELLATION REASON
                      ================================================== */}

                      {reservation.rejectionReason && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">

                          <p className="text-sm font-semibold text-red-800">
                            Rejection Reason
                          </p>

                          <p className="mt-1 text-sm text-red-700">
                            {
                              reservation.rejectionReason
                            }
                          </p>

                        </div>
                      )}

                      {reservation.cancellationReason && (
                        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">

                          <p className="text-sm font-semibold text-gray-700">
                            Cancellation Reason
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            {
                              reservation.cancellationReason
                            }
                          </p>

                        </div>
                      )}

                      {/* ==================================================
                          ACTIONS
                      ================================================== */}

                      {canCancel(
                        reservation.status
                      ) && (

                        <div className="mt-6 flex justify-end">

                          <button
                            type="button"
                            onClick={() =>
                              openCancelModal(
                                reservation
                              )
                            }
                            className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Cancel Reservation
                          </button>

                        </div>

                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

      {/* ====================================================
          CANCEL MODAL
      ==================================================== */}

      {showCancelModal &&
        selectedReservation && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

              {/* HEADER */}

              <div className="flex items-start justify-between">

                <div>

                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl">
                    ⚠️
                  </div>

                  <h2 className="text-xl font-bold text-gray-900">
                    Cancel Reservation
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Are you sure you want to cancel
                    this reservation?
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeCancelModal
                  }
                  disabled={cancelling}
                  className="text-xl text-gray-400 hover:text-gray-700 disabled:opacity-50"
                >
                  ✕
                </button>

              </div>

              {/* BOOK */}

              <div className="mt-5 rounded-xl bg-gray-50 p-4">

                <p className="text-xs text-gray-500">
                  Book
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {
                    selectedReservation
                      .book?.title ||
                    "Unknown Book"
                  }
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Reservation ID: #
                  {
                    selectedReservation.id
                  }
                </p>

              </div>

              {/* REASON */}

              <div className="mt-5">

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Cancellation Reason
                  <span className="ml-1 text-gray-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  value={cancelReason}
                  onChange={(e) => {

                    setCancelReason(
                      e.target.value
                    );

                    setError("");

                  }}
                  disabled={cancelling}
                  rows={4}
                  maxLength={500}
                  placeholder="Why do you want to cancel this reservation?"
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {
                    cancelReason.length
                  }
                  /500
                </p>

              </div>

              {/* ERROR */}

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* BUTTONS */}

              <div className="mt-6 flex gap-3">

                <button
                  type="button"
                  onClick={
                    closeCancelModal
                  }
                  disabled={cancelling}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Keep Reservation
                </button>

                <button
                  type="button"
                  onClick={
                    handleCancelReservation
                  }
                  disabled={cancelling}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >

                  {cancelling
                    ? "Cancelling..."
                    : "Yes, Cancel"}

                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
};

export default ReservationsPage;