import Call from '../models/Call.js';

// @desc    Log a new call
// @route   POST /api/calls
// @access  Private
export const logCall = async (req, res) => {
  const { receiverId, type, status, duration } = req.body;
  if (!receiverId || !status) {
    return res.status(400).json({ message: 'Receiver ID and status are required' });
  }

  try {
    const callLog = await Call.create({
      caller: req.user._id,
      receiver: receiverId,
      type: type || 'audio',
      status,
      duration: duration || 0,
    });

    const populatedCall = await callLog.populate('caller receiver', 'username profilePicture');
    res.status(201).json(populatedCall);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Call History
// @route   GET /api/calls
// @access  Private
export const getCallHistory = async (req, res) => {
  try {
    const callLogs = await Call.find({
      $or: [{ caller: req.user._id }, { receiver: req.user._id }],
    })
      .populate('caller receiver', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json(callLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
