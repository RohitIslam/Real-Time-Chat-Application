const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage
} = require("./utils/messages");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./utils/users");

// Configuring server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Define path for express config
const publicDirectoryPath = path.join(__dirname, "/public");

// Setup public directory to serve
app.use(express.static(publicDirectoryPath));

// Server side connection

io.on("connection", socket => {
  console.log("Websocket connected");

  //listening to 'joinRoom' call from server
  socket.on("joinRoom", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(room);

    socket.emit("message", generateMessage("Admin", "Welcome!"), callback); // emiting 'message' event from server and sending "Welcome!" to the client

    socket.broadcast
      .to(room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );

    callback();
  });

  //listening to 'sendMessage' call from server
  socket.on("sendMessage", (clientMessage, callback) => {
    const user = getUser(socket.id);

    if (user) {
      const filterWords = new Filter();

      if (filterWords.isProfane(clientMessage)) {
        return callback("Profanity in not allowed");
      }

      // emiting 'message' event from server and sending 'clientMessage' data to all clients
      io.to(user.room).emit(
        "message",
        generateMessage(user.username, clientMessage)
      );
      callback(); // get event acknowledgement
    }
  });

  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "locationMessage",
        generateLocationMessage(
          user.username,
          `https://google.com/maps?q=${location.latitude},${location.longitude}`
        )
      );
      callback();
    }
  });

  // Emting a 'disconnect' event when an user get disconnected
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left`)
      );
    }
  });
});

// Start server at PORT 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running at port ${PORT}`));
