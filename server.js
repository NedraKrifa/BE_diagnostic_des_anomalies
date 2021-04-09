const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv/config");
const usersRoute = require("./routes/api/users");
const questionsRoute = require("./routes/api/questions");
const tagsRoute = require('./routes/api/tags');

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
  console.log('New client connected'+ socket.id)

  socket.emit("your id", socket.id);

  socket.emit('quantity_check', 'KR');
  
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

app.use("/api/users", usersRoute);
app.use("/api/questions", questionsRoute);
app.use("/api/tags", tagsRoute);

mongoose.connect(
    process.env.DB_CONNECTION,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
    () => {
      console.log("coonected to DB!");
    }
);

const port = process.env.PORT || 5000;

http.listen(port, () => console.log(`Server started on port ${port}`));
