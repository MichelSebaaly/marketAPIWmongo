const express = require("express");
const cors = require("cors");
const db = require("./db");

const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");
const orderItemRoutes = require("./routes/orderItem.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin || "*");
    },
    credentials: true,
  })
);
app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/orderItem", orderItemRoutes);

db.connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`);
  });
});
