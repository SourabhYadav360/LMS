"use client";

import { useEffect, useState } from "react";

import {
  getAllReservations,
  approveReservation,
  rejectReservation,
  completeReservation,
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
  // ACTION LOADING
  // ======================================================

  const [actionLoading, setActionLoading] =
    useState(false);

  const [selectedReservation, setSelectedReservation] =
    useState(null);

  // ======================================================
  // REJECT MODAL
  // ======================================================

  const [showRejectModal, setShowRejectModal] =
    useState(false);

  const [rejectReason, setRejectReason] =
    useState("");

  // ======================================================
  // MESSAGE
  // ======================================================

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ======================================================
  // FILTER
  // ======================================================

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  // ======================================================
  // FETCH RESERVATIONS
  // ======================================================

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAllReservations();

      console.log(
        "RESERVATIONS RESPONSE:",
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
  // CLEAR MESSAGES
  // ======================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // ======================================================
  // APPROVE RESERVATION
  // ======================================================

  const handleApprove = async (
    reservationId
  ) => {
    try {
      clearMessages();

      setActionLoading(true);

      await approveReservation(
        reservationId
      );

      setSuccess(
        "Reservation approved successfully."
      );

      await fetchReservations();
    } catch (error) {
      console.error(
        "Approve reservation error:",
        error
      );

      setError(
        error?.message ||
          "Failed to approve reservation"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ======================================================
  // OPEN REJECT MODAL
  // ======================================================

  const openRejectModal = (
    reservation
  ) => {
    clearMessages();

    setSelectedReservation(
      reservation
    );

    setRejectReason("");

    setShowRejectModal(true);
  };

  // ======================================================
  // CLOSE REJECT MODAL
  // ======================================================

  const closeRejectModal = () => {
    if (actionLoading) {
      return;
    }

    setShowRejectModal(false);

    setSelectedReservation(null);

    setRejectReason("");
  };

  // ======================================================
  // REJECT RESERVATION
  // ======================================================

  const handleReject = async () => {
    if (!selectedReservation) {
      return;
    }

    if (!rejectReason.trim()) {
      setError(
        "Please enter a rejection reason."
      );

      return;
    }

    try {
      clearMessages();

      setActionLoading(true);

      await rejectReservation(
        selectedReservation.id,
        rejectReason.trim()
      );

      setSuccess(
        "Reservation rejected successfully."
      );

      setShowRejectModal(false);

      setSelectedReservation(null);

      setRejectReason("");

      await fetchReservations();
    } catch (error) {
      console.error(
        "Reject reservation error:",
        error
      );

      setError(
        error?.message ||
          "Failed to reject reservation"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ======================================================
  // COMPLETE RESERVATION
  // ======================================================

  const handleComplete = async (
    reservationId
  ) => {
    try {
      clearMessages();

      setActionLoading(true);

      await completeReservation(
        reservationId
      );

      setSuccess(
        "Reservation completed successfully."
      );

      await fetchReservations();
    } catch (error) {
      console.error(
        "Complete reservation error:",
        error
      );

      setError(
        error?.message ||
          "Failed to complete reservation"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ======================================================
  // FILTER RESERVATIONS
  // ======================================================

  const filteredReservations =
    statusFilter === "ALL"
      ? reservations
      : reservations.filter(
          (reservation) =>
            reservation.status ===
            statusFilter
        );

  // ======================================================
  // STATUS STYLE
  // ======================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "APPROVED":
        return "bg-blue-100 text-blue-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "CANCELLED":
        return "bg-gray-100 text-gray-700";

      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "EXPIRED":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
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
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

          <p className="text-gray-600">
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

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>

            <h1 className="text-3xl font-bold text-gray-900">
              Reservations
            </h1>

            <p className="mt-1 text-gray-500">
              Manage member book reservations.
            </p>

          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={fetchReservations}
            disabled={loading}
            className="rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            Refresh
          </button>

        </div>

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {success}
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {error &&
          !showRejectModal && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

        {/* ==================================================
            STATS
        ================================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Total
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {reservations.length}
            </p>

          </div>

          {/* PENDING */}

          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {
                reservations.filter(
                  (item) =>
                    item.status ===
                    "PENDING"
                ).length
              }
            </p>

          </div>

          {/* APPROVED */}

          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Approved
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {
                reservations.filter(
                  (item) =>
                    item.status ===
                    "APPROVED"
                ).length
              }
            </p>

          </div>

          {/* COMPLETED */}

          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <p className="text-sm text-gray-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {
                reservations.filter(
                  (item) =>
                    item.status ===
                    "COMPLETED"
                ).length
              }
            </p>

          </div>

        </div>

        {/* ==================================================
            FILTER
        ================================================== */}

        <div className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="font-semibold text-gray-900">
                Reservation List
              </h2>

              <p className="text-sm text-gray-500">
                Filter reservations by status.
              </p>

            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="rounded-lg border px-4 py-2.5 outline-none focus:border-black"
            >

              <option value="ALL">
                All Reservations
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="APPROVED">
                Approved
              </option>

              <option value="REJECTED">
                Rejected
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="EXPIRED">
                Expired
              </option>

            </select>

          </div>

        </div>

        {/* ==================================================
            EMPTY
        ================================================== */}

        {filteredReservations.length ===
        0 ? (

          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">

            <div className="text-5xl">
              📚
            </div>

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              No reservations found
            </h2>

            <p className="mt-2 text-gray-500">
              There are no reservations
              matching the selected filter.
            </p>

          </div>

        ) : (

          /* ==================================================
             DESKTOP TABLE
          ================================================== */

          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="border-b bg-gray-50">

                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Member
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Book
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Reserved At
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Expires At
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y">

                  {filteredReservations.map(
                    (reservation) => {

                      const member =
                        reservation.member;

                      const book =
                        reservation.book;

                      return (

                        <tr
                          key={
                            reservation.id
                          }
                          className="transition hover:bg-gray-50"
                        >

                          {/* MEMBER */}

                          <td className="px-5 py-5">

                            <p className="font-semibold text-gray-900">
                              {
                                member?.name ||
                                "Unknown Member"
                              }
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              {
                                member?.email ||
                                "N/A"
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              ID:{" "}
                              {
                                reservation.memberId
                              }
                            </p>

                          </td>

                          {/* BOOK */}

                          <td className="px-5 py-5">

                            <p className="font-semibold text-gray-900">
                              {
                                book?.title ||
                                "Unknown Book"
                              }
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              {
                                book?.author ||
                                "N/A"
                              }
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              ISBN:{" "}
                              {
                                book?.isbn ||
                                "N/A"
                              }
                            </p>

                          </td>

                          {/* RESERVED */}

                          <td className="whitespace-nowrap px-5 py-5 text-sm text-gray-600">
                            {formatDate(
                              reservation.reservedAt
                            )}
                          </td>

                          {/* EXPIRES */}

                          <td className="whitespace-nowrap px-5 py-5 text-sm text-gray-600">
                            {formatDate(
                              reservation.expiresAt
                            )}
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-5">

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                reservation.status
                              )}`}
                            >
                              {
                                reservation.status
                              }
                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td className="px-5 py-5">

                            <div className="flex justify-end gap-2">

                              {/* APPROVE */}

                              {reservation.status ===
                                "PENDING" && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleApprove(
                                      reservation.id
                                    )
                                  }
                                  disabled={
                                    actionLoading
                                  }
                                  className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Approve
                                </button>

                              )}

                              {/* REJECT */}

                              {reservation.status ===
                                "PENDING" && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    openRejectModal(
                                      reservation
                                    )
                                  }
                                  disabled={
                                    actionLoading
                                  }
                                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Reject
                                </button>

                              )}

                              {/* COMPLETE */}

                              {reservation.status ===
                                "APPROVED" && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleComplete(
                                      reservation.id
                                    )
                                  }
                                  disabled={
                                    actionLoading
                                  }
                                  className="rounded-lg bg-black px-3 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Complete
                                </button>

                              )}

                              {/* NO ACTION */}

                              {[
                                "REJECTED",
                                "CANCELLED",
                                "COMPLETED",
                                "EXPIRED",
                              ].includes(
                                reservation.status
                              ) && (

                                <span className="text-xs text-gray-400">
                                  No action
                                </span>

                              )}

                            </div>

                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

      {/* ====================================================
          REJECT MODAL
      ==================================================== */}

      {showRejectModal &&
        selectedReservation && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

              {/* HEADER */}

              <div className="flex items-start justify-between">

                <div>

                  <h2 className="text-xl font-bold text-gray-900">
                    Reject Reservation
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Provide a reason for rejection.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeRejectModal
                  }
                  disabled={
                    actionLoading
                  }
                  className="text-xl text-gray-400 hover:text-gray-700 disabled:opacity-50"
                >
                  ✕
                </button>

              </div>

              {/* RESERVATION INFO */}

              <div className="mt-5 rounded-xl bg-gray-50 p-4">

                <p className="text-sm text-gray-500">
                  Member
                </p>

                <p className="font-semibold text-gray-900">
                  {
                    selectedReservation
                      .member?.name ||
                    "Unknown Member"
                  }
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  Book
                </p>

                <p className="font-semibold text-gray-900">
                  {
                    selectedReservation
                      .book?.title ||
                    "Unknown Book"
                  }
                </p>

              </div>

              {/* REASON */}

              <div className="mt-5">

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Rejection Reason
                </label>

                <textarea
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(
                      e.target.value
                    );

                    setError("");
                  }}
                  disabled={
                    actionLoading
                  }
                  rows={4}
                  placeholder="Enter rejection reason..."
                  className="w-full resize-none rounded-lg border px-4 py-3 outline-none focus:border-black disabled:bg-gray-100"
                />

              </div>

              {/* MODAL ERROR */}

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* BUTTONS */}

              <div className="mt-6 flex gap-3">

                <button
                  type="button"
                  onClick={
                    closeRejectModal
                  }
                  disabled={
                    actionLoading
                  }
                  className="flex-1 rounded-lg border px-4 py-3 font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleReject
                  }
                  disabled={
                    actionLoading ||
                    !rejectReason.trim()
                  }
                  className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  {actionLoading
                    ? "Rejecting..."
                    : "Reject Reservation"}
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
};

export default ReservationsPage;