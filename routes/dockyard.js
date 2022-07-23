const mongoose = require("mongoose");

let Dockyard = mongoose.Schema({
  trainName: [
    {
      name: String,
      available: { type: Boolean, default: true },
    },
  ],
  BogiesQuantity: {
    total: Number,
    assign: Number,
    available: {
      type: Number,
      default: this.total - this.assign,
    },
  },
  Motormans: [
    {
      name: String,
      available: { type: Boolean, default: true },
    },
  ],
  Assistant: [
    {
      name: String,
      available: { type: Boolean, default: true },
    },
  ],
});
module.exports = mongoose.model("dockyard", Dockyard);
