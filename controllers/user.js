const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");

// Register User route
const RegisterUser = async (req, res) => {
  const { name, emailId, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { emailId } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists, Please Login",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const createUser = await User.create({
      name,
      emailId,
      password: hashedPassword,
    });

    const Token = generateToken(
      createUser.id,
      createUser.name,
      createUser.emailId
    );
    console.log(Token);

    await createUser.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "vineshkrishna26@gmail.com",
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "vineshkrishna26@gmail.com",
      to: emailId,
      subject: "Email Verification",
      text: `Please verify your email by clicking the following link: http://localhost:3000/user/verifyEmail/${Token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
      } else {
        console.log("Email sent:", info.response);
        res.json({ message: "Email sent" });
      }
    });

    res.status(200).json({
      success: true,
      message: "Successfuly signed up, Please verify your email",
      id: createUser.id,
      name: createUser.name,
      emailId: createUser.emailId,
      token: Token,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Login route
const LoginUser = async (req, res) => {
  const { emailId, password } = req.body;

  try {
    const existingUser = await User.findOne({
      where: { emailId },
    });

    if (existingUser) {
      // if the existing user is not verified
      if (!existingUser.isVerified) {
        return res.status(401).json({
          success: false,
          message: "Email not verified. Please verify your email first.",
        });
      }
      const isPasswordMatched = await bcrypt.compare(
        password,
        existingUser.password
      );
      if (isPasswordMatched) {
        await existingUser.save();
        const Token = generateToken(
          existingUser.id,
          existingUser.name,
          existingUser.emailId
        );

        // Update the user's token in the database or local storage
        existingUser.token = Token;
        await existingUser.save();
        const userId = existingUser.id;
        console.log(`The current logged in User is : `, userId);

        return res.status(200).json({
          success: true,
          message: "User LoggedIn Successfully",
          data: {
            id: userId,
            token: Token,
          },
        });
      }
    }
    return res
      .status(400)
      .json({ success: false, message: "Invalid login credentials" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Email verification
const VerifyEmail = async (req, res) => {
  const token = req.params.Token;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.id;
    const user = await User.findByPk(userId);
    console.log(user);

    user.isVerified = true;
    await user.save();

    return res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.log("Error verifying email:", error);
    res.status(500).json({ error: "Failed to verify email" });
  }
};

const GetAllUsers = async (req, res) => {
  try {
    const getUser = await User.findAll();
    res.status(200).json({
      success: true,
      message: "users fetched successfully",
      data: getUser,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const ForgotPassword = async (req, res) => {
  const { emailId } = req.body;

  try {
    // Find the user by their email
    const user = await User.findOne({ where: { emailId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a unique token for the password reset link
    const Token = generateToken({ userId: user.id });
    console.log(Token);

    // Save the token in the user's record in the database
    user.resetPasswordToken = Token;
    await user.save();

    // Send an email to the user with the password reset link
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "vineshkrishna26@gmail.com",
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "vineshkrishna26@gmail.com",
      to: emailId,
      subject: "Reset Your Password",
      text: `http://localhost:3000/resetPassword.html`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
      } else {
        console.log("Email sent:", info.response);
        res.json({ message: "Email sent" });
      }
    });
  } catch (error) {
    console.log("Error initiating password reset:", error);
    res.status(500).json(error);
  }
};

// Reset password
const ResetPassword = async (req, res) => {
  const { emailId, password } = req.body;

  try {
    const user = await User.findOne({ where: { emailId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully", user });
  } catch (error) {
    console.log("Error resetting password:", error);
    res.status(500).json(error);
  }
};

const GetSingleUser = async (req, res) => {
  try {
    const id = req.params.id;
    const getUser = await User.findByPk(id);
    res.status(200).json({
      success: true,
      message: "users fetched successfully",
      data: getUser,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const DeleteUser = async (req, res) => {
  try {
    await User.destroy({
      where: { id: req.params.id },
    });
    res.status(200).json({
      success: true,
      message: "user deleted successfully",
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  RegisterUser,
  LoginUser,
  VerifyEmail,
  ForgotPassword,
  ResetPassword,
  GetAllUsers,
  GetSingleUser,
  DeleteUser,
};
