const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/gazick", () => {
  console.log("object");
});
let user = mongoose.Schema({
  name: { type: String, require: true },
  GoogleId: { type: String, default: null },
  email: { type: String, require: true, unique: true },
  password: { type: String, default: null },
  number: { type: Number, default: null },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  Tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "PNR" }],
});
module.exports = mongoose.model("user", user);
