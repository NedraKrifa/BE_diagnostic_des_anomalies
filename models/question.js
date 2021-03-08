const mongoose = require("mongoose");
const QuestionSchema = mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
    required: true,
  }],
  created: {
      type: Date,
      default: Date.now,
  }
});

module.exports = mongoose.model("questions", QuestionSchema);