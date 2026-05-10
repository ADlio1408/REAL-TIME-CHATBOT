const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },

    isGroup: { 
      type: Boolean, 
      default: false 
    },

    members: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      }
    ],

    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
  },
  { timestamps: true }
);

// Performance optimization
RoomSchema.index({ members: 1 });
RoomSchema.index({ isGroup: 1 });

module.exports = mongoose.model('Room', RoomSchema);