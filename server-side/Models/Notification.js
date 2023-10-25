const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  toUserId: String,
  fromUserId: String,
  fName: String, // You can add other properties as needed
  lName: String,
});

module.exports = mongoose.model("Notification", notificationSchema);
