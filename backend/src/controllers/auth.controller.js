"use strict";

const authService = require("../services/auth.service");

// ======================================================
// REGISTER MEMBER
// ======================================================

const registerMember = async (req, res) => {
  try {
    const member =
      await authService.registerMember(
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Member registered successfully",
      data: {
        user: member,
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
// SINGLE LOGIN
// ======================================================

const login = async (req, res) => {
  try {
    const result =
      await authService.login(req.body);

    // JWT ONLY COOKIE
    res.cookie(
      "accessToken",
      result.token,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        maxAge:
          24 * 60 * 60 * 1000,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",

      data: {
        user: result.user,
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
// GET ME
// ======================================================

const getMe = async (req, res) => {
  try {
    const user =
      await authService.getMe(
        req.user.userId,
        req.user.role
      );

    return res.status(200).json({
      success: true,
      message:
        "User fetched successfully",
      data: {
        user,
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
// LOGOUT
// ======================================================

const logout = async (req, res) => {
  res.clearCookie(
    "accessToken",
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",
    }
  );

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

module.exports = {
  registerMember,
  login,
  getMe,
  logout,
};