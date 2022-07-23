const mongoose = require("mongoose");

let Train = mongoose.Schema({
  trainName: {
    type: String,
  },
  Bogies: {
    type: Number,
  },
  Ticket: {
    total: Number,
    assign: {
      type: Number,
      default: 0,
    },
    available: {
      type: Number,
    },
  },
  Motorman: {
    type: String,
  },
  Assistant: {
    type: String,
  },
});
module.exports = mongoose.model("Train", Train);
