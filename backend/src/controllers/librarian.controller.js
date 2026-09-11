"use strict";

const {
  createLibrarian,
  getAllLibrarians,
  getLibrarianById,
  updateLibrarian,
  updateOwnLibrarianProfile,
  updateLibrarianPermissions,
  deleteLibrarian,
  getDashboard,
} = require("../services/librarian");

// ======================================================
// LIBRARIAN DASHBOARD
// ======================================================

const getLibrarianDashboard = async (
  req,
  res,
  next
) => {
  try {
    const result = await getDashboard(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// CREATE LIBRARIAN
// ======================================================

const create = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    const result = await createLibrarian({
      name,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Librarian created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL LIBRARIANS
// ======================================================

const getAll = async (req, res, next) => {
  try {
    const result = await getAllLibrarians();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET LIBRARIAN BY ID
// ======================================================

const getById = async (req, res, next) => {
  try {
    const librarianId =
      req.params.librarianId ||
      req.params.id;

    const result = await getLibrarianById(
      librarianId
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE LIBRARIAN
// ======================================================

const update = async (req, res, next) => {
  try {
    const librarianId =
      req.params.librarianId ||
      req.params.id;

    const result = await updateLibrarian(
      librarianId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Librarian updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateOwnProfile = async (req, res, next) => {
  try {
    if (req.user.role !== "LIBRARIAN") {
      const error = new Error("Only librarians can update this profile");
      error.statusCode = 403;
      throw error;
    }

    const result = await updateOwnLibrarianProfile(
      req.user.userId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE LIBRARIAN PERMISSIONS
// ======================================================

const updatePermissions = async (
  req,
  res,
  next
) => {
  try {
    const librarianId =
      req.params.librarianId ||
      req.params.id;

    const result =
      await updateLibrarianPermissions(
        librarianId,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Librarian permissions updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// DELETE LIBRARIAN
// ======================================================

const remove = async (req, res, next) => {
  try {
    const librarianId =
      req.params.librarianId ||
      req.params.id;

    const result = await deleteLibrarian(
      librarianId
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLibrarianDashboard,
  create,
  getAll,
  getById,
  update,
  updateOwnProfile,
  updatePermissions,
  remove,
};