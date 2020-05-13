const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

//utils
const formatMessage = require("./utils/messages");
const { userJoin, getUser, userLeave, getRoomUsers } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = "ChatCord Bot";

//static
app.use(express.static(path.join(__dirname, "public")));

//run when connect
io.on("connect", (socket) => {
  socket.on("joinRoom", ({ username, room }, callback) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //welcome user
    socket.emit("message", formatMessage(botName, `Welcome to ChatCord`));
    //broadcast when user joins
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat!`)
      );

    //send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //chat message
  socket.on("chatMessage", (msg, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
    callback();
  });

  //Runs when disconnected
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left`)
      );
      //send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

//port
const port = process.env.PORT || 3000;

server.listen(port, () => console.log(`listening to ${port}`));
