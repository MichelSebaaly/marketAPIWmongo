const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.token.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "UnAuthorized!!" });
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token is not valid!!" });
    }
    req.role = decoded;
    next();
  });
};

module.exports = authenticate;
