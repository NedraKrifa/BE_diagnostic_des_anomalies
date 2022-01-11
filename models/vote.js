const mongoose = require("mongoose");
const VoteSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  value: {
    type: Number
  }
});

module.exports = mongoose.model("votes", VoteSchema);