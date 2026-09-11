"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { useAuth } from "@/context/AuthContext";
import {
  deleteMember,
  getMembers,
} from "@/services/member.service";
import { fundMemberWallet } from "@/services/wallet.service";
import { hasPermission } from "@/utils/permissions";

export default function MembersPage() {
  const appRouter = useRouter();
  const pathname = usePathname();

  const isLibrarianMembersPage =
    pathname.startsWith("/librarian/");

  const membersPath = isLibrarianMembersPage
    ? "/librarian/members"
    : "/admin/members";

  const router = {
    ...appRouter,
    push: (path) =>
      appRouter.push(
        path.replace(
          "/admin/members",
          membersPath
        )
      ),
  };

  const { user } = useAuth();

  const canManageWallet =
    isLibrarianMembersPage &&
    (user?.permissions?.walletManage ||
      user?.walletManage);

  const runWithPermission = (permission, action) => {
    if (!hasPermission(user, permission)) {
      toast.error(
        "You do not have permission for this action"
      );
      return;
    }

    action();
  };

  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [walletMember, setWalletMember] = useState(null);
  const [walletForm, setWalletForm] = useState({
    amount: "",
    description: "",
  });
  const [funding, setFunding] = useState(false);
  const [error, setError] = useState("");

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMembers();

      setMembers(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load members."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(
      loadMembers,
      0
    );

    return () =>
      window.clearTimeout(timer);
  }, []);

  const filteredMembers = useMemo(() => {
    const value = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !value ||
        `${member.name} ${member.email}`
          .toLowerCase()
          .includes(value);

      return (
        matchesSearch &&
        (status === "ALL" ||
          member.status === status)
      );
    });
  }, [members, search, status]);

  const handleDelete = async (member) => {
    if (
      !window.confirm(
        `Delete member "${member.name}"?`
      )
    ) {
      return;
    }

    try {
      setDeletingId(member.id);

      const response = await deleteMember(
        member.id
      );

      setMembers((current) =>
        current.filter(
          (item) => item.id !== member.id
        )
      );

      toast.success(
        response.message ||
          "Member deleted successfully."
      );
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Unable to delete member."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const openWallet = (member) => {
    setWalletMember(member);

    setWalletForm({
      amount: "",
      description: "",
    });
  };

  const handleFundWallet = async (event) => {
    event.preventDefault();

    try {
      setFunding(true);

      const response = await fundMemberWallet({
        memberId: walletMember.id,
        amount: Number(walletForm.amount),
        description:
          walletForm.description.trim() ||
          undefined,
      });

      const balanceAfter =
        response.data?.memberWallet?.balanceAfter;

      setMembers((current) =>
        current.map((member) =>
          member.id === walletMember.id
            ? {
                ...member,
                wallet: {
                  ...member.wallet,
                  balance:
                    balanceAfter ??
                    member.wallet?.balance,
                },
              }
            : member
        )
      );

      toast.success(
        response.message ||
          "Member wallet funded successfully."
      );

      setWalletMember(null);

      await loadMembers();
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message ||
          "Unable to fund member wallet."
      );
    } finally {
      setFunding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            People
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Members
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {isLibrarianMembersPage
              ? "Manage members and fund their wallets."
              : "Manage members."}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            runWithPermission(
              "memberCreate",
              () =>
                router.push(
                  "/admin/members/create"
                )
            )
          }
          className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Add member
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row">
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search by name or email..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
        />

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
        >
          <option value="ALL">
            All statuses
          </option>
          <option value="ACTIVE">
            Active
          </option>
          <option value="INACTIVE">
            Inactive
          </option>
        </select>

        <button
          type="button"
          onClick={loadMembers}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}

          <button
            type="button"
            onClick={loadMembers}
            className="ml-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {!error && loading && (
        <State text="Loading members..." />
      )}

      {!error &&
        !loading &&
        filteredMembers.length === 0 && (
          <State
            text={
              search || status !== "ALL"
                ? "No matching members."
                : "No members yet."
            }
          />
        )}

      {!error &&
        !loading &&
        filteredMembers.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3">
                      Member
                    </th>

                    <th className="px-5 py-3">
                      Status
                    </th>

                    {isLibrarianMembersPage && (
                      <th className="px-5 py-3">
                        Wallet
                      </th>
                    )}

                    <th className="px-5 py-3">
                      Rentals
                    </th>

                    <th className="px-5 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredMembers.map(
                    (member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {member.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {member.email}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          {member.status}
                        </td>

                        {isLibrarianMembersPage && (
                          <td className="px-5 py-4">
                            ₹
                            {member.wallet?.balance ??
                              0}
                          </td>
                        )}

                        <td className="px-5 py-4">
                          {member.rentals?.length ??
                            0}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                runWithPermission(
                                  "memberView",
                                  () =>
                                    router.push(
                                      `/admin/members/${member.id}`
                                    )
                                )
                              }
                              className="font-semibold text-slate-700"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                runWithPermission(
                                  "memberUpdate",
                                  () =>
                                    router.push(
                                      `/admin/members/${member.id}?edit=true`
                                    )
                                )
                              }
                              className="font-semibold text-blue-700"
                            >
                              Edit
                            </button>

                            {canManageWallet && (
                              <button
                                type="button"
                                onClick={() =>
                                  openWallet(member)
                                }
                                className="font-semibold text-emerald-700"
                              >
                                Wallet
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                member.id
                              }
                              onClick={() =>
                                runWithPermission(
                                  "memberDelete",
                                  () =>
                                    handleDelete(
                                      member
                                    )
                                )
                              }
                              className="font-semibold text-red-600 disabled:opacity-50"
                            >
                              {deletingId ===
                              member.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {walletMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={handleFundWallet}
            className="w-full max-w-md space-y-5 rounded-xl bg-white p-6 shadow-2xl"
          >
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Fund member wallet
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {walletMember.name} · current
                balance ₹
                {walletMember.wallet?.balance ??
                  0}
              </p>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Amount
              </span>

              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={walletForm.amount}
                onChange={(event) =>
                  setWalletForm({
                    ...walletForm,
                    amount: event.target.value,
                  })
                }
                className="w-full rounded-lg border px-3 py-2.5 text-sm"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </span>

              <input
                value={walletForm.description}
                onChange={(event) =>
                  setWalletForm({
                    ...walletForm,
                    description:
                      event.target.value,
                  })
                }
                placeholder="Optional"
                className="w-full rounded-lg border px-3 py-2.5 text-sm"
              />
            </label>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setWalletMember(null)
                }
                disabled={funding}
                className="rounded-lg border px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={funding}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {funding
                  ? "Adding..."
                  : "Add money"}
              </button>
            </div>
          </form>
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