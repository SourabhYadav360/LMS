"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  approveReservation,
  completeReservation,
  expireReservations,
  getAllReservations,
  rejectReservation,
} from "@/services/reservation.service";

export default function ReservationsPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const response = await getAllReservations();

      setItems(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          "Unable to load reservations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 0);

    return () =>
      window.clearTimeout(timer);
  }, []);

  const action = async (fn, id, reason) => {
    try {
      const response = await fn(id, reason);

      toast.success(
        response.message ||
          "Reservation updated."
      );

      load();
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          "Unable to update reservation."
      );
    }
  };

  const shown =
    status === "ALL"
      ? items
      : items.filter(
          (item) => item.status === status
        );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Operations
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Reservations
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review and manage book reservations.
          </p>
        </div>

        <button
          type="button"
          onClick={async () => {
            try {
              await expireReservations();

              toast.success(
                "Reservations expired."
              );

              load();
            } catch (e) {
              toast.error(
                e.response?.data?.message ||
                  "Unable to expire reservations."
              );
            }
          }}
          className="rounded-lg border px-4 py-2.5 text-sm font-semibold"
        >
          Expire overdue
        </button>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option>ALL</option>
          <option>PENDING</option>
          <option>APPROVED</option>
          <option>REJECTED</option>
          <option>CANCELLED</option>
          <option>COMPLETED</option>
          <option>EXPIRED</option>
        </select>
      </div>

      {loading ? (
        <State text="Loading reservations..." />
      ) : shown.length === 0 ? (
        <State text="No reservations found." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-4">Book</th>
                <th className="p-4">Member</th>
                <th className="p-4">Reserved</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {shown.map((item) => (
                <tr key={item.id}>
                  <td className="p-4 font-semibold">
                    {item.book?.title ||
                      item.bookId}
                  </td>

                  <td className="p-4">
                    {item.member?.name ||
                      item.memberId}
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
                    {item.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            action(
                              approveReservation,
                              item.id
                            )
                          }
                          className="mr-3 font-semibold text-emerald-700"
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            action(
                              rejectReservation,
                              item.id,
                              window.prompt(
                                "Rejection reason"
                              ) || ""
                            )
                          }
                          className="font-semibold text-red-600"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {item.status === "APPROVED" && (
                      <button
                        type="button"
                        onClick={() =>
                          action(
                            completeReservation,
                            item.id
                          )
                        }
                        className="font-semibold text-blue-700"
                      >
                        Complete
                      </button>
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