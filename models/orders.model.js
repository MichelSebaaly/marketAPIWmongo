const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  total_price: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ["Order Placed", "Processing", "On Its Way", "Delivered"],
    default: "Order Placed",
    required: true,
  },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Order", orderSchema);
