"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getMyTransactions,
  getMyWallet,
  getSuperAdminRevenue,
} from "@/services/wallet.service";

export default function WalletsPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [dates, setDates] = useState({
    fromDate: "",
    toDate: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [
          walletResponse,
          transactionResponse,
        ] = await Promise.all([
          getMyWallet(),
          getMyTransactions(),
        ]);

        setWallet(walletResponse.data);

        setTransactions(
          Array.isArray(transactionResponse.data)
            ? transactionResponse.data
            : []
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Unable to load wallet."
        );
      } finally {
        setLoading(false);
      }
    };

    const timer = window.setTimeout(load, 0);

    return () =>
      window.clearTimeout(timer);
  }, []);

  const loadRevenue = async () => {
    try {
      const response =
        await getSuperAdminRevenue(dates);

      setRevenue(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to load revenue."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
        Loading wallet...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          Finance
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Wallet
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          View your wallet balance and rental earnings.
        </p>
      </div>

      <div className="rounded-xl bg-slate-900 p-6 text-white">
        <p className="text-sm text-slate-400">
          Current balance
        </p>

        <p className="mt-3 text-4xl font-bold">
          ₹{wallet?.balance ?? 0}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <h2 className="border-b p-5 text-lg font-semibold">
          Transaction history
        </h2>

        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Type</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Description</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {transactions.map(
              (transaction) => (
                <tr key={transaction.id}>
                  <td className="p-4">
                    {transaction.createdAt
                      ? new Date(
                          transaction.createdAt
                        ).toLocaleString()
                      : "-"}
                  </td>

                  <td className="p-4">
                    {transaction.type}
                  </td>

                  <td className="p-4">
                    ₹{transaction.amount}
                  </td>

                  <td className="p-4">
                    {transaction.description}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {transactions.length === 0 && (
          <p className="p-5 text-sm text-slate-500">
            No transactions yet.
          </p>
        )}
      </div>

      <div className="space-y-4 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">
          Revenue summary
        </h2>

        <div className="flex flex-wrap gap-3">
          <input
            type="date"
            value={dates.fromDate}
            onChange={(event) =>
              setDates({
                ...dates,
                fromDate: event.target.value,
              })
            }
            className="rounded-lg border px-3 py-2 text-sm"
          />

          <input
            type="date"
            value={dates.toDate}
            onChange={(event) =>
              setDates({
                ...dates,
                toDate: event.target.value,
              })
            }
            className="rounded-lg border px-3 py-2 text-sm"
          />

          <button
            type="button"
            onClick={loadRevenue}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Load revenue
          </button>
        </div>

        {revenue && (
          <p className="text-sm text-slate-600">
            Total revenue:{" "}
            <strong>
              ₹{revenue.totalRevenue}
            </strong>{" "}
            · {revenue.transactionCount} transactions
          </p>
        )}
      </div>
    </div>
  );
}