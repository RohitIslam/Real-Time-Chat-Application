// Client side connection
const socket = io(); // We can access io() because of this "<script src="/socket.io/socket.io.js"></script>" script in index.html

socket.on("countUpdated", count => {
  console.log("The count has been updated: ", count);
});

document.querySelector("#increment").addEventListener("click", () => {
  console.log("Clicked");

  socket.emit("increment");
});
