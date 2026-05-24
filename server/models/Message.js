import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { 
      type: String, 
      default: '',
      required: function() {
        const hasMedia = !!this.mediaUrl;
        const hasAttachments = this.attachments && this.attachments.length > 0;
        return !hasMedia && !hasAttachments;
      }
    },
    mediaUrl: { type: String, default: '' },
    mediaType: { type: String, enum: ['none', 'image', 'video', 'file', 'audio'], default: 'none' },
    messageType: { 
      type: String, 
      enum: ['text', 'image', 'video', 'file', 'audio'], 
      default: 'text' 
    },
    attachments: [
      {
        id: { type: String, default: '' },
        url: { type: String, required: true },
        public_id: { type: String, default: '' },
        type: { type: String, enum: ['image', 'video', 'file', 'audio'], required: true },
        fileName: { type: String, required: true },
        size: { type: Number, default: 0 },
      }
    ],
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    repliedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
