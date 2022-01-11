const mongoose = require("mongoose");
const AnswerSchema = mongoose.Schema({
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
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  }],
  vote: {
    type: Number,
    default: 0,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  checked: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model("answers", AnswerSchema);