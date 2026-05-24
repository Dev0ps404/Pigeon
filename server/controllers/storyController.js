import Story from '../models/Story.js';
import Friend from '../models/Friend.js';

// @desc    Upload / Create Story
// @route   POST /api/stories
// @access  Private
export const uploadStory = async (req, res) => {
  const { mediaUrl, mediaType, caption } = req.body;
  if (!mediaUrl) return res.status(400).json({ message: 'Media URL is required' });

  try {
    const story = await Story.create({
      user: req.user._id,
      mediaUrl,
      mediaType: mediaType || 'image',
      caption: caption || '',
    });

    const populatedStory = await story.populate('user', 'username profilePicture');
    res.status(201).json(populatedStory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Active Stories from Self & Friends
// @route   GET /api/stories
// @access  Private
export const getActiveStories = async (req, res) => {
  try {
    // 1. Get friend list
    const friends = await Friend.find({
      status: 'accepted',
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    });

    const friendIds = friends.map((f) => {
      return f.requester.toString() === req.user._id.toString() ? f.recipient : f.requester;
    });

    // Add self to query stories
    const userIds = [...friendIds, req.user._id];

    // 2. Fetch active stories
    const stories = await Story.find({ user: { $in: userIds } })
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    View / Mark Story as read
// @route   POST /api/stories/:storyId/view
// @access  Private
export const viewStory = async (req, res) => {
  const { storyId } = req.params;
  try {
    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (!story.viewers.includes(req.user._id)) {
      story.viewers.push(req.user._id);
      await story.save();
    }

    res.json({ message: 'Story marked as viewed', story });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
