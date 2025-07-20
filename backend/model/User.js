// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  profilePicture: String,
  accessToken: String,
  refreshToken: String,
  channelId: String,
  channelTitle: String
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);