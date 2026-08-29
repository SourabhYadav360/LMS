import api from "@/lib/api";

// ==========================================
// LOGIN
// ==========================================

export const login = async (email, password) => {
  return await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

// ==========================================
// REGISTER MEMBER
// ==========================================

export const registerMember = async (
  name,
  email,
  password
) => {
  return await api("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
};

// ==========================================
// GET CURRENT USER
// ==========================================

export const getMe = async () => {
  return await api("/auth/me", {
    method: "GET",
  });
};

// ==========================================
// LOGOUT
// ==========================================

export const logout = async () => {
  return await api("/auth/logout", {
    method: "POST",
  });
};