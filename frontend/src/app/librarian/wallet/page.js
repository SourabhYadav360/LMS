"use client";

import { useEffect, useState } from "react";

import {
  getMyWallet,
  getMyTransactions,
} from "@/services/wallet.service";

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD WALLET
  // ======================================================

  const loadWallet = async () => {
    try {
      setLoading(true);
      setError("");

      const walletResponse = await getMyWallet();

      const transactionResponse =
        await getMyTransactions();

      console.log("WALLET RESPONSE:", walletResponse);
      console.log(
        "TRANSACTION RESPONSE:",
        transactionResponse
      );

      setWallet(
        walletResponse?.data?.wallet || null
      );

      setTransactions(
        transactionResponse?.data?.transactions || []
      );
    } catch (error) {
      console.error("LOAD WALLET ERROR:", error);

      setError(
        error?.message || "Failed to load wallet"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadWallet();
  }, []);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading wallet...
        </div>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="space-y-6 p-6">

      {/* HEADER */}

      <div>
        <p className="text-sm text-blue-600">
          Library Management
        </p>

        <h1 className="text-3xl font-bold text-gray-900">
          Wallet
        </h1>

        <p className="mt-1 text-gray-500">
          View your wallet and transaction history
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {error}
        </div>
      )}

      {/* WALLET SUMMARY */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* BALANCE */}

        <div className="rounded-2xl bg-slate-900 p-6 text-white shadow">

          <p className="text-sm text-gray-400">
            Current Balance
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            ₹
            {Number(wallet?.balance || 0).toFixed(2)}
          </h2>

          <p className="mt-3 text-sm text-gray-400">
            {wallet?.walletType || "LIBRARIAN"} Wallet
          </p>

        </div>

        {/* TRANSACTIONS COUNT */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <p className="text-sm text-gray-500">
            Transactions
          </p>

          <h2 className="mt-2 text-4xl font-bold text-gray-900">
            {transactions.length}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Total wallet transactions
          </p>

        </div>

      </div>

      {/* WALLET INFORMATION */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">

        <h2 className="mb-5 text-xl font-bold">
          Wallet Information
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* WALLET ID */}

          <div className="rounded-xl bg-gray-50 p-5">

            <p className="text-sm text-gray-500">
              Wallet ID
            </p>

            <p className="mt-2 font-semibold text-gray-900">
              #{wallet?.id || "-"}
            </p>

          </div>

          {/* WALLET TYPE */}

          <div className="rounded-xl bg-gray-50 p-5">

            <p className="text-sm text-gray-500">
              Wallet Type
            </p>

            <p className="mt-2 font-semibold text-gray-900">
              {wallet?.walletType || "-"}
            </p>

          </div>

          {/* OWNER ID */}

          <div className="rounded-xl bg-gray-50 p-5">

            <p className="text-sm text-gray-500">
              Owner ID
            </p>

            <p className="mt-2 font-semibold text-gray-900">
              #{wallet?.ownerId || "-"}
            </p>

          </div>

        </div>

      </div>

      {/* TRANSACTION HISTORY */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

        <div className="border-b p-6">

          <h2 className="text-xl font-bold">
            Transaction History
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            All wallet transactions
          </p>

        </div>

        {transactions.length === 0 ? (

          <div className="p-12 text-center">

            <p className="font-medium text-gray-700">
              No transactions found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Your wallet transaction history
              will appear here.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
                    ID
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
                    TYPE
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
                    AMOUNT
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
                    DESCRIPTION
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
                    BALANCE AFTER
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
                    DATE
                  </th>

                </tr>

              </thead>

              <tbody>

                {transactions.map((transaction) => (

                  <tr
                    key={transaction.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="px-6 py-4">
                      #{transaction.id}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={
                          transaction.type === "CREDIT"
                            ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                            : "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                        }
                      >
                        {transaction.type}
                      </span>

                    </td>

                    <td className="px-6 py-4 font-medium">
                      ₹
                      {Number(
                        transaction.amount || 0
                      ).toFixed(2)}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {transaction.description || "-"}
                    </td>

                    <td className="px-6 py-4 font-medium">
                      ₹
                      {Number(
                        transaction.balanceAfter || 0
                      ).toFixed(2)}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {transaction.createdAt
                        ? new Date(
                            transaction.createdAt
                          ).toLocaleString()
                        : "-"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}