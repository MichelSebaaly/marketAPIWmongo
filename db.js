const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.URI);
    console.log("Connected to mongoDB");
  } catch (err) {
    console.error(err.message);
  }
}

module.exports = { connectDB };
