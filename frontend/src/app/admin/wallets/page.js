"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getWallet,
  getTransactions,
  getSuperAdminRevenue,
} from "@/services/wallet.service";

const SUPER_ADMIN_ID = 1;

const FILTERS = [
  {
    label: "Today",
    value: "TODAY",
    days: 1,
  },
  {
    label: "7 Days",
    value: "7_DAYS",
    days: 7,
  },
  {
    label: "1 Month",
    value: "1_MONTH",
    days: 30,
  },
  {
    label: "2 Months",
    value: "2_MONTHS",
    days: 60,
  },
  {
    label: "3 Months",
    value: "3_MONTHS",
    days: 90,
  },
  {
    label: "All Time",
    value: "ALL",
    days: null,
  },
];

export default function AdminWalletPage() {
  // ======================================================
  // STATE
  // ======================================================

  const [wallet, setWallet] = useState(null);

  const [transactions, setTransactions] = useState([]);

  const [filter, setFilter] = useState("TODAY");

  const [loading, setLoading] = useState(true);

  const [transactionLoading, setTransactionLoading] =
    useState(false);

  const [error, setError] = useState("");

  // ======================================================
  // LOAD DATA
  // ======================================================

  useEffect(() => {
    loadWalletData();
  }, []);

  // ======================================================
  // LOAD WALLET
  // ======================================================

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getWallet(
        "SUPER_ADMIN",
        SUPER_ADMIN_ID
      );

      const walletData =
        response?.data?.wallet ||
        response?.data ||
        null;

      setWallet(walletData);

      await loadTransactions();
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

  // ======================================================
  // LOAD TRANSACTIONS
  // ======================================================

  const loadTransactions = async () => {
    try {
      setTransactionLoading(true);

      const response =
        await getTransactions(
          "SUPER_ADMIN",
          SUPER_ADMIN_ID
        );

      const transactionData =
        response?.data?.transactions ||
        response?.data ||
        [];

      setTransactions(
        Array.isArray(transactionData)
          ? transactionData
          : []
      );
    } catch (error) {
      console.error(
        "Transaction loading error:",
        error
      );

      setError(
        error?.message ||
          "Failed to load transactions"
      );
    } finally {
      setTransactionLoading(false);
    }
  };

  // ======================================================
  // REFRESH
  // ======================================================

  const handleRefresh = async () => {
    await loadWalletData();
  };

  // ======================================================
  // DATE RANGE
  // ======================================================

  const getDateRange = () => {
    const selectedFilter =
      FILTERS.find(
        (item) => item.value === filter
      );

    if (!selectedFilter) {
      return {
        fromDate: null,
        toDate: null,
      };
    }

    if (selectedFilter.days === null) {
      return {
        fromDate: null,
        toDate: null,
      };
    }

    const now = new Date();

    const fromDate = new Date();

    fromDate.setDate(
      now.getDate() -
        (selectedFilter.days - 1)
    );

    fromDate.setHours(
      0,
      0,
      0,
      0
    );

    const toDate = new Date();

    toDate.setHours(
      23,
      59,
      59,
      999
    );

    return {
      fromDate,
      toDate,
    };
  };

  // ======================================================
  // FILTER TRANSACTIONS
  // ======================================================

  const filteredTransactions = useMemo(() => {
    const selectedFilter =
      FILTERS.find(
        (item) => item.value === filter
      );

    if (!selectedFilter) {
      return transactions;
    }

    if (selectedFilter.days === null) {
      return transactions;
    }

    const now = new Date();

    const startDate = new Date();

    startDate.setDate(
      now.getDate() -
        (selectedFilter.days - 1)
    );

    startDate.setHours(
      0,
      0,
      0,
      0
    );

    const endDate = new Date();

    endDate.setHours(
      23,
      59,
      59,
      999
    );

    return transactions.filter(
      (transaction) => {
        if (!transaction?.createdAt) {
          return false;
        }

        const transactionDate =
          new Date(
            transaction.createdAt
          );

        return (
          transactionDate >=
            startDate &&
          transactionDate <= endDate
        );
      }
    );
  }, [transactions, filter]);

  // ======================================================
  // REVENUE
  // ======================================================

  const totalRevenue = useMemo(() => {
    return filteredTransactions
      .filter(
        (transaction) =>
          transaction?.type ===
          "CREDIT"
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(
            transaction?.amount || 0
          ),
        0
      );
  }, [filteredTransactions]);

  // ======================================================
  // TOTAL DEBIT
  // ======================================================

  const totalDebit = useMemo(() => {
    return filteredTransactions
      .filter(
        (transaction) =>
          transaction?.type ===
          "DEBIT"
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(
            transaction?.amount || 0
          ),
        0
      );
  }, [filteredTransactions]);

  // ======================================================
  // TRANSACTION COUNT
  // ======================================================

  const transactionCount =
    filteredTransactions.length;

  // ======================================================
  // LIBRARIAN REVENUE
  // ======================================================
  //
  // IMPORTANT:
  // Ye tab correctly librarian-wise
  // kaam karega jab librarian transactions
  // me referenceId / required librarian
  // information available ho.
  //
  // Current WalletTransaction structure ke
  // according walletType = LIBRARIAN hone par
  // walletId librarian wallet ka ID hota hai.
  //
  // Is page par hum available transaction data
  // ke according grouping kar rahe hain.
  //
  // ======================================================

  const librarianRevenue = useMemo(() => {
    const map = {};

    filteredTransactions.forEach(
      (transaction) => {
        if (
          transaction?.walletType !==
          "LIBRARIAN"
        ) {
          return;
        }

        const librarianId =
          transaction?.librarianId ||
          transaction?.referenceId ||
          transaction?.walletId;

        if (!librarianId) {
          return;
        }

        if (!map[librarianId]) {
          map[librarianId] = {
            librarianId,
            totalEarned: 0,
            transactionCount: 0,
          };
        }

        if (
          transaction.type ===
          "CREDIT"
        ) {
          map[
            librarianId
          ].totalEarned += Number(
            transaction.amount || 0
          );
        }

        map[
          librarianId
        ].transactionCount += 1;
      }
    );

    return Object.values(map).sort(
      (a, b) =>
        b.totalEarned -
        a.totalEarned
    );
  }, [filteredTransactions]);

  // ======================================================
  // FORMAT MONEY
  // ======================================================

  const formatMoney = (amount) => {
    return Number(
      amount || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ======================================================
  // SELECTED FILTER LABEL
  // ======================================================

  const selectedFilterLabel =
    FILTERS.find(
      (item) =>
        item.value === filter
    )?.label || "Today";

  // ======================================================
  // CURRENT BALANCE
  // ======================================================

  const currentBalance = Number(
    wallet?.balance || 0
  );

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2">

            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              SUPER ADMIN
            </span>

          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Wallet & Revenue
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor wallet balance,
            revenue and librarian earnings.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={
            loading ||
            transactionLoading
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            className={`h-4 w-4 ${
              loading
                ? "animate-spin"
                : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 11a8 8 0 0 0-15.5-2M4 5v4h4" />
            <path d="M4 13a8 8 0 0 0 15.5-2M20 19v-4h-4" />
          </svg>

          Refresh
        </button>

      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

          <p className="text-sm font-medium text-red-700">
            {error}
          </p>

        </div>
      )}

      {/* ==================================================
          WALLET CARD
      ================================================== */}

      <div className="mb-6 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

        <div className="grid lg:grid-cols-2">

          {/* LEFT */}

          <div className="p-6 sm:p-8">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Super Admin Wallet
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Current available balance
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 7h18v13H3z" />
                  <path d="M16 11h5v5h-5a2.5 2.5 0 0 1 0-5z" />
                  <path d="M3 7V5h15v2" />
                </svg>

              </div>

            </div>

            {loading ? (
              <div className="h-12 w-64 animate-pulse rounded-lg bg-slate-100" />
            ) : (
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                ₹{formatMoney(currentBalance)}
              </h2>
            )}

            <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              Wallet is active

            </div>

          </div>

          {/* RIGHT */}

          <div className="border-t border-slate-100 bg-slate-50/70 p-6 sm:p-8 lg:border-l lg:border-t-0">

            <div className="mb-4">

              <p className="text-sm font-medium text-slate-500">
                Revenue Period
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Select period to view revenue
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              {FILTERS.map(
                (item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setFilter(
                        item.value
                      )
                    }
                    className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                      filter ===
                      item.value
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                )
              )}

            </div>

          </div>

        </div>

      </div>

      {/* ==================================================
          STAT CARDS
      ================================================== */}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* REVENUE */}

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

          <p className="text-sm font-medium text-slate-500">
            Total Revenue
          </p>

          <p className="mt-3 text-2xl font-bold text-emerald-600">
            ₹{formatMoney(totalRevenue)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {selectedFilterLabel} revenue
          </p>

        </div>

        {/* BALANCE */}

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

          <p className="text-sm font-medium text-slate-500">
            Current Balance
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            ₹{formatMoney(currentBalance)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Available admin balance
          </p>

        </div>

        {/* DEBIT */}

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

          <p className="text-sm font-medium text-slate-500">
            Total Debit
          </p>

          <p className="mt-3 text-2xl font-bold text-red-600">
            ₹{formatMoney(totalDebit)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {selectedFilterLabel} outgoing
          </p>

        </div>

        {/* TRANSACTIONS */}

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

          <p className="text-sm font-medium text-slate-500">
            Transactions
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {transactionCount}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {selectedFilterLabel}
          </p>

        </div>

      </div>

      {/* ==================================================
          LIBRARIAN REVENUE
      ================================================== */}

      <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

        <div className="border-b border-slate-100 p-5 sm:p-6">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Librarian Revenue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Librarian-wise earning for{" "}
                {selectedFilterLabel.toLowerCase()}.
              </p>

            </div>

            <span className="w-fit rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
              {selectedFilterLabel}
            </span>

          </div>

        </div>

        {librarianRevenue.length === 0 ? (

          <div className="p-10 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">

              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle
                  cx="9"
                  cy="7"
                  r="4"
                />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>

            </div>

            <h3 className="font-semibold text-slate-800">
              No librarian revenue
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No librarian transactions found
              for this period.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50/70">

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Librarian
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Total Earned
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Transactions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {librarianRevenue.map(
                  (librarian) => (
                    <tr
                      key={
                        librarian.librarianId
                      }
                      className="hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                            L
                          </div>

                          <div>

                            <p className="font-semibold text-slate-800">
                              Librarian #
                              {
                                librarian.librarianId
                              }
                            </p>

                            <p className="text-xs text-slate-400">
                              ID:{" "}
                              {
                                librarian.librarianId
                              }
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-6 py-4 font-bold text-emerald-600">
                        ₹
                        {formatMoney(
                          librarian.totalEarned
                        )}
                      </td>

                      <td className="px-6 py-4">

                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                          {
                            librarian.transactionCount
                          }
                        </span>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ==================================================
          SUPER ADMIN TRANSACTIONS
      ================================================== */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              Super Admin Transaction History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Wallet activity for{" "}
              {selectedFilterLabel.toLowerCase()}.
            </p>

          </div>

          <span className="w-fit rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
            {filteredTransactions.length} transactions
          </span>

        </div>

        {transactionLoading ? (

          <div className="p-10 text-center text-sm text-slate-500">
            Loading transactions...
          </div>

        ) : filteredTransactions.length ===
          0 ? (

          <div className="p-12 text-center">

            <h3 className="font-semibold text-slate-800">
              No transactions found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              There are no transactions for
              this period.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50/70">

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Type
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Balance Before
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Balance After
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Description
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredTransactions.map(
                  (transaction) => {

                    const isCredit =
                      transaction?.type ===
                      "CREDIT";

                    return (
                      <tr
                        key={
                          transaction.id
                        }
                        className="hover:bg-slate-50"
                      >

                        {/* TYPE */}

                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                              isCredit
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >

                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isCredit
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                            />

                            {transaction.type}

                          </span>

                        </td>

                        {/* AMOUNT */}

                        <td
                          className={`px-6 py-4 font-bold ${
                            isCredit
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {isCredit
                            ? "+"
                            : "-"}
                          ₹
                          {formatMoney(
                            transaction.amount
                          )}
                        </td>

                        {/* BEFORE */}

                        <td className="px-6 py-4 text-sm text-slate-600">
                          ₹
                          {formatMoney(
                            transaction.balanceBefore
                          )}
                        </td>

                        {/* AFTER */}

                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                          ₹
                          {formatMoney(
                            transaction.balanceAfter
                          )}
                        </td>

                        {/* DESCRIPTION */}

                        <td className="max-w-[280px] px-6 py-4 text-sm text-slate-600">
                          {transaction.description ||
                            "—"}
                        </td>

                        {/* DATE */}

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDate(
                            transaction.createdAt
                          )}
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

      {/* ==================================================
          INFO
      ================================================== */}

      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">

        <div className="flex gap-3">

          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
            />

            <path d="M12 11v5" />

            <path d="M12 8h.01" />
          </svg>

          <div>

            <p className="text-sm font-semibold text-blue-800">
              Wallet Settlement
            </p>

            <p className="mt-1 text-sm text-blue-700">
              Librarian earnings will be
              transferred to the Super Admin
              wallet during the settlement
              process.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}