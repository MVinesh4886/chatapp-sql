const express = require("express");
const member = express.Router();
const {
  addUserToGroup,
  getUserGroup,
  removeGroupMember,
  makeAdmin,
  removeAdmin,
} = require("../controllers/member");
const isLogin = require("../middlewares/Auth");

member.post("/add/:id", isLogin, addUserToGroup);
member.get("/get/:id", isLogin, getUserGroup);
member.delete("/groupId/:groupId/userId/:userId", isLogin, removeGroupMember);
member.post("/makeAdmin/:groupId/:userId", isLogin, makeAdmin);
member.post("/removeAdmin/:groupId/:userId", isLogin, removeAdmin);

module.exports = member;
