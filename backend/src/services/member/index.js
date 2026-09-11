"use strict";

const {
  getMemberDashboard,
} = require("./dashboard.service");

const {
  getMembers,
} = require("./getMembers.service");

const {
  getMemberById,
} = require("./getMemberById.service");

const {
  createMember,
} = require("./createMember.service");

const {
  updateMember,
} = require("./updateMember.service");

const {
  updateOwnMemberProfile,
} = require("./updateOwnProfile.service");

const {
  deleteMember,
} = require("./deleteMember.service");

module.exports = {
  getMemberDashboard,
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  updateOwnMemberProfile,
  deleteMember,
};