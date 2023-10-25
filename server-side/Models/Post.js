const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  likeChange: {
    type: Boolean,
    required: true,
  },
});

const postSchema = new mongoose.Schema({
  uniqueId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  fName: {
    type: String,
    required: true,
  },
  lName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String, // You can use String to store the URL of the image file
    default: null, // Default to null if no image is provided
  },
  hashtags: [
    {
      type: String,
    },
  ],
  mentions: [
    {
      type: String,
    },
  ],
  comments: [
    {
      comm: {
        type: String,
        required: true,
      },
      fname: {
        type: String, // Assuming you store the user's ID or username here
      },
      lname: {
        type: String, // Assuming you store the user's ID or username here
      },
    },
  ],
  likes: [
    {
      userId: {
        type: String,
      },
      likeChange: {
        type: Boolean,
        required: true,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", postSchema);
