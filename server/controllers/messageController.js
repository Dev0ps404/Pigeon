import Message from '../models/Message.js';
import User from '../models/User.js';
import Chat from '../models/Chat.js';

// @desc    Get all messages
// @route   GET /api/message/:chatId
// @access  Private
export const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'username profilePicture email')
      .populate('chat');
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create new message
// @route   POST /api/message
// @access  Private
export const sendMessage = async (req, res) => {
  const { content, chatId, mediaUrl, mediaType, attachments } = req.body;

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
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate('sender', 'username profilePicture');
    message = await message.populate('chat');
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
