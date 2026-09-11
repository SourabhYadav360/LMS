"use client";

import api from "../lib/api";

// Get all books
export const getBooks = async () => {
  const response = await api.get("/books");

  return response.data;
};

// Get book by ID
export const getBookById = async (bookId) => {
  const response = await api.get(`/books/${bookId}`);

  return response.data;
};

// Create book
export const createBook = async (data) => {
  const response = await api.post("/books", data);

  return response.data;
};

// Update book
export const updateBook = async (bookId, data) => {
  const response = await api.put(`/books/${bookId}`, data);

  return response.data;
};

// Delete book
export const deleteBook = async (bookId) => {
  const response = await api.delete(`/books/${bookId}`);

  return response.data;
};