"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  getMyTransactions,
  getMyWallet,
} from "@/services/wallet.service";

export default function MemberWalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
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

    return () => window.clearTimeout(timer);
  }, []);

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
          My Wallet
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-900 p-6 text-white">
          <p className="text-sm text-slate-400">
            Available balance
          </p>

          <p className="mt-3 text-4xl font-bold">
            ₹{wallet?.balance ?? 0}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <p className="text-sm text-slate-500">
            Pending fine
          </p>

          <p className="mt-3 text-4xl font-bold text-slate-900">
            ₹{wallet?.fine ?? 0}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <h2 className="border-b p-5 text-lg font-semibold">
          Transaction history
        </h2>

        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Type</th>
              <th className="p-4">Amount</th>
              <th className="p-4">
                Balance after
              </th>
              <th className="p-4">
                Description
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {transactions.map((item) => (
              <tr key={item.id}>
                <td className="p-4">
                  {item.createdAt
                    ? new Date(
                        item.createdAt
                      ).toLocaleString()
                    : "-"}
                </td>

                <td className="p-4">
                  {item.type}
                </td>

                <td className="p-4">
                  ₹{item.amount}
                </td>

                <td className="p-4">
                  ₹{item.balanceAfter}
                </td>

                <td className="p-4">
                  {item.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {transactions.length === 0 && (
          <p className="p-6 text-sm text-slate-500">
            No transactions yet.
          </p>
        )}
      </div>
    </div>
  );
}