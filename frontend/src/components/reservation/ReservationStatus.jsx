"use client";

const ReservationStatus = ({ status }) => {
  const statusConfig = {
    PENDING: {
      label: "Pending",
      className:
        "bg-yellow-100 text-yellow-800 border-yellow-200",
    },

    APPROVED: {
      label: "Approved",
      className:
        "bg-blue-100 text-blue-800 border-blue-200",
    },

    REJECTED: {
      label: "Rejected",
      className:
        "bg-red-100 text-red-800 border-red-200",
    },

    CANCELLED: {
      label: "Cancelled",
      className:
        "bg-gray-100 text-gray-800 border-gray-200",
    },

    COMPLETED: {
      label: "Completed",
      className:
        "bg-green-100 text-green-800 border-green-200",
    },

    EXPIRED: {
      label: "Expired",
      className:
        "bg-orange-100 text-orange-800 border-orange-200",
    },
  };

  const currentStatus =
    statusConfig[status] || {
      label: status || "Unknown",
      className:
        "bg-gray-100 text-gray-800 border-gray-200",
    };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${currentStatus.className}`}
    >
      {currentStatus.label}
    </span>
  );
};

export default ReservationStatus;