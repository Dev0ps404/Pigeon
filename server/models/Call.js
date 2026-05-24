import mongoose from 'mongoose';

const callSchema = new mongoose.Schema(
  {
    caller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['audio', 'video'], default: 'audio' },
    status: { type: String, enum: ['missed', 'completed', 'rejected', 'no-answer'], required: true },
    duration: { type: Number, default: 0 }, // in seconds
  },
  { timestamps: true }
);

const Call = mongoose.model('Call', callSchema);
export default Call;
