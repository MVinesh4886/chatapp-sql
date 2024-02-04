const jwt = require("jsonwebtoken");

const generateToken = (id, name, emailId) => {
  return jwt.sign({ id, name, emailId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "10d",
  });
};

module.exports = generateToken;
