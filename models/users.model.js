const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  imageURL: {
    type: String,
    default: "blank-profile-picture.jpg",
    required: true,
  },
  role: { type: String, default: "customer" },
  createdAt: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("User", userSchema);
