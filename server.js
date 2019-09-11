const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

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

  //listening to 'sendMessage' call from server
  socket.on("sendMessage", clientMessage => {
    console.log(clientMessage);
    io.emit("message", clientMessage); // emiting 'message' event from server and sending 'clientMessage' data to clients
  });
});

// Start server at PORT 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running at port ${PORT}`));
