const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

io.on("connection", (socket) => {
  console.log("A User Connected");

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    console.log(text, "text");
    const user = users.find((user) => user.userId === receiverId);
    console.log(user);
    io.to(user?.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  socket.on("typing", ({ receiverId, isType }) => {
    console.log(isType);
    const user = users.find((user) => user.userId === receiverId);
    console.log(user);
    io.to(user?.socketId).emit("getTyping", {
      receiverId,
      isType,
    });
  });

  socket.on("setImage", ({ senderId, receiverId, img }) => {
    const imgBase = img?.toString("base64");
    const user = users.find((user) => user.userId === receiverId);
    console.log(user?.socketId, "id");
    console.log(imgBase);
    io.to(user?.socketId).emit("getImage", {
      senderId,
      imgBase,
    });
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
