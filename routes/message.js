const express = require("express");
const chat = express.Router();
const {
  createMessage,
  getMessage,
  uploadFile,
} = require("../controllers/message");
const isLogin = require("../middlewares/Auth");

chat.post("/create/:id", isLogin, createMessage);
chat.get("/get/:id", isLogin, getMessage);
chat.post("/upload/:id", isLogin, uploadFile);

module.exports = chat;
