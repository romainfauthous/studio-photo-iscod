const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  action: { type: String, required: true },  // "LOGIN_SUCCESS" ou "LOGIN_FAILED"
  email: { type: String, required: true },   // email tenté
  user_id: { type: Number, default: null },  // null si login échoué
  role: { type: String, default: null },     // null si login échoué
  timestamp: { type: Date, default: Date.now },
});

const Log = mongoose.model("Log", logSchema);

module.exports = Log;