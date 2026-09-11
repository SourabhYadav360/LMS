"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getAllRentals,
} from "@/services/rental.service";

export default function RentalsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);

      const response = await getAllRentals();

      setItems(response.data?.rentals || []);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Unable to load rentals."
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

  const shown =
    status === "ALL"
      ? items
      : items.filter(
          (item) => item.status === status
        );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          Operations
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Rentals
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Track active, overdue and returned books.
        </p>
      </div>

      <div className="flex gap-3 rounded-xl border bg-white p-4">
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option>ALL</option>
          <option>ACTIVE</option>
          <option>OVERDUE</option>
          <option>RETURNED</option>
        </select>

        <button
          type="button"
          onClick={load}
          className="rounded-lg border px-4 py-2 text-sm font-semibold"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <State text="Loading rentals..." />
      ) : shown.length === 0 ? (
        <State text="No rentals found." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-4">Book</th>
                <th className="p-4">Member</th>
                <th className="p-4">Rented</th>
                <th className="p-4">Due</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {shown.map((item) => (
                <tr key={item.id}>
                  <td className="p-4 font-semibold">
                    {item.book?.title || item.bookId}
                  </td>

                  <td className="p-4">
                    {item.member?.name ||
                      item.memberId}
                  </td>

                  <td className="p-4">
                    {format(item.rentedAt)}
                  </td>

                  <td className="p-4">
                    {format(item.dueDate)}
                  </td>

                  <td className="p-4">
                    {item.status}
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

function format(value) {
  return value
    ? new Date(value).toLocaleDateString()
    : "-";
}

function State({ text }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-xl border bg-white text-sm text-slate-500">
      {text}
    </div>
  );
}