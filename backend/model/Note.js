// models/Note.js
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
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
  title: {
    type: String,
    default: 'Untitled Note'
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['improvement', 'idea', 'feedback', 'technical', 'marketing', 'general'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  tags: [String],
  dueDate: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);