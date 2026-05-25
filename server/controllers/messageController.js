import Message from '../models/Message.js';
import User from '../models/User.js';
import Chat from '../models/Chat.js';

// @desc    Get all messages
// @route   GET /api/message/:chatId
// @access  Private
export const allMessages = async (req, res) => {
  try {
    // Auto-mark incoming messages in this chat as read and delivered for the active user
    await Message.updateMany(
      { chat: req.params.chatId, sender: { $ne: req.user._id }, seenBy: { $ne: req.user._id } },
      { $addToSet: { seenBy: req.user._id, deliveredTo: req.user._id } }
    );

    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'username profilePicture email')
      .populate('chat')
      .populate({
        path: 'repliedTo',
        populate: { path: 'sender', select: 'username' },
      });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create new message
// @route   POST /api/message
// @access  Private
export const sendMessage = async (req, res) => {
  const { content, chatId, mediaUrl, mediaType, attachments, repliedTo, isForwarded } = req.body;

  const hasAttachments = attachments && attachments.length > 0;
  const hasMediaUrl = !!mediaUrl;
  const hasContent = !!(content && content.trim());

  if (!hasContent && !hasMediaUrl && !hasAttachments) {
    return res.status(400).json({ message: 'Invalid data passed into request: message cannot be empty' });
  }

  let finalMessageType = 'text';
  if (hasAttachments) {
    finalMessageType = attachments[0].type;
  } else if (hasMediaUrl && mediaType && mediaType !== 'none') {
    finalMessageType = mediaType;
  }

  var newMessage = {
    sender: req.user._id,
    content: content || '',
    chat: chatId,
    mediaUrl: mediaUrl || '',
    mediaType: mediaType || 'none',
    messageType: finalMessageType,
    attachments: attachments || [],
    repliedTo: repliedTo || null,
    isForwarded: !!isForwarded,
    seenBy: [req.user._id],
    deliveredTo: [req.user._id],
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate('sender', 'username profilePicture');
    message = await message.populate('chat');
    message = await message.populate({
      path: 'repliedTo',
      populate: { path: 'sender', select: 'username' },
    });
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'username profilePicture email',
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Edit a message
// @route   PUT /api/message/:messageId
// @access  Private
export const editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to edit this message' });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate('sender', 'username profilePicture email')
      .populate('chat')
      .populate({
        path: 'repliedTo',
        populate: { path: 'sender', select: 'username' },
      });

    res.json(updatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete message for everyone
// @route   DELETE /api/message/:messageId
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this message' });
    }

    message.isDeleted = true;
    message.content = 'This message was deleted';
    message.attachments = [];
    message.mediaUrl = '';
    message.mediaType = 'none';
    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate('sender', 'username profilePicture email')
      .populate('chat')
      .populate({
        path: 'repliedTo',
        populate: { path: 'sender', select: 'username' },
      });

    res.json(updatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete message for me
// @route   POST /api/message/:messageId/delete-me
// @access  Private
export const deleteMessageForMe = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!message.deletedFor.includes(req.user._id)) {
      message.deletedFor.push(req.user._id);
      await message.save();
    }

    res.json({ success: true, messageId: message._id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Toggle emoji reaction on message
// @route   POST /api/message/:messageId/react
// @access  Private
export const toggleReaction = async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingReactionIndex > -1) {
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        // Toggle off if same emoji clicked
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        // Update to new emoji
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      // Add new reaction
      message.reactions.push({ user: req.user._id, emoji });
    }

    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate('sender', 'username profilePicture email')
      .populate('chat')
      .populate({
        path: 'repliedTo',
        populate: { path: 'sender', select: 'username' },
      });

    res.json(updatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Mark all messages in a chat as read
// @route   POST /api/message/:chatId/read
// @access  Private
export const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Message.updateMany(
      { chat: chatId, sender: { $ne: req.user._id }, seenBy: { $ne: req.user._id } },
      { $addToSet: { seenBy: req.user._id, deliveredTo: req.user._id } }
    );
    res.json({ success: true, message: 'All messages in chat marked as read' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Mark a single message as delivered
// @route   POST /api/message/:messageId/deliver
// @access  Private
export const markMessageAsDelivered = async (req, res) => {
  try {
    const { messageId } = req.params;
    await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { deliveredTo: req.user._id } }
    );
    res.json({ success: true, message: 'Message marked as delivered' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
