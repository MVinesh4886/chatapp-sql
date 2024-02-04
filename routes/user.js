const express = require("express");
const user = express.Router();
const {
  RegisterUser,
  LoginUser,
  VerifyEmail,
  ForgotPassword,
  ResetPassword,
  GetAllUsers,
  GetSingleUser,
  DeleteUser,
} = require("../controllers/user");

// Register User route
user.post("/signUp", RegisterUser);

// Login route
user.post("/signIn", LoginUser);

// Email verification
user.get("/verifyEmail/:Token", VerifyEmail);

user.get("/signUp", GetAllUsers);

user.post("/forgotPassword", ForgotPassword);

// Reset password
user.post("/resetPassword", ResetPassword);

//getSingleUser
user.get("/:id", GetSingleUser);

//Delete user
user.delete("/:id", DeleteUser);

module.exports = user;
