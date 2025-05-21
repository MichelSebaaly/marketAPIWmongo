const Order = require("../models/orders.model");
const OrderItem = require("../models/orderItems.model");
const mongoose = require("mongoose");
const express = require("express");
const authenticate = require("../utils/authenticate");
const router = express.Router();

//orders for spec user (GET)
router.get("/", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    if (orders.length == 0) {
      return res.json({ message: "No Orders Found" });
    }
    res.send(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//all orders (GET)
router.get("/all", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res.status(401).json({ message: "UnAuthorized!" });
  }
  try {
    const orders = await Order.find();
    res.send(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Add order (POST)
router.post("/", authenticate, async (req, res) => {
  const { total_price, items } = req.body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const response = await Order.create(
      [
        {
          userId: req.user._id,
          total_price,
        },
      ],
      { session }
    );
    const orderId = response[0]._id;
    for (const item of items) {
      await OrderItem.insertOne(
        {
          order_id: orderId,
          product_id: item.product._id,
          quantity: item.quantity,
          price: item.totalPricePerItem,
        },
        { session }
      );
    }
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Order placed", orderId });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message });
  }
});

//Update order status (patch)
router.patch("/", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res.status(401).json({ message: "UnAuthorized" });
  }
  const { orderStatus, orderId } = req.body;
  try {
    const response = await Order.updateOne(
      { _id: orderId },
      { $set: { status: orderStatus } },
      { runValidators: true }
    );
    res.json({ message: "Order status updated", response });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
