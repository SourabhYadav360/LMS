"use client";

const RentalDetails = ({
  rental,
  onClose,
  onReturn,
  returningId,
}) => {
  if (!rental) return null;

  const canReturn =
    rental.status === "ACTIVE" ||
    rental.status === "OVERDUE";

  const isReturning =
    returningId === rental.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-xl font-semibold">
            Rental Details
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={isReturning}
            className="text-xl text-gray-500 hover:text-gray-800 disabled:opacity-50"
          >
            ✕
          </button>

        </div>

        {/* ==================================================
            DETAILS
        ================================================== */}

        <div className="space-y-4">

          {/* RENTAL ID */}

          <div>
            <p className="text-sm text-gray-500">
              Rental ID
            </p>

            <p className="font-medium">
              #{rental.id}
            </p>
          </div>

          {/* MEMBER ID */}

          <div>
            <p className="text-sm text-gray-500">
              Member ID
            </p>

            <p className="font-medium">
              {rental.memberId}
            </p>
          </div>

          {/* BOOK */}

          <div>
            <p className="text-sm text-gray-500">
              Book
            </p>

            <p className="font-medium">
              {rental.book?.title ||
                "N/A"}
            </p>
          </div>

          {/* AUTHOR */}

          <div>
            <p className="text-sm text-gray-500">
              Author
            </p>

            <p className="font-medium">
              {rental.book?.author ||
                "N/A"}
            </p>
          </div>

          {/* ISBN */}

          <div>
            <p className="text-sm text-gray-500">
              ISBN
            </p>

            <p className="font-medium">
              {rental.book?.isbn ||
                "N/A"}
            </p>
          </div>

          {/* RENTED AT */}

          <div>
            <p className="text-sm text-gray-500">
              Rented At
            </p>

            <p className="font-medium">
              {rental.rentedAt
                ? new Date(
                    rental.rentedAt
                  ).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          {/* DUE DATE */}

          <div>
            <p className="text-sm text-gray-500">
              Due Date
            </p>

            <p className="font-medium">
              {rental.dueDate
                ? new Date(
                    rental.dueDate
                  ).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          {/* RETURNED AT */}

          <div>
            <p className="text-sm text-gray-500">
              Returned At
            </p>

            <p className="font-medium">
              {rental.returnedAt
                ? new Date(
                    rental.returnedAt
                  ).toLocaleDateString()
                : "Not Returned"}
            </p>
          </div>

          {/* RENTAL AMOUNT */}

          <div>
            <p className="text-sm text-gray-500">
              Rental Amount
            </p>

            <p className="font-medium">
              ₹
              {Number(
                rental.rentalAmount || 0
              ).toFixed(2)}
            </p>
          </div>

          {/* STATUS */}

          <div>
            <p className="text-sm text-gray-500">
              Status
            </p>

            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                rental.status === "RETURNED"
                  ? "bg-green-100 text-green-700"
                  : rental.status === "OVERDUE"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {rental.status}
            </span>
          </div>

        </div>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div className="mt-6 flex gap-3">

          <button
            type="button"
            onClick={onClose}
            disabled={isReturning}
            className="flex-1 rounded-lg border px-4 py-2 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Close
          </button>

          {canReturn && (
            <button
              type="button"
              disabled={isReturning}
              onClick={() =>
                onReturn?.(rental)
              }
              className="flex-1 rounded-lg bg-black px-4 py-2 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isReturning
                ? "Returning..."
                : "Return Book"}
            </button>
          )}

        </div>

      </div>

    </div>
  );
};

export default RentalDetails;