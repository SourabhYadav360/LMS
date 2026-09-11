"use strict";

const {
  registerMember,
  login,
  getMe,
} = require("../services/auth");

// ======================================================
// REGISTER MEMBER
// ======================================================

const register = async (req, res, next) => {
  try {
    const result = await registerMember(req.body);

    return res.status(201).json({
      success: true,
      message: "Member registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// LOGIN
// ======================================================

const loginUser = async (req, res, next) => {
  try {
    const result = await login(req.body);

    res.cookie("accessToken", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });  //es.cookie() Express ka built-in method hai jo browser mein cookie set karta hai.

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET CURRENT USER
// ======================================================

const getCurrentUser = async (req, res, next) => {
  try {
    const result = await getMe(
      req.user.userId,
      req.user.role
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
// EXPORT
// ======================================================

module.exports = {
  register,
  loginUser,
  getCurrentUser,
};