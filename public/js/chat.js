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

// AUTO-SCROLL

const autoscroll = () => {
  // [Step - 1] Getting new message element
  const $newMessage = $messages.lastElementChild;

  // [Step - 2] Getting the height of the new message
  const newMessageStyles = getComputedStyle($newMessage); // getting styles for a new message from Style.css
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin; //offsetHeight === height without margin

  // [Step - 3] Getting the visible height
  const visibleHeight = $messages.offsetHeight;

  // [Step - 4] Getting the messages container height
  const containerHeight = $messages.scrollHeight; // scrollHeight gives us the total height we are able to scroll through

  // [Step - 5] Getting the value of how far down I have scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight; // scrollTop gives us as a number the amount of distance we have scrolled from the top

  // [Final Step] making sure that users were indeed at the bottom before the new message was added
  if (containerHeight - newMessageHeight <= scrollOffset) {
    // pushing scroller at the bottom
    $messages.scrollTop = $messages.scrollHeight;
  }
};

//listening to 'message' call from client
socket.on("message", msg => {
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    userMessage: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a") // h == hour, m == minutes, a == am/pm
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", locationMsg => {
  const html = Mustache.render(locationTemplate, {
    username: locationMsg.username,
    userLocation: locationMsg.url,
    createdAt: moment(locationMsg.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
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
