const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt_token;
    if (!token) {
      return res.status(401).send("Please Login!");
    }

    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);

    const { _id } = decodedObj;

    const user = await User.findById(_id);
    
    if (!user) {
      res.clearCookie("jwt_token");
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    if (user.isDeleted) {
      return res.status(403).send("Account is deactivated. Please reactivate.");
    }

    req.user = user;
    next();
  } catch (err) {
    // ✅ Handle expected signature and expiry issues quietly
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session invalid or expired. Please login again."
      });
    }

    // Only log unexpected server bugs (like database connection loss)
    console.error("SYSTEM AUTH ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong"
    });
  }
};

module.exports = {
  userAuth,
}; 