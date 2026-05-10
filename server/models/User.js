const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    },

    password: { 
      type: String, 
      required: true 
    },

    status: { 
      type: String, 
      enum: ['online', 'offline'], 
      default: 'offline' 
    },

    lastSeen: { 
      type: Date, 
      default: Date.now 
    },
  },
  { timestamps: true }
);

// Performance optimization
UserSchema.index({ username: 1 });

module.exports = mongoose.model('User', UserSchema);