const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
// used to validate response in the server-side
const { body, validationResult } = require("express-validator");
const User = require("../modules/User");
// * @route   POST api/login
// * @desc    Auth user and get token
// * @access  Public
router.post(
  "/",
  [
    body("username", "please enter the username!").exists(),
    body("password", "please enter the password").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    try {
      let user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }
      const payload = {
        user: {
          userId: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 3600 },
        (error, token) => {
          if (error) throw error;
          res.json({ token, userId: user.id });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send("server error");
    }
  }
);
// * @route   GET api/login
// * @desc    Get logged in user
// * @access  Private
router.get("/", (req, res) => {
  res.send("Get logged in user");
});
module.exports = router;
