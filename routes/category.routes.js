const Category = require("../models/categories.model");
const Product = require("../models/products.model");
const express = require("express");
const router = express.Router();

//GET ALL CATEGORIES
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({}, { name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//GET PRODUCTS BY CATEGORY
router.get("/:id/products", async (req, res) => {
  try {
    const products = await Product.find({
      category_id: req.params.id,
    });
    res.json(products);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
