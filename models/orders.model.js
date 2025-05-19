const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  total_price: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    default: "Order Placed",
    enum: ["Order Placed", "Processing", "On Its Way", "Delivered"],
  },
  address: { type: String },
  createdAt: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Order", orderSchema);
