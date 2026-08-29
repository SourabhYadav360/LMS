"use strict";

const adminService = require("../services/admin.service");

// ======================================================
// DASHBOARD
// ======================================================

const getDashboard = async (req, res) => {
  try {
    const data =
      await adminService.getDashboard();

    return res.status(200).json({
      success: true,
      message: "Dashboard fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// GET ALL LIBRARIANS
// ======================================================

const getLibrarians = async (req, res) => {
  try {
    const librarians =
      await adminService.getLibrarians();

    return res.status(200).json({
      success: true,
      message: "Librarians fetched successfully",
      data: {
        librarians,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// GET SINGLE LIBRARIAN
// ======================================================

const getLibrarianById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const librarian =
      await adminService.getLibrarianById(
        id
      );

    return res.status(200).json({
      success: true,
      message:
        "Librarian fetched successfully",
      data: {
        librarian,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// CREATE LIBRARIAN
// ======================================================

const createLibrarian = async (
  req,
  res
) => {
  try {
    const librarian =
      await adminService.createLibrarian(
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Librarian created successfully",
      data: {
        librarian,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// UPDATE LIBRARIAN
// ======================================================

const updateLibrarian = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const librarian =
      await adminService.updateLibrarian(
        id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Librarian updated successfully",
      data: {
        librarian,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// ACTIVATE LIBRARIAN
// ======================================================

const activateLibrarian = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const librarian =
      await adminService.activateLibrarian(
        id
      );

    return res.status(200).json({
      success: true,
      message:
        "Librarian activated successfully",
      data: {
        librarian,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// DEACTIVATE LIBRARIAN
// ======================================================

const deactivateLibrarian = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const librarian =
      await adminService.deactivateLibrarian(
        id
      );

    return res.status(200).json({
      success: true,
      message:
        "Librarian deactivated successfully",
      data: {
        librarian,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// UPDATE LIBRARIAN PERMISSIONS
// ======================================================

const updateLibrarianPermissions = async (req, res) => {
  try {
    const { id } = req.params;

    const result =
      await adminService.updateLibrarianPermissions(
        id,
        req.body.permissions
      );

    return res.status(200).json({
      success: true,
      message:
        "Librarian permissions updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Something went wrong",
    });
  }
};

// ======================================================
// GET ALL MEMBERS
// ======================================================

const getMembers = async (req, res) => {
  try {
    const members =
      await adminService.getMembers();

    return res.status(200).json({
      success: true,
      message: "Members fetched successfully",
      data: {
        members,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// ACTIVATE MEMBER
// ======================================================

const activateMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member =
      await adminService.activateMember(id);

    return res.status(200).json({
      success: true,
      message: "Member activated successfully",
      data: {
        member,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// DEACTIVATE MEMBER
// ======================================================

const deactivateMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member =
      await adminService.deactivateMember(id);

    return res.status(200).json({
      success: true,
      message:
        "Member deactivated successfully",
      data: {
        member,
      },
    });
  } catch (error) {
    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Something went wrong",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  // Dashboard
  getDashboard,

  // Librarian
  getLibrarians,
  getLibrarianById,
  createLibrarian,
  updateLibrarian,
  activateLibrarian,
  deactivateLibrarian,
  updateLibrarianPermissions,

  // Member
  getMembers,
  activateMember,
  deactivateMember,
};