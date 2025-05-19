const express = require("express");
const User = require("../models/users.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticate = require("../utils/authenticate");
const mongoose = require("mongoose");
const router = express.Router();

function generateAccessToken(user) {
  const accessToken = jwt.sign(
    {
      _id: user._id,
      role: user.role,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "15min",
    }
  );
  return accessToken;
}

//Register (POST)
router.post("/register", async (req, res) => {
  try {
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.insertOne({
      ...req.body,
      password: hashedPassword,
    });
    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    res.json({ message: err.message });
  }
});

//Login (POST)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne(
      { email },
      { name: 1, password: 1, role: 1 }
    );
    if (!user) {
      return res.status(400).json({ message: "User does not exists" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Bad Credentials" });
    }
    const accessToken = generateAccessToken({ role: user.role, _id: user._id });
    res.send({ name: user.name, role: user.role, accessToken });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Remove User (DELETE)
router.delete("/:id", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res.status(401).json({ message: "UnAuthorized" });
  }
  try {
    const result = await User.deleteOne({ _id: req.params.id });
    res.send(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Logout (POST)
router.post("/logout", authenticate, (req, res) => {
  res.json({ message: "User logged out" });
});

module.exports = router;
