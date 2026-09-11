"use client";

import api from "../lib/api";

// Get all librarians
export const getLibrarians = async () => {
  const response = await api.get("/librarians");

  return response.data;
};

// Get librarian by ID
export const getLibrarianById = async (librarianId) => {
  const response = await api.get(`/librarians/${librarianId}`);

  return response.data;
};

// Create librarian
export const createLibrarian = async (data) => {
  const response = await api.post("/librarians", data);

  return response.data;
};

// Update librarian
export const updateLibrarian = async (librarianId, data) => {
  const response = await api.put(
    `/librarians/${librarianId}`,
    data
  );

  return response.data;
};

export const updateMyLibrarianProfile = async (data) => {
  const response = await api.put("/librarians/profile", data);

  return response.data;
};

// Delete librarian
export const deleteLibrarian = async (librarianId) => {
  const response = await api.delete(
    `/librarians/${librarianId}`
  );

  return response.data;
};

// Update librarian permissions
export const updateLibrarianPermissions = async (
  librarianId,
  permissions
) => {
  const response = await api.put(
    `/librarians/${librarianId}/permissions`,
    permissions
  );

  return response.data;
};

// Get librarian dashboard
export const getLibrarianDashboard = async () => {
  const response = await api.get("/librarians/dashboard");

  return response.data;
};