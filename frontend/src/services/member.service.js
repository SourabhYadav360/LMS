"use client";

import api from "../lib/api";

// Get all members
export const getMembers = async () => {
  const response = await api.get("/members");

  return response.data;
};

// Get member by ID
export const getMemberById = async (memberId) => {
  const response = await api.get(`/members/${memberId}`);

  return response.data;
};

// Create member
export const createMember = async (data) => {
  const response = await api.post("/members", data);

  return response.data;
};

// Update member
export const updateMember = async (memberId, data) => {
  const response = await api.put(`/members/${memberId}`, data);

  return response.data;
};

export const updateMyMemberProfile = async (data) => {
  const response = await api.put("/members/profile", data);

  return response.data;
};

// Delete member
export const deleteMember = async (memberId) => {
  const response = await api.delete(`/members/${memberId}`);

  return response.data;
};

// Get member dashboard
export const getMemberDashboard = async () => {
  const response = await api.get("/members/dashboard");

  return response.data;
};