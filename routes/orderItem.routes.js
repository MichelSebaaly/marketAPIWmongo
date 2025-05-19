const OrderItem = require("../models/orderItems.model");
const Order = require("../models/orders.model");
const express = require("express");
const authenticate = require("../utils/authenticate");
const router = express.Router();

//GET orderItems
router.get("/", authenticate, async (req, res) => {
  try {
    const ordersForSpecUser = await Order.find({ userId: req.user._id });
    const orderIds = ordersForSpecUser.map((order) => order._id);
    const orderItems = await OrderItem.find({
      order_id: { $in: orderIds },
    });

    res.json(orderItems);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
module.exports = router;
