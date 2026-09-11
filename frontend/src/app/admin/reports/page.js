"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import {
  getBookReport,
  getFineReport,
  getMemberReport,
  getRentalReport,
  getReservationReport,
  getRevenueReport,
} from "@/services/report.service";

const reports = {
  books: ["Books", getBookReport],
  rentals: ["Rentals", getRentalReport],
  reservations: ["Reservations", getReservationReport],
  fines: ["Fines", getFineReport],
  revenue: ["Revenue", getRevenueReport],
  members: ["Members", getMemberReport],
};

export default function ReportsPage() {
  const [active, setActive] = useState("books");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);

      const fn = reports[active][1];

      const result = ["rentals", "reservations", "revenue"].includes(
        active
      )
        ? await fn({
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
          })
        : await fn();

      setData(result.data);
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          "Unable to load report."
      );
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (data === null) {
      toast.error(
        "Generate a report before downloading."
      );

      return;
    }

    const report = {
      report: reports[active][0],
      fromDate: fromDate || null,
      toDate: toDate || null,
      generatedAt: new Date().toISOString(),
      data,
    };

    const blob = new Blob(
      [JSON.stringify(report, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;

    link.download = `${active}-report${
      fromDate ? `-${fromDate}` : ""
    }${toDate ? `-to-${toDate}` : ""}.json`;

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          Analytics
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Reports
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Generate reports from live library data.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border bg-white p-3">
        {Object.entries(reports).map(
          ([key, [label]]) => (
            <button
              type="button"
              key={key}
              onClick={() => {
                setActive(key);
                setData(null);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                active === key
                  ? "bg-blue-700 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-end">
        <label className="text-sm font-semibold text-slate-700">
          From

          <input
            type="date"
            value={fromDate}
            onChange={(e) =>
              setFromDate(e.target.value)
            }
            className="mt-1 block rounded-lg border px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm font-semibold text-slate-700">
          To

          <input
            type="date"
            value={toDate}
            onChange={(e) =>
              setToDate(e.target.value)
            }
            className="mt-1 block rounded-lg border px-3 py-2 text-sm"
          />
        </label>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Generating..."
            : `Generate ${reports[active][0]} report`}
        </button>

        {data !== null && (
          <button
            type="button"
            onClick={download}
            className="rounded-lg border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            Download report
          </button>
        )}
      </div>

      {data !== null && (
        <div className="overflow-auto rounded-xl border bg-slate-950 p-5">
          <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-100">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}