"use client";

import { useEffect, useState } from "react";

import {
  getMembers,
  activateMember,
  deactivateMember,
} from "@/services/admin.service";

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(null);
  const [error, setError] = useState("");

  // ======================================================
  // FETCH MEMBERS
  // ======================================================

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMembers();

      console.log(
        "Members API response:",
        response
      );

      setMembers(
        response?.data?.members || []
      );
    } catch (error) {
      console.error(
        "Get members error:",
        error
      );

      setError(
        error.message ||
          "Failed to fetch members"
      );

      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchMembers();
  }, []);

  // ======================================================
  // ACTIVATE
  // ======================================================

  const handleActivate = async (memberId) => {
    try {
      setActionLoading(memberId);
      setError("");

      await activateMember(memberId);

      await fetchMembers();
    } catch (error) {
      console.error(
        "Activate member error:",
        error
      );

      setError(
        error.message ||
          "Failed to activate member"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ======================================================
  // DEACTIVATE
  // ======================================================

  const handleDeactivate = async (memberId) => {
    try {
      setActionLoading(memberId);
      setError("");

      await deactivateMember(memberId);

      await fetchMembers();
    } catch (error) {
      console.error(
        "Deactivate member error:",
        error
      );

      setError(
        error.message ||
          "Failed to deactivate member"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">
          Loading members...
        </p>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Members
        </h1>

        <p className="mt-1 text-gray-500">
          View and manage library members
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {error}
        </div>
      )}

      {/* STATS */}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* TOTAL */}

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Members
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {members.length}
          </p>
        </div>

        {/* ACTIVE */}

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Active Members
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {
              members.filter(
                (member) =>
                  member.status === "ACTIVE"
              ).length
            }
          </p>
        </div>

        {/* INACTIVE */}

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Inactive Members
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {
              members.filter(
                (member) =>
                  member.status === "INACTIVE"
              ).length
            }
          </p>
        </div>

      </div>

      {/* MEMBERS TABLE */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            All Members
          </h2>
        </div>

        {members.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">
              No members found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">

                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Name
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                    Action
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {members.map((member) => {

                  const isActive =
                    member.status === "ACTIVE";

                  const isLoading =
                    actionLoading === member.id;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-gray-50"
                    >

                      {/* NAME */}

                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {member.name}
                        </div>
                      </td>

                      {/* EMAIL */}

                      <td className="px-6 py-4">
                        <div className="text-gray-600">
                          {member.email}
                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {member.status}
                        </span>

                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-4 text-right">

                        {isActive ? (
                          <button
                            onClick={() =>
                              handleDeactivate(
                                member.id
                              )
                            }
                            disabled={isLoading}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isLoading
                              ? "Updating..."
                              : "Deactivate"}
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleActivate(
                                member.id
                              )
                            }
                            disabled={isLoading}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isLoading
                              ? "Updating..."
                              : "Activate"}
                          </button>
                        )}

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}