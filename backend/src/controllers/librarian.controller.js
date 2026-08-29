const librarianService = require("../services/librarian.service");

// =====================================================
// CREATE LIBRARIAN
// =====================================================

const createLibrarian = async (
  req,
  res,
  next
) => {
  try {
    const librarian =
      await librarianService.createLibrarian(
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Librarian created successfully",
      data: librarian,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET ALL LIBRARIANS
// =====================================================

const getAllLibrarians = async (
  req,
  res,
  next
) => {
  try {
    const librarians =
      await librarianService.getAllLibrarians();

    return res.status(200).json({
      success: true,
      data: librarians,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET LIBRARIAN BY ID
// =====================================================

const getLibrarianById = async (
  req,
  res,
  next
) => {
  try {
    const librarian =
      await librarianService.getLibrarianById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: librarian,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// UPDATE LIBRARIAN
// =====================================================

const updateLibrarian = async (
  req,
  res,
  next
) => {
  try {
    const librarian =
      await librarianService.updateLibrarian(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Librarian updated successfully",
      data: librarian,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// UPDATE PERMISSIONS
// =====================================================

const updateLibrarianPermissions = async (
  req,
  res,
  next
) => {
  try {
    const librarian =
      await librarianService.updateLibrarianPermissions(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Librarian permissions updated successfully",
      data: librarian,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// DELETE LIBRARIAN
// =====================================================

const deleteLibrarian = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await librarianService.deleteLibrarian(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createLibrarian,
  getAllLibrarians,
  getLibrarianById,
  updateLibrarian,
  updateLibrarianPermissions,
  deleteLibrarian,
};