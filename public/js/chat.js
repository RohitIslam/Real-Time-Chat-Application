// Client side connection
const socket = io(); // We can access io() because of this "<script src="/socket.io/socket.io.js"></script>" script in index.html

// Elements

const $messageForm = document.querySelector("form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
// QS library used for parsing query string from browser url and destructuring username and room
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

//listening to 'message' call from client
socket.on("message", msg => {
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    userMessage: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a") // h == hour, m == minutes, a == am/pm
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", locationMsg => {
  const html = Mustache.render(locationTemplate, {
    username: locationMsg.username,
    userLocation: locationMsg.url,
    createdAt: moment(locationMsg.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });

  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", event => {
  event.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const clientMessage = event.target.elements.inputMessage.value;

  // emiting 'sendMessage' event from client and sending 'clientMessage' data to server
  // 3rd argument in the soket.emit function is a callback function which is for event acknowledgement
  socket.emit("sendMessage", clientMessage, error => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("msg delivered");
  });
});

// Getting user's location from browser
$sendLocationButton.addEventListener("click", () => {
  $sendLocationButton.setAttribute("disabled", "disabled");

  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  navigator.geolocation.getCurrentPosition(position => {
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    socket.emit("sendLocation", location, () => {
      $sendLocationButton.removeAttribute("disabled");
      console.log("Location Shared!");
    });
  });
});

socket.emit("joinRoom", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
