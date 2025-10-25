const mongoose = require('mongoose');

const TempVoiceChannelSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true
  },
  channelId: {
    type: String,
    required: true,
    unique: true
  },
  ownerId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  settings: {
    userLimit: {
      type: Number,
      default: 0
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    allowedUsers: {
      type: [String],
      default: []
    },
    blockedUsers: {
      type: [String],
      default: []
    }
  }
});

module.exports = mongoose.model('TempVoiceChannel', TempVoiceChannelSchema); 