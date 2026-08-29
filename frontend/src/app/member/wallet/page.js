"use client";

import { useEffect, useState } from "react";

import {
  getMyWallet,
  getMyTransactions,
  payFine,
} from "@/services/wallet.service";

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ======================================================
  // LOAD WALLET
  // ======================================================

  const loadWallet = async () => {
    try {
      setLoading(true);
      setError("");

      const [walletResponse, transactionResponse] =
        await Promise.all([
          getMyWallet(),
          getMyTransactions(),
        ]);

      console.log("WALLET:", walletResponse);
      console.log("TRANSACTIONS:", transactionResponse);

      const walletData =
        walletResponse?.data?.wallet ||
        walletResponse?.wallet ||
        walletResponse?.data ||
        null;

      const transactionData =
        transactionResponse?.data?.transactions ||
        transactionResponse?.transactions ||
        transactionResponse?.data ||
        [];

      setWallet(walletData);

      setTransactions(
        Array.isArray(transactionData)
          ? transactionData
          : []
      );
    } catch (error) {
      console.error(
        "Wallet loading error:",
        error
      );

      setError(
        error?.message ||
          "Failed to load wallet"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  // ======================================================
  // PAY FINE
  // ======================================================

  const handlePayFine = async () => {
    const fine = Number(
      wallet?.fine || 0
    );

    if (fine <= 0) {
      return;
    }

    try {
      setPaying(true);
      setError("");
      setSuccess("");

      await payFine({
        amount: fine,
        description: "Fine payment",
      });

      setSuccess(
        "Fine paid successfully!"
      );

      await loadWallet();
    } catch (error) {
      console.error(
        "Pay fine error:",
        error
      );

      setError(
        error?.message ||
          "Failed to pay fine"
      );
    } finally {
      setPaying(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-900" />

          <p className="mt-4 text-sm text-gray-500">
            Loading wallet...
          </p>

        </div>
      </div>
    );
  }

  const balance = Number(
    wallet?.balance || 0
  );

  const fine = Number(
    wallet?.fine || 0
  );

  return (
    <div className="space-y-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          My Wallet
        </h1>

        <p className="mt-1 text-gray-500">
          Check your balance, fines and transactions.
        </p>
      </div>

      {/* ==================================================
          SUCCESS
      ================================================== */}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ==================================================
          WALLET CARDS
      ================================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* BALANCE */}

        <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Available Balance
              </p>

              <h2 className="mt-2 text-3xl font-bold text-green-600">
                ₹{balance.toFixed(2)}
              </h2>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-2xl">
              💰
            </div>

          </div>

        </div>

        {/* FINE */}

        <div className="rounded-2xl border border-yellow-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Pending Fine
              </p>

              <h2 className="mt-2 text-3xl font-bold text-yellow-600">
                ₹{fine.toFixed(2)}
              </h2>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-100 text-2xl">
              ⚠️
            </div>

          </div>

          {fine > 0 && (
            <button
              onClick={handlePayFine}
              disabled={paying}
              className="mt-5 rounded-lg bg-yellow-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-yellow-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {paying
                ? "Paying..."
                : "Pay Fine"}
            </button>
          )}

        </div>

      </div>

      {/* ==================================================
          TRANSACTIONS
      ================================================== */}

      <section>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Transaction History
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your wallet transactions.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {transactions.length === 0 ? (

            <div className="p-10 text-center">

              <div className="text-5xl">
                💳
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                No transactions
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                You don't have any wallet transactions yet.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="p-4 text-left text-sm font-semibold text-gray-600">
                      Description
                    </th>

                    <th className="p-4 text-left text-sm font-semibold text-gray-600">
                      Type
                    </th>

                    <th className="p-4 text-left text-sm font-semibold text-gray-600">
                      Amount
                    </th>

                    <th className="p-4 text-left text-sm font-semibold text-gray-600">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {transactions.map(
                    (transaction, index) => {

                      const transactionId =
                        transaction.id ||
                        transaction._id ||
                        index;

                      const amount = Number(
                        transaction.amount || 0
                      );

                      const type =
                        transaction.type ||
                        transaction.transactionType ||
                        "";

                      const isCredit =
                        type === "CREDIT" ||
                        type === "credit" ||
                        amount > 0;

                      return (
                        <tr
                          key={transactionId}
                          className="border-t"
                        >

                          <td className="p-4 text-sm text-gray-900">
                            {transaction.description ||
                              "Wallet transaction"}
                          </td>

                          <td className="p-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                isCredit
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {isCredit
                                ? "Credit"
                                : "Debit"}
                            </span>

                          </td>

                          <td
                            className={`p-4 text-sm font-semibold ${
                              isCredit
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {isCredit
                              ? "+"
                              : "-"}
                            ₹
                            {Math.abs(
                              amount
                            ).toFixed(2)}
                          </td>

                          <td className="p-4 text-sm text-gray-500">
                            {transaction.createdAt
                              ? new Date(
                                  transaction.createdAt
                                ).toLocaleString(
                                  "en-IN"
                                )
                              : "-"}
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

      </section>

    </div>
  );
}