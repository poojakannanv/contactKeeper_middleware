const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
// used to validate response in the server-side
const { body, validationResult } = require("express-validator");

const User = require("../models/User");

// * @route   POST api/regiser
// * @desc    Register a user
// * @access  Public

router.post(
  "/",
  [
    body("name", "Please enter the name").not().isEmpty(),
    body("email", "Please enter the valid email").isEmail(),
    body(
      "username",
      "Please enter the username between 5 to 10 characters"
    ).isLength({ min: 5, max: 10 }),
    body(
      "password",
      "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"
    ).isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, username, password } = req.body;

    try {
      let user = await User.findOne({ username });

      let user2 = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ message: "Username already exists" });
      }

      if (user2) {
        return res.status(400).json({ message: "email already exists" });
      }

      user === user2;

      user = new User({
        name,
        email,
        username,
        password,
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          userId: user.id,
          name,
          email,
          username,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 3600 },
        (error, token) => {
          if (error) throw error;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
