"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

import {
  cancelReservation,
  getMyReservations,
} from "@/services/reservation.service";

export default function MemberReservationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const response = await getMyReservations();

      setItems(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load reservations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const cancel = async (item) => {
    const reason = window.prompt(
      "Cancellation reason",
      "No longer needed"
    );

    if (!reason) {
      return;
    }

    try {
      const response = await cancelReservation(
        item.id,
        reason
      );

      toast.success(
        response.message ||
          "Reservation cancelled."
      );

      load();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to cancel reservation."
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          History
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          My Reservations
        </h1>
      </div>

      {loading ? (
        <State text="Loading reservations..." />
      ) : items.length === 0 ? (
        <State text="No reservations yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-4">Book</th>
                <th className="p-4">Reserved</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="p-4 font-semibold">
                    {item.book?.title || item.bookId}
                  </td>

                  <td className="p-4">
                    {item.reservedAt
                      ? new Date(
                          item.reservedAt
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-4">
                    {item.status}
                  </td>

                  <td className="p-4 text-right">
                    {[
                      "PENDING",
                      "APPROVED",
                    ].includes(item.status) && (
                      <button
                        type="button"
                        onClick={() => cancel(item)}
                        className="font-semibold text-red-600"
                      >
                        Cancel
                      </button>
                    )}

                    {item.status === "COMPLETED" && (
                      <Link
                        href="/member/rentals"
                        className="font-semibold text-blue-700"
                      >
                        View rental
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function State({ text }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-xl border bg-white text-sm text-slate-500">
      {text}
    </div>
  );
}