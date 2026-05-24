import Friend from '../models/Friend.js';
import User from '../models/User.js';

// @desc    Send Friend Request
// @route   POST /api/friends/request
// @access  Private
export const sendFriendRequest = async (req, res) => {
  const { recipientId } = req.body;
  if (!recipientId) return res.status(400).json({ message: 'Recipient ID required' });

  if (req.user._id.toString() === recipientId) {
    return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
  }

  try {
    const existingRelation = await Friend.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId },
        { requester: recipientId, recipient: req.user._id },
      ],
    });

    if (existingRelation) {
      return res.status(400).json({ message: 'A friend relationship or request already exists' });
    }

    const friendRequest = await Friend.create({
      requester: req.user._id,
      recipient: recipientId,
      status: 'pending',
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to Friend Request (Accept/Decline)
// @route   PUT /api/friends/respond/:requestId
// @access  Private
export const respondToFriendRequest = async (req, res) => {
  const { status } = req.body; // 'accepted' or 'declined'
  const { requestId } = req.params;

  if (!['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const request = await Friend.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (status === 'accepted') {
      request.status = 'accepted';
      await request.save();
      res.json({ message: 'Friend request accepted', request });
    } else {
      await Friend.findByIdAndDelete(requestId);
      res.json({ message: 'Friend request declined/deleted' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Friend List
// @route   GET /api/friends
// @access  Private
export const getFriends = async (req, res) => {
  try {
    const friends = await Friend.find({
      status: 'accepted',
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    })
      .populate('requester', 'username email profilePicture bio status customStatus')
      .populate('recipient', 'username email profilePicture bio status customStatus');

    const list = friends.map((f) => {
      return f.requester._id.toString() === req.user._id.toString() ? f.recipient : f.requester;
    });

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Pending Requests
// @route   GET /api/friends/pending
// @access  Private
export const getPendingRequests = async (req, res) => {
  try {
    const pending = await Friend.find({
      status: 'pending',
      recipient: req.user._id,
    }).populate('requester', 'username email profilePicture bio status customStatus');

    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove Friend / Block User
// @route   DELETE /api/friends/:friendId
// @access  Private
export const removeFriend = async (req, res) => {
  const { friendId } = req.params;
  try {
    await Friend.findOneAndDelete({
      $or: [
        { requester: req.user._id, recipient: friendId },
        { requester: friendId, recipient: req.user._id },
      ],
    });
    res.json({ message: 'Friend relationship removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
