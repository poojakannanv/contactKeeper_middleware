const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = auth = (req, res, next) => {
  // get token from header
  const token = req.header("x-auth-token");

  // check if not token
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    req.user = decoded.user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "token is not valid" });
  }
};
