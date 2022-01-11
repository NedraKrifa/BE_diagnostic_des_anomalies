const mongoose = require("mongoose");
const QuestionSchema = mongoose.Schema({
  author: {
    _id: { type: String, required: true },
    username: { type: String, required: true },
  },
  title: {
    type: String,
    required: true,
    unique: true,
  },
  body: {
    type: String,
    required: true,
  },
  tags: [
    {
      _id: { type: String, required: true },
      name: { type: String, required: true },
    },
  ],
  answers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  ],
  vote: {
    type: Number,
    default: 0,
  },
  checked: {
    type: Boolean,
    default: false,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("questions", QuestionSchema);