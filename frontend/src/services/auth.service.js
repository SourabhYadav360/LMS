"use client";

import api from "../lib/api";

// Register Member
export const registerMember = async (data) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};

// Login
export const login = async (data) => {
  const response = await api.post("/auth/login", data);

  return response.data;
};

// Get Current User
export const getMe = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};