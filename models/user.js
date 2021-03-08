const mongoose = require("mongoose");
const data = require('../config.json');

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
      type: String,
      required: true
  },
  role: {
    type: String,
    default: data.defaultUserRole
  },
  created: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("users", UserSchema);