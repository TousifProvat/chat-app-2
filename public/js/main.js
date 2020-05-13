//elements
const $chatForm = document.getElementById("chat-form");
const $chatFormInput = $chatForm.querySelector("#msg");
const $chatFormBtn = $chatForm.querySelector(".btn");
const $chatMessages = document.querySelector(".chat-messages");
const $roomName = document.getElementById("room-name");
const $userList = document.getElementById("users");

//Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

//Join chatroom
socket.emit("joinRoom", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

//Get room and users

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//Message from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  //auto scroll
  $chatMessages.scrollTop = $chatMessages.scrollHeight;
});

//Message submit
$chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $chatFormBtn.setAttribute("disabled", "disabled");

  const msg = e.target.elements.msg.value;

  socket.emit("chatMessage", msg, (error) => {
    $chatFormBtn.removeAttribute("disabled");
    $chatFormInput.value = "";
    $chatFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log("Message was delivered!");
  });
});

//output message  to dom
const outputMessage = (message) => {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.innerHTML = `<p class="meta"> ${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;

  document.querySelector(".chat-messages").appendChild(messageDiv);
};

//Add room name to dom
const outputRoomName = (room) => {
  $roomName.innerText = room;
};

//Add users to dom
const outputUsers = (users) => {
  $userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
};
