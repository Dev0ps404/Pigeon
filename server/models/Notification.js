import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['message', 'friend_request', 'friend_accept', 'group_invite', 'call'], required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' }, // link to redirect to
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
