// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  youtubeCommentId: {
    type: String,
    unique: true,
    sparse: true
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  content: {
    type: String,
    required: true
  },
  likeCount: {
    type: Number,
    default: 0
  },
  replyCount: {
    type: Number,
    default: 0
  },
  authorDisplayName: String,
  authorProfileImageUrl: String,
  isEdited: {
    type: Boolean,
    default: false
  },
  moderationStatus: {
    type: String,
    enum: ['published', 'heldForReview', 'likelySpam', 'rejected'],
    default: 'published'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);