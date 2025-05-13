const express = require("express");
const cors = require("cors");
const db = require("./db");

const userRoutes = require("./routes/user.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/user", userRoutes);

db.connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`);
  });
});
