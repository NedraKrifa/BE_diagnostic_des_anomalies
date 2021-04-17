const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv/config");
const usersRoute = require("./routes/api/users");
const questionsRoute = require("./routes/api/questions");
const tagsRoute = require('./routes/api/tags');
const answersRoute = require('./routes/api/answers');
const commentsRoute = require('./routes/api/comments');
const votesRoute = require('./routes/api/votes');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

io.on('connection', socket => {
  console.log(`${socket.id} connected`);
  // Join a conversation
  const { id } = socket.handshake.query;
  socket.join(id);

  // Listen for new messages
  socket.on('NEW_CHAT_MESSAGE_EVENT', (data) => {
    io.in(id).emit('NEW_CHAT_MESSAGE_EVENT', data);
  });

  // Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    socket.leave(id);
  });
})

app.use("/api/users", usersRoute);
app.use("/api/questions", questionsRoute);
app.use("/api/tags", tagsRoute);
app.use("/api/answers", answersRoute);
app.use("/api/comments", commentsRoute);
app.use("/api/votes", votesRoute);

mongoose.connect(
    process.env.DB_CONNECTION,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
    () => {
      console.log("coonected to DB!");
    }
);

const port = process.env.PORT || 5000;

http.listen(port, () => console.log(`Server started on port ${port}`));
