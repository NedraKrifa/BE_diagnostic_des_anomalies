const mongoose = require("mongoose");
const CommentSchema = mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true,
  },
  created: {
      type: Date,
      default: Date.now,
  },
  idRef: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("comments", CommentSchema);