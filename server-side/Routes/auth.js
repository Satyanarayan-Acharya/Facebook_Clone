const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const Post = require("../Models/Post");
const Notification = require("../Models/Notification");
const multer = require("multer");

const storage = multer.memoryStorage(); // Use memory storage for file uploads
const upload = multer({ storage });

// Register route
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, dob, gender } = req.body;

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      dob,
      gender,
    });
    await newUser.save();

    // Return a success message or JWT token for further authentication
    res.json({ message: "Registration successful" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the provided password with the hashed password in the
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // const token = jwt.sign({ userId: user._id }, "1234");
    const token = jwt.sign(
      {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dob: user.dob,
        gender: user.gender,
        friendList: user.friendList,
      },
      "1234"
    );

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Use multer as middleware for handling form data
router.post("/posts", upload.single("image"), async (req, res) => {
  try {
    // Extract post data from the request body
    const postData = req.body;

    console.log(req.body, "request");
    // Access the uploaded image using req.file
    const image = req.file;

    // Check if a post with the same uniqueId already exists
    const existingPost = await Post.findOne({ uniqueId: postData.uniqueId });

    if (!existingPost) {
      // Create a new post document and save it to the database
      const newPost = new Post({
        uniqueId: postData.uniqueId,
        userId: postData?.userId,
        fName: postData?.fName,
        lName: postData?.lName,
        content: postData?.content,
        image: image?.buffer.toString("base64"), // Store the image as base64
        hashtags: postData?.hashtags,
        mentions: postData?.mentions,
        comments: [],
        likes: null,
      });
      const savedPost = await newPost.save();
      // Send a response indicating success
      res.json({ message: "Post created successfully", post: savedPost });
      // Update the existing post with new data
    } else {
      existingPost.uniqueId = postData.uniqueId || existingPost.uniqueId;
      existingPost.userId = postData?.userId || existingPost.userId;
      existingPost.fName = postData?.fName || existingPost.fName;
      existingPost.lName = postData?.lName || existingPost.lName;
      existingPost.content = postData?.content || existingPost.content;
      existingPost.image =
        image?.buffer.toString("base64") || existingPost.image; // Update the image if a new one is provided
      existingPost.hashtags = postData?.hashtags || existingPost.hashtags;
      existingPost.mentions = postData?.mentions || existingPost.mentions;
      existingPost.comments = [];
      existingPost.likes = null;
      const updatedPost = await existingPost.save();
      // Send a response indicating success and the updated post
      res.json({ message: "Post updated successfully", post: updatedPost });
    }
  } catch (error) {
    console.error("Error creating/updating post:", error);
    res.status(500).json({ message: "Error creating/updating post" });
  }
});

router.get("/getPosts", async (req, res) => {
  try {
    // Fetch all posts from the database
    const posts = await Post.find();
    console.log(posts, "[]");

    // Send the fetched posts as a response
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});
router.get("/getUsers", async (req, res) => {
  try {
    // Fetch all posts from the database
    const users = await User.find();

    // Send the fetched posts as a response
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});
router.get("/getParticularUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch all posts from the database
    const users = await User.findById(id);

    // Send the fetched posts as a response
    res.json(users);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
});

router.get("/getSendfrUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const userFrndlist = user.friendList.map((friend) => friend.id); // Extracting ids from friendList

    // Fetch users from the database
    const users = await User.find();
    const notifications = await Notification.find();
    const notificationsIds = notifications.map((notif) => notif.fromUserId);
    // Filter the users array to exclude those with ids in userFrndlist
    const filteredUsers = users.filter(
      (user) =>
        !userFrndlist.includes(user._id.toString()) &&
        !notificationsIds.includes(user._id.toString())
    );

    // Send the filtered users as a response
    res.json(filteredUsers);
  } catch (error) {
    console.error("Error fetching SendFrusers:", error);
    res.status(500).json({ message: "Error fetching SendFrusers" });
  }
});

// router.post("/sendFriendRequest/:id", async (req, res) => {
//   console.log(req);
//   const { id } = req.params; // Get the user ID from the request parameters
//   const { userData } = req.body; // Get the name from the request body

//   try {
//     // Find the user by ID and update their notifications array
//     const user = await User.findById(id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     // Push the notification object into the notifications array
//     user.notifications.push({ fName: userData.fName, lName: userData.lName });

//     // Save the updated user object
//     await user.save();

//     return res
//       .status(200)
//       .json({ message: "Friend request sent successfully" });
//   } catch (error) {
//     console.error("Error sending friend request:", error);
//     return res.status(500).json({ message: "Error sending friend request" });
//   }
// });

router.post("/sendFriendRequest/:id", async (req, res) => {
  const { id } = req.params; // Get the user ID from the request parameters
  const { userData } = req.body; // Get the name from the request body

  try {
    // Find the user by ID
    // const user = await User.findById(id);
    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // Create a new notification object
    const newNotification = new Notification({
      toUserId: id,
      fromUserId: userData.iD,
      fName: userData.fName,
      lName: userData.lName,
      // Add other notification properties as needed
    });

    // Save the new notification
    await newNotification.save();

    return res
      .status(200)
      .json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return res.status(500).json({ message: "Error sending friend request" });
  }
});

router.get("/getNotifications", async (req, res) => {
  try {
    // Fetch all posts from the database
    const notifications = await Notification.find();

    // Send the fetched posts as a response
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

router.post("/sendFriendList/:id", async (req, res) => {
  console.log(req);
  const { id } = req.params; // Get the user ID from the request parameters
  const { userData } = req.body; // Get the name from the request body

  try {
    // Find the user by ID and update their notifications array
    const userOne = await User.findById(id);

    // const userTwo = await User.findById("650017d9598cd8f80c5bdc15");
    // const userOne = await User.findOne({ name: 'John Doe' })
    const userTwo = await User.findById(userData.iD);

    if (!userOne && !userTwo) {
      return res.status(404).json({ message: "User not found" });
    }
    const filterNotifications = await Notification.findOneAndDelete({
      fromUserId: userData.iD,
    });
    // Push the notification object into the notifications array
    userOne.friendList.push({
      fName: userData.fName,
      lName: userData.lName,
      id: userTwo._id,
    });
    userTwo.friendList.push({
      fName: userOne.firstName,
      lName: userOne.lastName,
      id: userOne._id,
    });
    await userOne.save();
    await userTwo.save();

    return res.status(200).json({ message: "Friend request Accepted" });
  } catch (error) {
    console.error("Error Accepting Friend request :", error);
    return res
      .status(500)
      .json({ message: "Error Accepting Friend request :" });
  }
});

router.post("/rejectFriendList/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const filterNotifications = await Notification.findOneAndDelete({
      fromUserId: id,
    });

    return res.status(200).json({ message: "Friend request Rejected" });
  } catch (error) {
    console.error("Error rejecting Friend Request :", error);
    return res
      .status(500)
      .json({ message: "Error Rejecting Friend request :" });
  }
});

router.get("/getCurrentUser/:id", async (req, res) => {
  try {
    // Fetch all posts from the database

    const { id } = req.params;
    const user = await User.findById(id);

    // Send the fetched posts as a response
    res.json(user);
  } catch (error) {
    console.error("Error fetching currentUser:", error);
    res.status(500).json({ message: "Error fetching currentUser" });
  }
});

// Backend API Endpoint
// router.get("/postsByFriends", async (req, res) => {
//   try {
//     // Parse the friendsId array from the query parameters
//     const friendsId = JSON.parse(req.query.friendsId);

//     // Query the posts that have one of the friend IDs in their author field
//     const posts = await Post.find({ userId: { $in: friendsId } });

//     // Send the retrieved posts as a response
//     res.json(posts);
//   } catch (error) {
//     console.error("Error fetching posts by friends:", error);
//     res.status(500).json({ message: "Error fetching posts by friends" });
//   }
// });

router.get("/getPostsByFriends", async (req, res) => {
  try {
    const friendsId = req.query.friendsId; // Get the array of friend IDs from query parameters

    // Use the $in operator to find posts where userId matches any of the friend IDs
    const posts = await Post.find({ userId: { $in: friendsId } });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts by friends:", error);
    res.status(500).json({ message: "Error fetching posts by friends" });
  }
});

router.get("/getEditPost/:id", async (req, res) => {
  try {
    // Fetch all posts from the database

    const { id } = req.params;
    const post = await Post.findOne({ uniqueId: id });

    // Send the fetched posts as a response
    res.json(post);
  } catch (error) {
    console.error("Error fetching editPost:", error);
    res.status(500).json({ message: "Error fetching editPost" });
  }
});

router.get("/deletePosts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the post by its unique ID
    const deletedPost = await Post.findOneAndDelete({ uniqueId: id });

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res
      .status(200)
      .json({ message: "Post deleted successfully", deletedPost });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post" });
  }
});

router.post("/comments", async (req, res) => {
  try {
    // Extract comment data from the request body
    const cmData = req.body;

    // Find the post by uniqueId
    const post = await Post.findOne({ uniqueId: cmData.postuId });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create a new comment object
    const newComment = {
      comm: cmData.comm,
      fname: cmData.fname,
      lname: cmData.lname,
    };

    // Push the new comment into the comments array of the post
    post.comments.push(newComment);

    // Save the updated post
    await post.save();

    return res.status(200).json({ message: "Comment posted successfully" });
  } catch (error) {
    console.error("Error posting comment:", error);
    return res.status(500).json({ message: "Error posting comment" });
  }
});

router.post("/posts/:postId/like", async (req, res) => {
  const { postId } = req.params;
  const { userId, likeChange } = req.body;
  try {
    const post = await Post.findOne({ uniqueId: postId });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (!post.likes) {
      post.likes = [];
    }
    // Check if the user has already liked the post
    const existingLike = post.likes.find((like) => like.userId === userId);

    if (!existingLike) {
      // If the user hasn't liked the post, add a new like object
      post.likes.push({ userId, likeChange });
    } else {
      // If the user has already liked the post, update the likeChange value
      existingLike.likeChange = likeChange;
    }
    await post.save();

    res.status(200).json({ message: "Post liked successfully" });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Error liking post" });
  }
});

module.exports = router;
