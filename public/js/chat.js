// Client side connection
const socket = io(); // We can access io() because of this "<script src="/socket.io/socket.io.js"></script>" script in index.html

//listening to 'message' call from client
socket.on("message", msg => console.log(msg));

document.querySelector("form").addEventListener("submit", event => {
  event.preventDefault();

  const clientMessage = event.target.elements.inputMessage.value;

  // emiting 'sendMessage' event from client and sending 'clientMessage' data to server
  // 3rd argument in the soket.emit function is a callback function which is for event acknowledgement
  socket.emit("sendMessage", clientMessage, error => {
    if (error) {
      return console.log(error);
    }
    console.log("msg delivered");
  });
});

// Getting user's location from browser
document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  navigator.geolocation.getCurrentPosition(position => {
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    socket.emit("sendLocation", location, () => {
      console.log("Location Shared!");
    });
  });
});
