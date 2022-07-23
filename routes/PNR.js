const mongoose = require("mongoose");

let PNR = mongoose.Schema({
  name: { type: String, require: true },
  email: { type: String, require: true },
  number: { type: Number, require: true },
  TrainName: { type: String, require: true },
  TicketQuantity: { type: Number, default: 1 },
  PNR: { type: Number },
});
module.exports = mongoose.model("PNR", PNR);
