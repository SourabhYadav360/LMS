"use client";

import { useEffect, useState } from "react";

import {
  getWallet,
  fundMemberWallet,
} from "@/services/wallet.service";

import api from "@/lib/api";

export default function MembersPage() {
  // ======================================================
  // STATES
  // ======================================================

  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ======================================================
  // VIEW MODAL
  // ======================================================

  const [viewModal, setViewModal] = useState(false);

  const [viewLoading, setViewLoading] = useState(false);

  // ======================================================
  // EDIT MODAL
  // ======================================================

  const [editModal, setEditModal] = useState(false);

  const [editLoading, setEditLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    status: "ACTIVE",
  });

  // ======================================================
  // SELECTED MEMBER
  // ======================================================

  const [selectedMember, setSelectedMember] =
    useState(null);

  // ======================================================
  // DELETE
  // ======================================================

  const [deletingId, setDeletingId] =
    useState(null);

  // ======================================================
  // WALLET
  // ======================================================

  const [walletModal, setWalletModal] =
    useState(false);

  const [wallet, setWallet] =
    useState(null);

  const [walletLoading, setWalletLoading] =
    useState(false);

  const [amount, setAmount] =
    useState("");

  const [funding, setFunding] =
    useState(false);

  // ======================================================
  // CLEAR MESSAGES
  // ======================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // ======================================================
  // LOAD MEMBERS
  // ======================================================

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api("/members", {
        method: "GET",
      });

      console.log(
        "MEMBERS RESPONSE:",
        response
      );

      const memberList =
        response?.data?.members ||
        response?.data ||
        response?.members ||
        [];

      setMembers(
        Array.isArray(memberList)
          ? memberList
          : []
      );
    } catch (error) {
      console.error(
        "LOAD MEMBERS ERROR:",
        error
      );

      setMembers([]);

      setError(
        error?.message ||
          "Failed to load members"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadMembers();
  }, []);

  // ======================================================
  // GET RENTAL COUNT
  // ======================================================

  const getRentalCount = (member) => {
    if (
      typeof member?.rentalCount ===
      "number"
    ) {
      return member.rentalCount;
    }

    if (
      Array.isArray(member?.rentals)
    ) {
      return member.rentals.length;
    }

    if (
      member?.rentals &&
      typeof member.rentals ===
        "object"
    ) {
      return 1;
    }

    return 0;
  };

  // ======================================================
  // GET RESERVATION COUNT
  // ======================================================

  const getReservationCount = (
    member
  ) => {
    if (
      typeof member?.reservationCount ===
      "number"
    ) {
      return member.reservationCount;
    }

    if (
      Array.isArray(
        member?.reservations
      )
    ) {
      return member.reservations.length;
    }

    if (
      member?.reservations &&
      typeof member.reservations ===
        "object"
    ) {
      return 1;
    }

    return 0;
  };

  // ======================================================
  // GET WALLET BALANCE
  // ======================================================

  const getMemberBalance = (
    member
  ) => {
    const balance =
      member?.walletBalance ??
      member?.wallet?.balance ??
      member?.balance ??
      0;

    const numberBalance =
      Number(balance);

    return Number.isFinite(
      numberBalance
    )
      ? numberBalance
      : 0;
  };

  // ======================================================
  // VIEW MEMBER
  // ======================================================

  const handleViewMember = async (
    member
  ) => {
    if (!member?.id) {
      setError(
        "Member ID is required"
      );

      return;
    }

    try {
      clearMessages();

      setSelectedMember(member);

      setViewModal(true);

      setViewLoading(true);

      // ------------------------------------------
      // GET SINGLE MEMBER
      // ------------------------------------------

      const response = await api(
        `/members/${member.id}`,
        {
          method: "GET",
        }
      );

      console.log(
        "VIEW MEMBER RESPONSE:",
        response
      );

      const memberData =
        response?.data?.member ||
        response?.member ||
        response?.data ||
        member;

      setSelectedMember(
        memberData
      );
    } catch (error) {
      console.error(
        "VIEW MEMBER ERROR:",
        error
      );

      // Agar single API nahi hai,
      // table wala member hi show karenge.
      setSelectedMember(member);

      setError(
        error?.message ||
          "Failed to load member details"
      );
    } finally {
      setViewLoading(false);
    }
  };

  // ======================================================
  // CLOSE VIEW MODAL
  // ======================================================

  const handleCloseView = () => {
    setViewModal(false);

    setSelectedMember(null);
  };

  // ======================================================
  // OPEN EDIT MODAL
  // ======================================================

  const handleEditMember = (
    member
  ) => {
    if (!member?.id) {
      setError(
        "Member ID is required"
      );

      return;
    }

    clearMessages();

    setSelectedMember(member);

    setEditForm({
      name: member?.name || "",
      email: member?.email || "",
      status:
        String(
          member?.status ||
            "ACTIVE"
        ).toUpperCase(),
    });

    setEditModal(true);
  };

  // ======================================================
  // CLOSE EDIT MODAL
  // ======================================================

  const handleCloseEdit = () => {
    if (editLoading) {
      return;
    }

    setEditModal(false);

    setSelectedMember(null);

    setEditForm({
      name: "",
      email: "",
      status: "ACTIVE",
    });
  };

  // ======================================================
  // UPDATE MEMBER
  // ======================================================

  const handleUpdateMember =
    async () => {
      clearMessages();

      // ------------------------------------------
      // MEMBER CHECK
      // ------------------------------------------

      if (!selectedMember?.id) {
        setError(
          "Member ID is required"
        );

        return;
      }

      // ------------------------------------------
      // NAME CHECK
      // ------------------------------------------

      const name =
        editForm.name.trim();

      if (!name) {
        setError(
          "Name is required"
        );

        return;
      }

      // ------------------------------------------
      // EMAIL CHECK
      // ------------------------------------------

      const email =
        editForm.email.trim();

      if (!email) {
        setError(
          "Email is required"
        );

        return;
      }

      try {
        setEditLoading(true);

        console.log(
          "UPDATE MEMBER:",
          {
            id: selectedMember.id,
            name,
            email,
            status:
              editForm.status,
          }
        );

        // ------------------------------------------
        // UPDATE API
        // ------------------------------------------

        const response =
          await api(
            `/members/${selectedMember.id}`,
            {
              method: "PUT",

              body: JSON.stringify({
                name,
                email,
                status:
                  editForm.status,
              }),
            }
          );

        console.log(
          "UPDATE MEMBER RESPONSE:",
          response
        );

        // ------------------------------------------
        // SUCCESS
        // ------------------------------------------

        setSuccess(
          "Member updated successfully"
        );

        // ------------------------------------------
        // CLOSE MODAL
        // ------------------------------------------

        setEditModal(false);

        setSelectedMember(null);

        // ------------------------------------------
        // REFRESH LIST
        // ------------------------------------------

        await loadMembers();

      } catch (error) {
        console.error(
          "UPDATE MEMBER ERROR:",
          error
        );

        setError(
          error?.message ||
            "Failed to update member"
        );
      } finally {
        setEditLoading(false);
      }
    };

  // ======================================================
  // DELETE MEMBER
  // ======================================================

  const handleDeleteMember =
    async (member) => {
      if (!member?.id) {
        setError(
          "Member ID is required"
        );

        return;
      }

      // ------------------------------------------
      // CONFIRMATION
      // ------------------------------------------

      const confirmed =
        window.confirm(
          `Are you sure you want to delete ${member.name || "this member"}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        clearMessages();

        setDeletingId(
          member.id
        );

        console.log(
          "DELETE MEMBER:",
          member.id
        );

        // ------------------------------------------
        // DELETE API
        // ------------------------------------------

        const response =
          await api(
            `/members/${member.id}`,
            {
              method: "DELETE",
            }
          );

        console.log(
          "DELETE MEMBER RESPONSE:",
          response
        );

        // ------------------------------------------
        // SUCCESS
        // ------------------------------------------

        setSuccess(
          `${member.name || "Member"} deleted successfully`
        );

        // ------------------------------------------
        // REFRESH
        // ------------------------------------------

        await loadMembers();

      } catch (error) {
        console.error(
          "DELETE MEMBER ERROR:",
          error
        );

        setError(
          error?.message ||
            "Failed to delete member"
        );
      } finally {
        setDeletingId(null);
      }
    };

  // ======================================================
  // OPEN WALLET
  // ======================================================

  const handleOpenWallet =
    async (member) => {
      if (!member?.id) {
        setError(
          "Member ID is required"
        );

        return;
      }

      try {
        clearMessages();

        setSelectedMember(member);

        setWallet(null);

        setAmount("");

        setWalletModal(true);

        setWalletLoading(true);

        console.log(
          "GET MEMBER WALLET:",
          member.id
        );

        const response =
          await getWallet(
            "MEMBER",
            member.id
          );

        console.log(
          "MEMBER WALLET RESPONSE:",
          response
        );

        const walletData =
          response?.data?.wallet ||
          response?.wallet ||
          response?.data ||
          null;

        setWallet(
          walletData || {
            balance: 0,
            fine: 0,
          }
        );

      } catch (error) {
        console.error(
          "GET MEMBER WALLET ERROR:",
          error
        );

        setWallet({
          balance: 0,
          fine: 0,
        });

        setError(
          error?.message ||
            "Failed to load member wallet"
        );
      } finally {
        setWalletLoading(false);
      }
    };

  // ======================================================
  // CLOSE WALLET
  // ======================================================

  const handleCloseWallet =
    () => {
      if (funding) {
        return;
      }

      setWalletModal(false);

      setSelectedMember(null);

      setWallet(null);

      setAmount("");
    };

  // ======================================================
  // ADD MONEY
  // ======================================================

  const handleAddMoney =
    async () => {
      clearMessages();

      // ------------------------------------------
      // MEMBER CHECK
      // ------------------------------------------

      if (!selectedMember?.id) {
        setError(
          "Member ID is required"
        );

        return;
      }

      // ------------------------------------------
      // AMOUNT
      // ------------------------------------------

      const fundAmount =
        Number(amount);

      if (
        amount === "" ||
        !Number.isFinite(
          fundAmount
        ) ||
        fundAmount <= 0
      ) {
        setError(
          "Please enter a valid amount greater than 0"
        );

        return;
      }

      try {
        setFunding(true);

        console.log(
          "FUND MEMBER WALLET:",
          {
            memberId:
              selectedMember.id,
            amount:
              fundAmount,
          }
        );

        // ------------------------------------------
        // FUND API
        // ------------------------------------------

        const response =
          await fundMemberWallet({
            memberId:
              selectedMember.id,

            amount:
              fundAmount,

            description:
              "Money added by librarian",
          });

        console.log(
          "FUND MEMBER RESPONSE:",
          response
        );

        // ------------------------------------------
        // SUCCESS
        // ------------------------------------------

        setSuccess(
          `₹${fundAmount.toFixed(
            2
          )} added to ${
            selectedMember?.name ||
            "member"
          }'s wallet successfully`
        );

        // ------------------------------------------
        // GET UPDATED WALLET
        // ------------------------------------------

        const walletResponse =
          await getWallet(
            "MEMBER",
            selectedMember.id
          );

        const updatedWallet =
          walletResponse?.data?.wallet ||
          walletResponse?.wallet ||
          walletResponse?.data ||
          null;

        setWallet(
          updatedWallet || {
            balance:
              getMemberBalance(
                selectedMember
              ) +
              fundAmount,

            fine:
              Number(
                wallet?.fine || 0
              ),
          }
        );

        // ------------------------------------------
        // REFRESH MEMBERS
        // ------------------------------------------

        await loadMembers();

        // ------------------------------------------
        // CLEAR INPUT
        // ------------------------------------------

        setAmount("");

      } catch (error) {
        console.error(
          "FUND MEMBER WALLET ERROR:",
          error
        );

        setError(
          error?.message ||
            "Failed to add money"
        );
      } finally {
        setFunding(false);
      }
    };

  // ======================================================
  // SEARCH
  // ======================================================

  const searchValue =
    search
      .trim()
      .toLowerCase();

  const filteredMembers =
    members.filter(
      (member) => {
        const id =
          String(
            member?.id || ""
          ).toLowerCase();

        const name =
          String(
            member?.name || ""
          ).toLowerCase();

        const email =
          String(
            member?.email || ""
          ).toLowerCase();

        return (
          id.includes(
            searchValue
          ) ||
          name.includes(
            searchValue
          ) ||
          email.includes(
            searchValue
          )
        );
      }
    );

  // ======================================================
  // COUNTS
  // ======================================================

  const totalMembers =
    members.length;

  const activeMembers =
    members.filter(
      (member) =>
        String(
          member?.status || ""
        ).toUpperCase() ===
        "ACTIVE"
    ).length;

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-slate-900" />

            <p className="mt-4 text-sm text-gray-500">
              Loading members...
            </p>

          </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-6 flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            Library Management
          </p>

          <h1 className="text-3xl font-bold text-gray-900">
            Members
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage members, wallet and activity
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            console.log(
              "Add Member clicked"
            )
          }
          className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
        >
          + Add Member
        </button>

      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">

          <span className="text-sm">
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="text-lg font-bold"
          >
            ×
          </button>

        </div>
      )}

      {/* ==================================================
          SUCCESS
      ================================================== */}

      {success && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">

          <span className="text-sm">
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
            className="text-lg font-bold"
          >
            ×
          </button>

        </div>
      )}

      {/* ==================================================
          STATS
      ================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">

        {/* TOTAL */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <p className="text-sm text-gray-500">
            Total Members
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {totalMembers}
          </h2>

        </div>

        {/* ACTIVE */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <p className="text-sm text-gray-500">
            Active Members
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {activeMembers}
          </h2>

        </div>

        {/* SEARCH */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <p className="text-sm text-gray-500">
            Search Results
          </p>

          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {filteredMembers.length}
          </h2>

        </div>

      </div>

      {/* ==================================================
          SEARCH
      ================================================== */}

      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="Search by name, email or member ID..."
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>

      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="border-b border-gray-200 bg-gray-50">

              <tr>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500">
                  ID
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500">
                  MEMBER
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500">
                  EMAIL
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500">
                  STATUS
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500">
                  WALLET
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500">
                  RENTALS
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500">
                  RESERVATIONS
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500">
                  ACTIONS
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredMembers.length ===
              0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="py-10 text-center text-gray-500"
                  >
                    No members found
                  </td>

                </tr>

              ) : (

                filteredMembers.map(
                  (member) => {

                    const balance =
                      getMemberBalance(
                        member
                      );

                    const rentalCount =
                      getRentalCount(
                        member
                      );

                    const reservationCount =
                      getReservationCount(
                        member
                      );

                    const isDeleting =
                      deletingId ===
                      member.id;

                    return (
                      <tr
                        key={
                          member.id
                        }
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >

                        {/* ID */}

                        <td className="px-5 py-4 font-semibold text-gray-700">
                          #{member.id}
                        </td>

                        {/* MEMBER */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 font-semibold text-white">

                              {String(
                                member?.name ||
                                  "M"
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()}

                            </div>

                            <div>

                              <p className="font-semibold text-gray-900">
                                {member?.name ||
                                  "Unknown"}
                              </p>

                              <p className="text-xs text-gray-500">
                                Library Member
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* EMAIL */}

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {member?.email ||
                            "-"}
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            {String(
                              member?.status ||
                                "ACTIVE"
                            ).toUpperCase()}
                          </span>

                        </td>

                        {/* WALLET */}

                        <td className="px-5 py-4 font-bold text-gray-900">
                          ₹
                          {balance.toFixed(
                            2
                          )}
                        </td>

                        {/* RENTALS */}

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {rentalCount}
                        </td>

                        {/* RESERVATIONS */}

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {reservationCount}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            {/* VIEW */}

                            <button
                              type="button"
                              onClick={() =>
                                handleViewMember(
                                  member
                                )
                              }
                              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                            >
                              View
                            </button>

                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                handleEditMember(
                                  member
                                )
                              }
                              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                            >
                              Edit
                            </button>

                            {/* WALLET */}

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenWallet(
                                  member
                                )
                              }
                              className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
                            >
                              Wallet
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              disabled={
                                isDeleting
                              }
                              onClick={() =>
                                handleDeleteMember(
                                  member
                                )
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isDeleting
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ==================================================
          VIEW MEMBER MODAL
      ================================================== */}

      {viewModal &&
        selectedMember && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b px-6 py-5">

                <div>

                  <h2 className="text-xl font-bold text-gray-900">
                    Member Details
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Member #
                    {
                      selectedMember.id
                    }
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    handleCloseView
                  }
                  className="text-2xl text-gray-500 hover:text-gray-900"
                >
                  ×
                </button>

              </div>

              {/* BODY */}

              <div className="p-6">

                {viewLoading ? (

                  <div className="py-10 text-center">

                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-slate-900" />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading member...
                    </p>

                  </div>

                ) : (

                  <div className="space-y-4">

                    {/* NAME */}

                    <div className="rounded-xl bg-gray-50 p-4">

                      <p className="text-xs text-gray-500">
                        Name
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {selectedMember?.name ||
                          "-"}
                      </p>

                    </div>

                    {/* EMAIL */}

                    <div className="rounded-xl bg-gray-50 p-4">

                      <p className="text-xs text-gray-500">
                        Email
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {selectedMember?.email ||
                          "-"}
                      </p>

                    </div>

                    {/* STATUS */}

                    <div className="rounded-xl bg-gray-50 p-4">

                      <p className="text-xs text-gray-500">
                        Status
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {String(
                          selectedMember?.status ||
                            "ACTIVE"
                        ).toUpperCase()}
                      </p>

                    </div>

                    {/* WALLET */}

                    <div className="rounded-xl bg-gray-50 p-4">

                      <p className="text-xs text-gray-500">
                        Wallet Balance
                      </p>

                      <p className="mt-1 font-bold text-green-600">
                        ₹
                        {getMemberBalance(
                          selectedMember
                        ).toFixed(2)}
                      </p>

                    </div>

                    {/* ACTIVITY */}

                    <div className="grid grid-cols-2 gap-4">

                      <div className="rounded-xl bg-gray-50 p-4">

                        <p className="text-xs text-gray-500">
                          Rentals
                        </p>

                        <p className="mt-1 text-xl font-bold text-gray-900">
                          {getRentalCount(
                            selectedMember
                          )}
                        </p>

                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">

                        <p className="text-xs text-gray-500">
                          Reservations
                        </p>

                        <p className="mt-1 text-xl font-bold text-gray-900">
                          {getReservationCount(
                            selectedMember
                          )}
                        </p>

                      </div>

                    </div>

                  </div>

                )}

              </div>

              {/* FOOTER */}

              <div className="border-t p-6">

                <button
                  type="button"
                  onClick={
                    handleCloseView
                  }
                  className="w-full rounded-xl bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  Close
                </button>

              </div>

            </div>

          </div>
        )}

      {/* ==================================================
          EDIT MEMBER MODAL
      ================================================== */}

      {editModal &&
        selectedMember && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b px-6 py-5">

                <div>

                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Member
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Update member information
                  </p>

                </div>

                <button
                  type="button"
                  disabled={
                    editLoading
                  }
                  onClick={
                    handleCloseEdit
                  }
                  className="text-2xl text-gray-500 hover:text-gray-900 disabled:opacity-50"
                >
                  ×
                </button>

              </div>

              {/* BODY */}

              <div className="space-y-4 p-6">

                {/* NAME */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Name
                  </label>

                  <input
                    type="text"
                    value={
                      editForm.name
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        name:
                          e.target.value,
                      })
                    }
                    disabled={
                      editLoading
                    }
                    placeholder="Enter member name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={
                      editForm.email
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        email:
                          e.target.value,
                      })
                    }
                    disabled={
                      editLoading
                    }
                    placeholder="Enter email"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />

                </div>

                {/* STATUS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Status
                  </label>

                  <select
                    value={
                      editForm.status
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status:
                          e.target.value,
                      })
                    }
                    disabled={
                      editLoading
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >

                    <option value="ACTIVE">
                      ACTIVE
                    </option>

                    <option value="INACTIVE">
                      INACTIVE
                    </option>

                  </select>

                </div>

              </div>

              {/* FOOTER */}

              <div className="flex gap-3 border-t p-6">

                <button
                  type="button"
                  disabled={
                    editLoading
                  }
                  onClick={
                    handleCloseEdit
                  }
                  className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    editLoading
                  }
                  onClick={
                    handleUpdateMember
                  }
                  className="flex-1 rounded-xl bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editLoading
                    ? "Updating..."
                    : "Update Member"}
                </button>

              </div>

            </div>

          </div>
        )}

      {/* ==================================================
          WALLET MODAL
      ================================================== */}

      {walletModal &&
        selectedMember && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b px-6 py-5">

                <div>

                  <h2 className="text-xl font-bold text-gray-900">
                    Member Wallet
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {
                      selectedMember?.name ||
                      "Member"
                    }
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    handleCloseWallet
                  }
                  disabled={
                    funding
                  }
                  className="text-2xl text-gray-500 hover:text-gray-900 disabled:opacity-50"
                >
                  ×
                </button>

              </div>

              {/* BODY */}

              <div className="p-6">

                {/* WALLET DETAILS */}

                <div className="mb-5 rounded-xl bg-gray-50 p-4">

                  <div className="mb-3 flex justify-between">

                    <span className="text-gray-500">
                      Member ID
                    </span>

                    <span className="font-bold">
                      #
                      {
                        selectedMember.id
                      }
                    </span>

                  </div>

                  <div className="mb-3 flex justify-between">

                    <span className="text-gray-500">
                      Current Balance
                    </span>

                    <span className="font-bold text-green-600">
                      ₹
                      {Number(
                        wallet?.balance ||
                          0
                      ).toFixed(2)}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Pending Fine
                    </span>

                    <span className="font-bold text-red-600">
                      ₹
                      {Number(
                        wallet?.fine ||
                          0
                      ).toFixed(2)}
                    </span>

                  </div>

                </div>

                {/* LOADING */}

                {walletLoading && (
                  <div className="mb-5 rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500">
                    Loading wallet...
                  </div>
                )}

                {/* ADD MONEY */}

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Add Money
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-gray-500">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={
                      amount
                    }
                    onChange={(e) =>
                      setAmount(
                        e.target.value
                      )
                    }
                    placeholder="Enter amount"
                    disabled={
                      funding ||
                      walletLoading
                    }
                    className="w-full rounded-xl border border-gray-200 py-3 pl-9 pr-4 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />

                </div>

                {/* INFO */}

                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">

                  <p className="text-sm text-blue-700">
                    Money will be added directly
                    to the member wallet.
                  </p>

                </div>

                {/* BUTTONS */}

                <div className="mt-6 flex gap-3">

                  <button
                    type="button"
                    onClick={
                      handleCloseWallet
                    }
                    disabled={
                      funding
                    }
                    className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleAddMoney
                    }
                    disabled={
                      funding ||
                      walletLoading ||
                      !amount
                    }
                    className="flex-1 rounded-xl bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {funding
                      ? "Adding..."
                      : "Add Money"}
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}