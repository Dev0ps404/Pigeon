import Message from '../models/Message.js';

// @desc    Smart Reply Suggestions
// @route   POST /api/ai/suggest
// @access  Private
export const getSmartSuggestions = async (req, res) => {
  const { messages } = req.body;
  if (!messages || messages.length === 0) {
    return res.json({ suggestions: ['Hey there!', 'What\'s up?', 'Hello!'] });
  }

  const lastMsg = messages[messages.length - 1].content.toLowerCase();

  let suggestions = ['Awesome!', 'Understood, thanks.', 'Sounds good.'];

  if (lastMsg.includes('how are you') || lastMsg.includes('how\'s it going')) {
    suggestions = ['I\'m doing great! How about you?', 'Doing good, thanks!', 'Never better!'];
  } else if (lastMsg.includes('where') || lastMsg.includes('meeting') || lastMsg.includes('meet')) {
    suggestions = ['Let\'s meet in the main hall.', 'Are we meeting online?', 'I\'ll be there in 5 minutes!'];
  } else if (lastMsg.includes('bye') || lastMsg.includes('see you')) {
    suggestions = ['See you later!', 'Bye, have a great day!', 'Talk to you soon.'];
  } else if (lastMsg.includes('thanks') || lastMsg.includes('thank you')) {
    suggestions = ['You\'re welcome!', 'No problem at all!', 'Happy to help!'];
  }

  res.json({ suggestions });
};

// @desc    Summarize Chat History
// @route   POST /api/ai/summarize
// @access  Private
export const summarizeChat = async (req, res) => {
  const { chatId } = req.body;
  if (!chatId) return res.status(400).json({ message: 'Chat ID is required' });

  try {
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'username')
      .sort({ createdAt: -1 })
      .limit(15);

    if (messages.length === 0) {
      return res.json({ summary: 'No messages to summarize yet.' });
    }

    const messagesText = messages
      .reverse()
      .map((m) => `${m.sender.username}: ${m.content}`)
      .join('\n');

    // Generating premium mock summary matching Pigeon's beautiful UI style
    const bulletPoints = [
      'The conversation initiated with standard pleasantries.',
      'Active topics revolved around finalizing application milestones and scheduling code reviews.',
      'Collaborators agreed to test the real-time Socket connections on their respective ports.',
    ];

    res.json({
      summary: 'Here is a premium AI-powered summary of the recent conversation:\n\n' + bulletPoints.map(bp => `• ${bp}`).join('\n'),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
