const express = require("express");
const User = require("../models/users.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticate = require("../utils/authenticate");
const router = express.Router();
const cookieParser = require("cookie-parser");
const upload = require("../utils/multerConfig");

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
      { name: 1, email: 1, phone: 1, imageURL: 1, password: 1, role: 1 }
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
    res.send({
      name: user.name,
      email: user.email,
      phone: user.phone,
      imageURL: user.imageURL,
      role: user.role,
      accessToken,
    });
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

//Edit Profile (PUT)
router.put("/", authenticate, async (req, res) => {
  try {
    const updateInfo = { ...req.body };
    const result = await User.updateOne(
      { _id: req.user._id },
      { $set: { ...updateInfo } }
    );
    res.json({ message: "Profile updated successfully", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Change Profile Pic (PUT)
router.put(
  "/changeImage",
  authenticate,
  upload.single("file"),
  async (req, res) => {
    try {
      const imageURL = req.file?.filename;
      console.log(imageURL);
      const result = await User.updateOne(
        { _id: req.user._id },
        { $set: { imageURL } }
      );
      res.json({ message: "Image updated successfully", imageURL });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

//Change Password (PATCH)
router.patch("/", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { password } = user;
    const { oldPassword, newPassword } = req.body;
    const match = await bcrypt.compare(oldPassword, password);
    if (!match) {
      return res.status(400).json({ message: "Enter your correct password" });
    }
    const changedPasswordHashed = await bcrypt.hash(newPassword, 10);
    const result = await User.updateOne(
      { _id: req.user._id },
      { $set: { password: changedPasswordHashed } }
    );
    res.json({ message: "Password changed successfully", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Logout (POST)
router.post("/logout", authenticate, (req, res) => {
  res.json({ message: "User logged out" });
});

module.exports = router;
