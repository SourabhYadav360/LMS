import api from "@/lib/api";

// ==========================================
// GET LIBRARIAN DASHBOARD
// ==========================================

export const getLibrarianDashboard = async () => {
  return await api("/librarians/dashboard", {
    method: "GET",
  });
};

// ==========================================
// GET ALL LIBRARIANS
// ==========================================

export const getAllLibrarians = async () => {
  return await api("/librarians", {
    method: "GET",
  });
};

// ==========================================
// GET LIBRARIAN BY ID
// ==========================================

export const getLibrarianById = async (id) => {
  return await api(`/librarians/${id}`, {
    method: "GET",
  });
};

// ==========================================
// UPDATE LIBRARIAN
// ==========================================

export const updateLibrarian = async (id, data) => {
  return await api(`/librarians/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// ==========================================
// UPDATE PERMISSIONS
// ==========================================

export const updateLibrarianPermissions = async (
  id,
  permissions
) => {
  return await api(`/librarians/${id}/permissions`, {
    method: "PATCH",
    body: JSON.stringify(permissions),
  });
};

// ==========================================
// DELETE LIBRARIAN
// ==========================================

export const deleteLibrarian = async (id) => {
  return await api(`/librarians/${id}`, {
    method: "DELETE",
  });
};