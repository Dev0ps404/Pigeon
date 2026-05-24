import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePicture: {
      type: String,
      default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    },
    coverBanner: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    customStatus: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'away', 'dnd'],
      default: 'offline',
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    premium: {
      type: Boolean,
      default: false,
    },
    readReceipts: {
      type: Boolean,
      default: true,
    },
    showPreviews: {
      type: Boolean,
      default: true,
    },
    disappearingMessages: {
      type: String,
      default: 'off',
    },
    blockedContacts: {
      type: [String],
      default: [],
    },
    aiSmartReply: {
      type: Boolean,
      default: true,
    },
    aiSummarizer: {
      type: Boolean,
      default: false,
    },
    aiToneEnhancer: {
      type: Boolean,
      default: true,
    },
    aiPersonality: {
      type: String,
      default: 'concierge',
    },
    selectedTheme: {
      type: String,
      default: 'dark',
    },
    accentColor: {
      type: String,
      default: 'indigo',
    },
    fontSize: {
      type: Number,
      default: 14,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
