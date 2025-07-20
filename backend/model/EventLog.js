// models/EventLog.js
const mongoose = require('mongoose');

const eventLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'video_sync', 'video_update', 'video_delete',
      'comment_create', 'comment_update', 'comment_delete', 'comment_reply',
      'note_create', 'note_update', 'note_delete',
      'auth_login', 'auth_logout', 'auth_refresh'
    ]
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['video', 'comment', 'note', 'user']
  },
  resourceId: String,
  action: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referer: String,
    sessionId: String
  },
  success: {
    type: Boolean,
    default: true
  },
  error: String
}, {
  timestamps: true
});

// Index for efficient querying
eventLogSchema.index({ userId: 1, createdAt: -1 });
eventLogSchema.index({ eventType: 1, createdAt: -1 });
eventLogSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('EventLog', eventLogSchema);