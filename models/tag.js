const mongoose = require("mongoose");

const TagSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  questioNumber: {
    type: Number,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("tags", TagSchema);