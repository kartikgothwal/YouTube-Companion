// models/Video.js
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  youtubeVideoId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  thumbnails: {
    default: String,
    medium: String,
    high: String,
    standard: String,
    maxres: String
  },
  duration: String,
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  privacyStatus: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'unlisted'
  },
  publishedAt: Date,
  tags: [String],
  categoryId: String,
  defaultLanguage: String,
  lastSyncedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Video', videoSchema);