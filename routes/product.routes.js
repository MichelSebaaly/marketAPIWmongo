const Product = require("../models/products.model");
const express = require("express");
const authenticate = require("../utils/authenticate");
const router = express.Router();

//GET ALL Products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Get product By Id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.send(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//ADD Product (POST)
router.post("/", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res.status(401).json({ message: "UnAuthorized" });
  }
  try {
    const result = await Product.insertOne(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//PUT Update product
router.put("/:id", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res.status(401).json({ messsage: "UnAuthorized" });
  }
  try {
    const updatedProduct = req.body;
    const result = await Product.updateOne(
      { _id: req.params.id },
      { $set: { ...updatedProduct } }
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Remove a product (DELETE)
router.delete("/:id", authenticate, async (req, res) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res.status(401).json({ messsage: "UnAuthorized" });
  }
  try {
    const result = await Product.deleteOne({ _id: req.params.id });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
