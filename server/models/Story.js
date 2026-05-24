import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    caption: { type: String, default: '' },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Story auto expires after 24 hours (86400 seconds)
    createdAt: { type: Date, default: Date.now, expires: 86400 },
  },
  { timestamps: true }
);

const Story = mongoose.model('Story', storySchema);
export default Story;
