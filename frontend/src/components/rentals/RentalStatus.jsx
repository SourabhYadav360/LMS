"use client";

import React from "react";

const RentalStatus = ({ status }) => {
  const statusConfig = {
    ACTIVE: {
      label: "Active",
      className:
        "bg-blue-100 text-blue-700",
    },

    OVERDUE: {
      label: "Overdue",
      className:
        "bg-red-100 text-red-700",
    },

    RETURNED: {
      label: "Returned",
      className:
        "bg-green-100 text-green-700",
    },
  };

  const config =
    statusConfig[status] || {
      label: status || "Unknown",
      className:
        "bg-gray-100 text-gray-700",
    };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default RentalStatus;