"use client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

// ======================================================
// COMMON API FUNCTION
// ======================================================

const api = async (endpoint, options = {}) => {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  let data;

  try {
    data = await response.json();
  } catch (error) {
    data = {
      success: false,
      message: "Invalid server response",
    };
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    );
  }

  return data;
};

// ======================================================
// DASHBOARD
// ======================================================

export const getAdminDashboard = async () => {
  return await api("/admin/dashboard", {
    method: "GET",
  });
};

// ======================================================
// GET ALL LIBRARIANS
// ======================================================

export const getLibrarians = async () => {
  return await api("/admin/librarians", {
    method: "GET",
  });
};

// ======================================================
// GET SINGLE LIBRARIAN
// ======================================================

export const getLibrarianById = async (
  librarianId
) => {
  if (!librarianId) {
    throw new Error("Librarian ID is required");
  }

  return await api(
    `/admin/librarians/${librarianId}`,
    {
      method: "GET",
    }
  );
};

// ======================================================
// CREATE LIBRARIAN
// ======================================================

export const createLibrarian = async ({
  name,
  email,
  password,
  permissions = {},
}) => {
  return await api("/admin/librarians", {
    method: "POST",

    body: JSON.stringify({
      name,
      email,
      password,
      permissions,
    }),
  });
};

// ======================================================
// UPDATE LIBRARIAN
// ======================================================

export const updateLibrarian = async (
  librarianId,
  data
) => {
  if (!librarianId) {
    throw new Error("Librarian ID is required");
  }

  return await api(
    `/admin/librarians/${librarianId}`,
    {
      method: "PUT",

      body: JSON.stringify(data),
    }
  );
};

// ======================================================
// UPDATE LIBRARIAN PERMISSIONS
// ======================================================

export const updateLibrarianPermissions = async (
  librarianId,
  permissions
) => {
  if (!librarianId) {
    throw new Error("Librarian ID is required");
  }

  return await api(
    `/admin/librarians/${librarianId}/permissions`,
    {
      method: "PATCH",

      body: JSON.stringify({
        permissions,
      }),
    }
  );
};

// ======================================================
// ACTIVATE LIBRARIAN
// ======================================================

export const activateLibrarian = async (
  librarianId
) => {
  if (!librarianId) {
    throw new Error("Librarian ID is required");
  }

  return await api(
    `/admin/librarians/${librarianId}/activate`,
    {
      method: "PATCH",
    }
  );
};

// ======================================================
// DEACTIVATE LIBRARIAN
// ======================================================

export const deactivateLibrarian = async (
  librarianId
) => {
  if (!librarianId) {
    throw new Error("Librarian ID is required");
  }

  return await api(
    `/admin/librarians/${librarianId}/deactivate`,
    {
      method: "PATCH",
    }
  );
};

// ======================================================
// MEMBERS
// ======================================================

// GET ALL MEMBERS
export const getMembers = async () => {
  return await api("/admin/members", {
    method: "GET",
  });
};

// ACTIVATE MEMBER
export const activateMember = async (memberId) => {
  return await api(
    `/admin/members/${memberId}/activate`,
    {
      method: "PATCH",
    }
  );
};

// DEACTIVATE MEMBER
export const deactivateMember = async (memberId) => {
  return await api(
    `/admin/members/${memberId}/deactivate`,
    {
      method: "PATCH",
    }
  );
};

// ======================================================
// CATEGORIES
// ======================================================

// GET ALL CATEGORIES
export const getCategories = async () => {
  return await api("/categories", {
    method: "GET",
  });
};

// GET SINGLE CATEGORY
export const getCategoryById = async (
  categoryId
) => {
  return await api(
    `/categories/${categoryId}`,
    {
      method: "GET",
    }
  );
};

// CREATE CATEGORY
export const createCategory = async ({
  name,
  description,
}) => {
  return await api("/categories", {
    method: "POST",

    body: JSON.stringify({
      name,
      description,
    }),
  });
};

// UPDATE CATEGORY
export const updateCategory = async (
  categoryId,
  data
) => {
  return await api(
    `/categories/${categoryId}`,
    {
      method: "PUT",

      body: JSON.stringify(data),
    }
  );
};

// DELETE CATEGORY
export const deleteCategory = async (
  categoryId
) => {
  return await api(
    `/categories/${categoryId}`,
    {
      method: "DELETE",
    }
  );
};

// ======================================================
// BOOKS
// ======================================================

// GET ALL BOOKS
export const getBooks = async () => {
  return await api("/books", {
    method: "GET",
  });
};

// GET SINGLE BOOK
export const getBookById = async (bookId) => {
  return await api(`/books/${bookId}`, {
    method: "GET",
  });
};

// CREATE BOOK
export const createBook = async ({
  title,
  author,
  isbn,
  description,
  totalCopies,
  categoryId,
}) => {
  return await api("/books", {
    method: "POST",

    body: JSON.stringify({
      title,
      author,
      isbn,
      description,
      totalCopies,
      categoryId,
    }),
  });
};

// UPDATE BOOK
export const updateBook = async (
  bookId,
  data
) => {
  return await api(`/books/${bookId}`, {
    method: "PUT",

    body: JSON.stringify(data),
  });
};

// DELETE BOOK
export const deleteBook = async (bookId) => {
  return await api(`/books/${bookId}`, {
    method: "DELETE",
  });
};