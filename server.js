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

// server (emit event) -> client (recieve) - countUpdated
// client (emit event) -> server (recieve) - increment

let count = 0;

// Server side connection

io.on("connection", socket => {
  console.log("Websocket connected");

  socket.emit("countUpdated", count);

  socket.on("increment", () => {
    count++;
    io.emit("countUpdated", count);
  });
});

// Start server at PORT 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running at port ${PORT}`));
