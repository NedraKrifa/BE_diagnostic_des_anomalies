const mongoose = require("mongoose");
const CommentSchema = mongoose.Schema({
  author: {
    _id: { type: String, required: true },
    username: { type: String, required: true },
  },
  body: {
    type: String,
    required: true,
  },
  created: {
      type: Date,
      default: Date.now,
  }
});

module.exports = mongoose.model("comments", CommentSchema);