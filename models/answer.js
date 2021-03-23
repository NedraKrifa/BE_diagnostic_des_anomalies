const mongoose = require("mongoose");
const AnswerSchema = mongoose.Schema({
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
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  }],
  idRef: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("answers", AnswerSchema);