const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./Routes/auth");
const ConversationsRoutes = require("./Routes/Conversations");
const MessagesRoutes = require("./Routes/Messages");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/User", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Use the authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/conversation", ConversationsRoutes);
app.use("/api/Message", MessagesRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
