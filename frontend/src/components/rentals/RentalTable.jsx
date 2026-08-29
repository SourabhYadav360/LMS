"use client";

import React from "react";

const RentalStatus = ({ status }) => {
  const statusStyles = {
    ACTIVE:
      "bg-blue-100 text-blue-700",

    OVERDUE:
      "bg-red-100 text-red-700",

    RETURNED:
      "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        statusStyles[status] ||
        "bg-gray-100 text-gray-700"
      }`}
    >
      {status || "UNKNOWN"}
    </span>
  );
};

const RentalTable = ({
  rentals = [],
  onView,
  onReturn,
  returningId,
}) => {
  if (!rentals.length) {
    return (
      <div className="rounded-lg border bg-white p-6 text-center">
        <p className="text-gray-500">
          No rentals found
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border bg-white">
      <table className="w-full min-w-[1000px] text-sm">

        {/* ==================================================
            HEADER
        ================================================== */}

        <thead className="border-b bg-gray-50">
          <tr>

            <th className="px-4 py-3 text-left">
              ID
            </th>

            <th className="px-4 py-3 text-left">
              Member
            </th>

            <th className="px-4 py-3 text-left">
              Book
            </th>

            <th className="px-4 py-3 text-left">
              Rented At
            </th>

            <th className="px-4 py-3 text-left">
              Due Date
            </th>

            <th className="px-4 py-3 text-left">
              Returned At
            </th>

            <th className="px-4 py-3 text-left">
              Status
            </th>

            <th className="px-4 py-3 text-left">
              Action
            </th>

          </tr>
        </thead>

        {/* ==================================================
            BODY
        ================================================== */}

        <tbody>

          {rentals.map((rental) => {

            const isReturning =
              returningId === rental.id;

            const canReturn =
              rental.status === "ACTIVE" ||
              rental.status === "OVERDUE";

            return (
              <tr
                key={rental.id}
                className="border-b last:border-b-0 hover:bg-gray-50"
              >

                {/* ID */}

                <td className="px-4 py-3">
                  #{rental.id}
                </td>

                {/* MEMBER */}

                <td className="px-4 py-3">
                  {rental.member?.name ||
                    rental.member?.email ||
                    rental.memberId}
                </td>

                {/* BOOK */}

                <td className="px-4 py-3">

                  <div>
                    <p className="font-medium">
                      {rental.book?.title ||
                        "Unknown Book"}
                    </p>

                    {rental.book?.author && (
                      <p className="text-xs text-gray-500">
                        {rental.book.author}
                      </p>
                    )}
                  </div>

                </td>

                {/* RENTED AT */}

                <td className="px-4 py-3">
                  {rental.rentedAt
                    ? new Date(
                        rental.rentedAt
                      ).toLocaleDateString()
                    : "-"}
                </td>

                {/* DUE DATE */}

                <td className="px-4 py-3">
                  {rental.dueDate
                    ? new Date(
                        rental.dueDate
                      ).toLocaleDateString()
                    : "-"}
                </td>

                {/* RETURNED AT */}

                <td className="px-4 py-3">
                  {rental.returnedAt
                    ? new Date(
                        rental.returnedAt
                      ).toLocaleDateString()
                    : "-"}
                </td>

                {/* STATUS */}

                <td className="px-4 py-3">
                  <RentalStatus
                    status={rental.status}
                  />
                </td>

                {/* ACTION */}

                <td className="px-4 py-3">

                  <div className="flex gap-2">

                    {/* VIEW */}

                    <button
                      type="button"
                      onClick={() =>
                        onView?.(rental)
                      }
                      className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100"
                    >
                      View
                    </button>

                    {/* RETURN */}

                    {canReturn && (
                      <button
                        type="button"
                        disabled={isReturning}
                        onClick={() =>
                          onReturn?.(rental)
                        }
                        className="rounded-md bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {isReturning
                          ? "Returning..."
                          : "Return"}
                      </button>
                    )}

                  </div>

                </td>

              </tr>
            );
          })}

        </tbody>

      </table>
    </div>
  );
};

export default RentalTable;