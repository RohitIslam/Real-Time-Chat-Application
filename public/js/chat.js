// Client side connection
const socket = io(); // We can access io() because of this "<script src="/socket.io/socket.io.js"></script>" script in index.html

//listening to 'message' call from client
socket.on("message", msg => console.log(msg));

document.querySelector("form").addEventListener("submit", event => {
  event.preventDefault();

  const clientMessage = event.target.elements.inputMessage.value;

  socket.emit("sendMessage", clientMessage); // emiting 'sendMessage' event from client and sending 'clientMessage' data to server
});
