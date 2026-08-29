"use client";

import api from "@/lib/api";

// ======================================================
// GET ALL BOOKS
// ======================================================

export const getBooks = async () => {
  return await api("/books", {
    method: "GET",
  });
};

// ======================================================
// GET SINGLE BOOK
// ======================================================

export const getBookById = async (id) => {
  return await api(`/books/${id}`, {
    method: "GET",
  });
};

// ======================================================
// CREATE BOOK
// ======================================================

export const createBook = async (data) => {
  return await api("/books", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// ======================================================
// UPDATE BOOK
// ======================================================

export const updateBook = async (id, data) => {
  return await api(`/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// ======================================================
// DELETE BOOK
// ======================================================

export const deleteBook = async (id) => {
  return await api(`/books/${id}`, {
    method: "DELETE",
  });
};