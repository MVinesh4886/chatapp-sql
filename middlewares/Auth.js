const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isLogin = async (req, res, next) => {
  try {
    //1.get Token from headers
    const token = req.headers["authorization"].split(" ")[1];
    // console.log("Get Token from the headers: ", token);

    //2.verify Token
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log("Verify Token: ", decodedUser);

    const user = await User.findByPk(decodedUser.id);
    // console.log("Check User Id: ", user);

    if (user) {
      req.user = user;
      // console.log("Id of the decoded User: ", req.user);
      next();
    } else {
      return res.json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = isLogin;
