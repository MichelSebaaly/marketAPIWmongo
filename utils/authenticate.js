const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "UnAuthorized!!" });
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token is not valid!!" });
    }
    decoded._id = mongoose.Types.ObjectId.createFromHexString(decoded._id);
    req.user = decoded;
    next();
  });
};

module.exports = authenticate;
