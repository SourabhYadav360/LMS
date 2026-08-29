import api from "@/lib/api";

// ==========================================
// GET ALL MEMBERS
// ==========================================

export const getMembers = async () => {
  return await api("/members", {
    method: "GET",
  });
};

// ==========================================
// GET MEMBER BY ID
// ==========================================

export const getMemberById = async (id) => {
  return await api(`/members/${id}`, {
    method: "GET",
  });
};

// ==========================================
// CREATE MEMBER
// ==========================================

export const createMember = async (data) => {
  return await api("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
    }),
  });
};

// ==========================================
// UPDATE MEMBER
// ==========================================

export const updateMember = async (id, data) => {
  return await api(`/members/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// ==========================================
// DELETE MEMBER
// ==========================================

export const deleteMember = async (id) => {
  return await api(`/members/${id}`, {
    method: "DELETE",
  });
};