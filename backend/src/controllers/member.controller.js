"use strict";

const memberService = require("../services/member.service");

// ======================================================
// GET ALL MEMBERS
// ======================================================

const getMembers = async (req, res) => {
  try {
    const members =
      await memberService.getMembers();

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
// GET MEMBER BY ID
// ======================================================

const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const member =
      await memberService.getMemberById(id);

    return res.status(200).json({
      success: true,
      message: "Member fetched successfully",
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
// UPDATE MEMBER
// ======================================================

const updateMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member =
      await memberService.updateMember(
        id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Member updated successfully",
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
// DELETE MEMBER
// ======================================================

const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    const result =
      await memberService.deleteMember(id);

    return res.status(200).json({
      success: true,
      message: "Member deleted successfully",
      data: result,
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
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
};