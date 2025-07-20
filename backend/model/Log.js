const mongoose = require('mongoose');
const LogSchema = new mongoose.Schema({
  event: String,
  timestamp: { type: Date, default: Date.now },
  details: Object
});
module.exports = mongoose.model('Log', LogSchema);
