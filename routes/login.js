const express = require("express");
const router = express.Router();

// * @route   POST api/login
// * @desc    Auth user and get token
// * @access  Public

router.post("/", (req, res) => {
  res.send("Log in user");
});

// * @route   GET api/login
// * @desc    Get logged in user
// * @access  Private

router.get("/", (req, res) => {
  res.send("Get logged in user");
});

module.exports = router;
