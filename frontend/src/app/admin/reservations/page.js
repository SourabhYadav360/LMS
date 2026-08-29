"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getAllReservations,
  approveReservation,
  rejectReservation,
  completeReservation,
} from "@/services/reservation.service";

export default function AdminReservationsPage() {
  // =====================================================
  // STATES
  // =====================================================

  const [reservations, setReservations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [rejectModal, setRejectModal] =
    useState(null);

  const [rejectReason, setRejectReason] =
    useState("");

  // =====================================================
  // LOAD RESERVATIONS
  // =====================================================

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAllReservations();

      console.log(
        "Reservations response:",
        response
      );

      const reservationList =
        response?.data?.reservations ||
        response?.data ||
        [];

      setReservations(
        Array.isArray(reservationList)
          ? reservationList
          : []
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to load reservations"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLEAR MESSAGES
  // =====================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // =====================================================
  // APPROVE
  // =====================================================

  const handleApprove = async (
    reservationId
  ) => {
    try {
      clearMessages();

      setActionLoading(reservationId);

      await approveReservation(
        reservationId
      );

      setSuccess(
        "Reservation approved successfully."
      );

      await loadReservations();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to approve reservation."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // REJECT
  // =====================================================

  const openRejectModal = (reservation) => {
    clearMessages();

    setRejectReason("");

    setRejectModal(reservation);
  };

  const closeRejectModal = () => {
    setRejectModal(null);

    setRejectReason("");
  };

  const handleReject = async () => {
    if (!rejectModal) {
      return;
    }

    try {
      clearMessages();

      setActionLoading(
        rejectModal.id
      );

      await rejectReservation(
        rejectModal.id,
        rejectReason
      );

      setSuccess(
        "Reservation rejected successfully."
      );

      closeRejectModal();

      await loadReservations();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to reject reservation."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // COMPLETE
  // =====================================================

  const handleComplete = async (
    reservationId
  ) => {
    try {
      clearMessages();

      setActionLoading(reservationId);

      await completeReservation(
        reservationId
      );

      setSuccess(
        "Reservation completed successfully."
      );

      await loadReservations();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Failed to complete reservation."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // FILTER RESERVATIONS
  // =====================================================

  const filteredReservations = useMemo(() => {
    return reservations.filter(
      (reservation) => {
        // ---------------------------------------------
        // STATUS FILTER
        // ---------------------------------------------

        const reservationStatus =
          String(
            reservation.status || ""
          ).toUpperCase();

        if (
          statusFilter !== "ALL" &&
          reservationStatus !== statusFilter
        ) {
          return false;
        }

        // ---------------------------------------------
        // SEARCH
        // ---------------------------------------------

        const member =
          reservation.member || {};

        const book =
          reservation.book || {};

        const searchText =
          [
            member.name,
            member.email,
            book.title,
            book.isbn,
            reservation.id,
            reservation.status,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchText.includes(
          search.toLowerCase()
        );
      }
    );
  }, [
    reservations,
    statusFilter,
    search,
  ]);

  // =====================================================
  // STATS
  // =====================================================

  const stats = useMemo(() => {
    const total = reservations.length;

    const pending = reservations.filter(
      (reservation) =>
        String(
          reservation.status || ""
        ).toUpperCase() === "PENDING"
    ).length;

    const approved = reservations.filter(
      (reservation) =>
        String(
          reservation.status || ""
        ).toUpperCase() === "APPROVED"
    ).length;

    const completed = reservations.filter(
      (reservation) =>
        String(
          reservation.status || ""
        ).toUpperCase() === "COMPLETED"
    ).length;

    const rejected = reservations.filter(
      (reservation) =>
        String(
          reservation.status || ""
        ).toUpperCase() === "REJECTED"
    ).length;

    const cancelled = reservations.filter(
      (reservation) =>
        String(
          reservation.status || ""
        ).toUpperCase() === "CANCELLED"
    ).length;

    return {
      total,
      pending,
      approved,
      completed,
      rejected,
      cancelled,
    };
  }, [reservations]);

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusStyle = (status) => {
    switch (
      String(status || "").toUpperCase()
    ) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "APPROVED":
        return "bg-blue-100 text-blue-700";

      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "CANCELLED":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // =====================================================
  // GET MEMBER
  // =====================================================

  const getMember = (reservation) => {
    return (
      reservation.member ||
      reservation.Member ||
      {}
    );
  };

  // =====================================================
  // GET BOOK
  // =====================================================

  const getBook = (reservation) => {
    return (
      reservation.book ||
      reservation.Book ||
      {}
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-6">

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Reservation Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage member book reservations
              and reservation requests.
            </p>
          </div>

          <button
            type="button"
            onClick={loadReservations}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>

        </div>

      </div>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="font-bold"
          >
            ×
          </button>

        </div>
      )}

      {/* ================================================= */}
      {/* SUCCESS */}
      {/* ================================================= */}

      {success && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="font-bold"
          >
            ×
          </button>

        </div>
      )}

      {/* ================================================= */}
      {/* STATS */}
      {/* ================================================= */}

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

        {/* TOTAL */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Total
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.total}
          </p>

        </div>

        {/* PENDING */}

        <div className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Pending
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {stats.pending}
          </p>

        </div>

        {/* APPROVED */}

        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Approved
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {stats.approved}
          </p>

        </div>

        {/* COMPLETED */}

        <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Completed
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {stats.completed}
          </p>

        </div>

        {/* REJECTED */}

        <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Rejected
          </p>

          <p className="mt-2 text-2xl font-bold text-red-600">
            {stats.rejected}
          </p>

        </div>

        {/* CANCELLED */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Cancelled
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-600">
            {stats.cancelled}
          </p>

        </div>

      </div>

      {/* ================================================= */}
      {/* FILTER BAR */}
      {/* ================================================= */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="grid gap-4 md:grid-cols-2">

          {/* SEARCH */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Search
            </label>

            <div className="relative">

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search member, email, book..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

          {/* STATUS */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >

              <option value="ALL">
                All Status
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="APPROVED">
                Approved
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="REJECTED">
                Rejected
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>

            </select>

          </div>

        </div>

        <div className="mt-4 flex items-center justify-between">

          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredReservations.length}
            </span>{" "}
            reservations
          </p>

          {(search ||
            statusFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </button>
          )}

        </div>

      </div>

      {/* ================================================= */}
      {/* TABLE */}
      {/* ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-5 py-4">

          <h2 className="font-semibold text-slate-900">
            Reservations
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Review and manage reservation requests.
          </p>

        </div>

        {loading ? (
          <div className="p-12 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading reservations...
            </p>

          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-12 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              📚
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              No reservations found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or
              status filter.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Reservation
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Member
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Book
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredReservations.map(
                  (reservation) => {
                    const member =
                      getMember(
                        reservation
                      );

                    const book =
                      getBook(
                        reservation
                      );

                    const status =
                      String(
                        reservation.status ||
                          ""
                      ).toUpperCase();

                    const isProcessing =
                      actionLoading ===
                      reservation.id;

                    return (
                      <tr
                        key={
                          reservation.id
                        }
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >

                        {/* RESERVATION */}

                        <td className="px-5 py-4">

                          <p className="font-semibold text-slate-800">
                            #
                            {
                              reservation.id
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Reservation ID
                          </p>

                        </td>

                        {/* MEMBER */}

                        <td className="px-5 py-4">

                          <p className="font-semibold text-slate-800">
                            {member.name ||
                              member.fullName ||
                              "Unknown Member"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {member.email ||
                              "-"}
                          </p>

                        </td>

                        {/* BOOK */}

                        <td className="px-5 py-4">

                          <p className="max-w-[220px] truncate font-semibold text-slate-800">
                            {book.title ||
                              "Unknown Book"}
                          </p>

                          {book.isbn && (
                            <p className="mt-1 text-xs text-slate-500">
                              ISBN:{" "}
                              {book.isbn}
                            </p>
                          )}

                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4">

                          <p className="text-sm text-slate-700">
                            {formatDate(
                              reservation.createdAt ||
                                reservation.reservedAt
                            )}
                          </p>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                              status
                            )}`}
                          >
                            {status ||
                              "UNKNOWN"}
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            {/* PENDING */}

                            {status ===
                              "PENDING" && (
                              <>
                                <button
                                  type="button"
                                  disabled={
                                    isProcessing
                                  }
                                  onClick={() =>
                                    handleApprove(
                                      reservation.id
                                    )
                                  }
                                  className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                                >
                                  {isProcessing
                                    ? "..."
                                    : "Approve"}
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    isProcessing
                                  }
                                  onClick={() =>
                                    openRejectModal(
                                      reservation
                                    )
                                  }
                                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {/* APPROVED */}

                            {status ===
                              "APPROVED" && (
                              <button
                                type="button"
                                disabled={
                                  isProcessing
                                }
                                onClick={() =>
                                  handleComplete(
                                    reservation.id
                                  )
                                }
                                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                              >
                                {isProcessing
                                  ? "..."
                                  : "Complete"}
                              </button>
                            )}

                            {/* COMPLETED */}

                            {status ===
                              "COMPLETED" && (
                              <span className="px-3 py-2 text-xs font-semibold text-green-600">
                                ✓ Completed
                              </span>
                            )}

                            {/* REJECTED */}

                            {status ===
                              "REJECTED" && (
                              <span className="px-3 py-2 text-xs font-semibold text-red-500">
                                Rejected
                              </span>
                            )}

                            {/* CANCELLED */}

                            {status ===
                              "CANCELLED" && (
                              <span className="px-3 py-2 text-xs font-semibold text-slate-500">
                                Cancelled
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
        )}

      </div>

      {/* ================================================= */}
      {/* REJECT MODAL */}
      {/* ================================================= */}

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-5">

              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl">
                !
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Reject Reservation
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Are you sure you want to reject
                reservation #
                {rejectModal.id}?
              </p>

            </div>

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Rejection Reason
              </label>

              <textarea
                value={rejectReason}
                onChange={(e) =>
                  setRejectReason(
                    e.target.value
                  )
                }
                rows={4}
                placeholder="Enter reason..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
              />

            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={closeRejectModal}
                disabled={
                  actionLoading ===
                  rejectModal.id
                }
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={
                  actionLoading ===
                  rejectModal.id
                }
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ===
                rejectModal.id
                  ? "Rejecting..."
                  : "Reject Reservation"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}