const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  dob: Date,
  gender: String,
  notifications: [
    {
      fName: String,
      lName: String,
      // You can add more properties to your notifications objects as needed
    },
  ],
  friendList: [
    {
      fName: String,
      lName: String,
      id: String,
      // You can add more properties to your notifications objects as needed
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
