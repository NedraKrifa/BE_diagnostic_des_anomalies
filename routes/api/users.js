const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../../models/user");
const {
  registerValidation,
  loginValidation,
  ValidationError,
} = require("../../validation/validation");
const verify = require("../middleware/verifyToken");


router.post("/register", async (req, res) => {
  const { username, email, password, confirm_password, role } = req.body;

  //LETS VALIDATE THE DATA BEFORE WE ADD A USER
  const { error } = registerValidation({
    username,
    email,
    password,
    confirm_password,
  });
  if (error) return res.status(400).send(ValidationError(error));

  //checking if the user is already in the database
  const emailExist = await User.findOne({ email });
  if (emailExist) return res.status(400).send("Email already exists");

  //Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  //create a new user
  const user = new User({
    username,
    email,
    password: hashPassword,
    role,
  });

  try {
    const savedUser = await user.save();
    //create and assign a token
    const token = jwt.sign({ _id: savedUser._id }, process.env.TOKEN_SECRET);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  //LETS VALIDATE THE DATA BEFORE WE A USER
  const { error } = loginValidation({ username, password });
  if (error) return res.status(400).send(ValidationError(error));

  //checking if the username exists
  const user = await User.findOne({ username });
  if (!user) return res.status(400).send("username is not found");

  //PASSWORD IS CORRECT
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).send("Invalid password");

  //create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);

  try {
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

//Get user:private
router.get("/user", verify, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password");
    if (!user) return res.status(400).send("User Does not exist");
    res.json(user);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

module.exports = router;