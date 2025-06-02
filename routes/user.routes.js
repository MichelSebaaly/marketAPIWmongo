const express = require("express");
const User = require("../models/users.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticate = require("../utils/authenticate");
const mongoose = require("mongoose");
const router = express.Router();
const cookieParser = require("cookie-parser");

router.use(cookieParser());

function generateTokens(user) {
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

  const refreshToken = jwt.sign(
    {
      _id: user._id,
      role: user.role,
    },
    process.env.REFRESH_SECRET_KEY,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
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
    const { accessToken, refreshToken } = generateTokens({
      role: user.role,
      _id: user._id,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      path: "/api/user/refresh",
    });
    res.send({ name: user.name, role: user.role, accessToken });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Refresh token (POST)
router.post("/refresh", (req, res) => {
  const token = req.cookies.refreshToken;
  console.log(token);
  if (!token) {
    return res.status(401).json({ message: "No token" });
  }
  jwt.verify(token, process.env.REFRESH_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    console.log(user);
    const { accessToken } = generateTokens(user);
    res.json({ accessToken });
  });
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

//Get users
router.get("/", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res.status(401).json({ message: "UnAuthorized" });
  }
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Logout (POST)
router.post("/logout", authenticate, (req, res) => {
  res.json({ message: "User logged out" });
});

module.exports = router;
