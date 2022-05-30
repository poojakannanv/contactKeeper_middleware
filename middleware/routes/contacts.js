const express = require("express");
const router = express.Router();
const auth = require("../authentication/auth");
// used to validate response in the server-side
const { body, validationResult } = require("express-validator");
const Contact = require("../models/Contact");

// * @route   POST api/contacts
// * @desc    Add new contact
// * @access  Private

router.post(
  "/",
  [
    auth,
    [
      body("name", "Name is required!").not().isEmpty(),
      body("email", "Email is required!").isEmail(),
      body("phone", "Phone Number is required!").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, phone, type } = req.body;

    try {
      let contact = await Contact.findOne({ phone });

      if (contact) {
        return res.status(400).json({ message: "Phone Number already exists" });
      }

      contact = new Contact({
        name,
        email,
        phone,
        type,
        user: req.user.userId,
      });

      const Newcontact = await contact.save();
      res.json(Newcontact);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// * @route   GET api/contacts
// * @desc    Get all users contacts
// * @access  Private

router.get("/", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.userId }).sort({
      name: "asc",
    });

    res.json(contacts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// * @route   GET api/contacts/:id
// * @desc    Single Contact
// * @access  Private

router.get("/:id", auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ message: "Contact not found" });

    res.json(contact);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// * @route   PUT api/contacts
// * @desc    Update contact
// * @access  Private

router.put("/:id", auth, async (req, res) => {
  const { name, email, phone, type } = req.body;

  // build contact object
  const contactFields = {};
  if (name) contactFields.name = name;
  if (email) contactFields.email = email;
  if (phone) contactFields.phone = phone;
  if (type) contactFields.type = type;

  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ message: "Contact not found" });

    // Make sure user owns contact
    // if (contact.user !== req.user.userId) {
    //   return res.status(401).json({message:"Not Authorized"})
    // }
    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        $set: contactFields,
      },
      { new: true }
    );

    res.json(contact);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// * @route   DELETE api/contacts
// * @desc    delete contact
// * @access  Private

router.delete("/:id", auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ message: "Contact not found" });

    await Contact.findByIdAndRemove(req.params.id);

    res.json({ message: "Contact Removed" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
