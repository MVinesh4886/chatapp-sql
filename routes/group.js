const express = require("express");
const group = express.Router();
const { createGroup, getCreatedGroup } = require("../controllers/group");
const isLogin = require("../middlewares/Auth");

group.post("/create", isLogin, createGroup);
group.get("/get", isLogin, getCreatedGroup);

module.exports = group;
