import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author: String,
  text: String,
  isAdmin: Boolean,
  isSystem: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General' },

    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'OPEN'
    },

    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },

    isAnonymous: { type: Boolean, default: false },

    submittedBy: String,

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    comments: [commentSchema]
  },
  { timestamps: true }
);

export default mongoose.model('Complaint', complaintSchema);