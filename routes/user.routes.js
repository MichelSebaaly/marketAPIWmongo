const express = require("express");
const User = require("../models/users.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

function generateAccessToken(role) {
  const accessToken = jwt.sign(
    {
      role: role,
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
    const { name, password } = req.body;
    const user = await User.findOne(
      { name },
      { name: 1, password: 1, role: 1 }
    );
    if (!user) {
      return res.status(400).json({ message: "User does not exists" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Bad Credentials" });
    }
    const accessToken = generateAccessToken(user.role);
    res.json({ message: "user loggedIN", token: accessToken });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
