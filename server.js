const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");

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

  socket.emit("message", "Welcome!"); // emiting 'message' event from server and sending "Welcome!" to clients

  socket.broadcast.emit("message", "A new user has joined");

  //listening to 'sendMessage' call from server
  socket.on("sendMessage", (clientMessage, callback) => {
    const filterWords = new Filter();

    if (filterWords.isProfane(clientMessage)) {
      return callback("Profanity in not allowed");
    }

    // emiting 'message' event from server and sending 'clientMessage' data to all clients
    io.emit("message", clientMessage);
    callback(); // get event acknowledgement
  });

  socket.on("sendLocation", (location, callback) => {
    io.emit(
      "message",
      `Location: https://google.com/maps?q=${location.latitude},${location.longitude}`
    );
    callback();
  });

  // Emting a 'disconnect' event when an user get disconnected
  socket.on("disconnect", () => {
    io.emit("message", "A user has left");
  });
});

// Start server at PORT 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running at port ${PORT}`));
