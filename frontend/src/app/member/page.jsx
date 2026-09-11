"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getMemberDashboard } from "@/services/member.service";
import { useAuth } from "@/context/AuthContext";

export default function MemberDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const response = await getMemberDashboard();

      setDashboard(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between border-b border-slate-200 pb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Overview
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Member Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Welcome back
            {user?.name ? `, ${user.name}` : ""}.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-xl border bg-white"
              />
            )
          )}
        </div>
      ) : (
        dashboard && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card
                title="Wallet balance"
                value={`₹${dashboard.wallet.balance}`}
              />

              <Card
                title="Pending fine"
                value={`₹${dashboard.wallet.pendingFine}`}
              />

              <Card
                title="Active rentals"
                value={dashboard.rentals.active}
              />

              <Card
                title="Pending reservations"
                value={dashboard.reservations.pending}
              />

              <Card
                title="Total rentals"
                value={dashboard.rentals.total}
              />

              <Card
                title="Approved reservations"
                value={dashboard.reservations.approved}
              />
            </div>

            <div className="rounded-xl border bg-white p-6">
              <h2 className="text-lg font-bold">
                Account
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {dashboard.member.email} ·{" "}
                {dashboard.member.status}
              </p>
            </div>
          </>
        )
      )}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}