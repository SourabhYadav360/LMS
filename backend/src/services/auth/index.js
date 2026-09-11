"use strict";

const {
  registerMember,
} = require("./registerMember.service");

const {
  login,
} = require("./login.js");

const {
  getMe,
} = require("./getMe.js");

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  registerMember,
  login,
  getMe,
};