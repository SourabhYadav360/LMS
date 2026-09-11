"use strict";

const {
  getMemberDashboard,
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  updateOwnMemberProfile,
  deleteMember,
} = require("../services/member");

// ======================================================
// GET MEMBER DASHBOARD
// ======================================================

const getDashboard = async (req, res, next) => {
  try {
    const result = await getMemberDashboard(
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
// GET ALL MEMBERS
// ======================================================

const getAll = async (req, res, next) => {
  try {
    const result = await getMembers();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET MEMBER BY ID
// ======================================================

const getById = async (req, res, next) => {
  try {
    const memberId =
      req.params.memberId ||
      req.params.id;

    const result = await getMemberById(
      memberId
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
// CREATE MEMBER
// ======================================================

const create = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    const result = await createMember({
      name,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Member created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE MEMBER
// ======================================================

const update = async (req, res, next) => {
  try {
    const memberId =
      req.params.memberId ||
      req.params.id;

    const {
      name,
      email,
      status,
    } = req.body;

    const result = await updateMember(
      memberId,
      {
        name,
        email,
        status,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Member updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateOwnProfile = async (req, res, next) => {
  try {
    if (req.user.role !== "MEMBER") {
      const error = new Error("Only members can update this profile");
      error.statusCode = 403;
      throw error;
    }

    const result = await updateOwnMemberProfile(
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
// DELETE MEMBER
// ======================================================

const remove = async (req, res, next) => {
  try {
    const memberId =
      req.params.memberId ||
      req.params.id;

    const result = await deleteMember(
      memberId
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
  getDashboard,
  getAll,
  getById,
  create,
  update,
  updateOwnProfile,
  remove,
};