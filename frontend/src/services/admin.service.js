"use client";

import api from "../lib/api";

// Get Admin Dashboard
export const getAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard");

  return response.data;
};