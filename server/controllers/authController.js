import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google Auth
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      // Create a user with a random password since they login with google
      const randomPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      user = await User.create({
        username:
          name.replace(/\s+/g, "").toLowerCase() +
          Math.random().toString(36).slice(-4),
        email,
        password: randomPassword,
        profilePicture: picture,
      });
    } else if (
      picture &&
      user.profilePicture ===
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    ) {
      user.profilePicture = picture;
      await user.save();
    }

    const token = generateToken(res, user._id);
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      customStatus: user.customStatus,
      status: user.status,
      phoneNumber: user.phoneNumber,
      premium: user.premium,
      readReceipts: user.readReceipts,
      showPreviews: user.showPreviews,
      disappearingMessages: user.disappearingMessages,
      blockedContacts: user.blockedContacts,
      aiSmartReply: user.aiSmartReply,
      aiSummarizer: user.aiSummarizer,
      aiToneEnhancer: user.aiToneEnhancer,
      aiPersonality: user.aiPersonality,
      selectedTheme: user.selectedTheme,
      accentColor: user.accentColor,
      fontSize: user.fontSize,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Google Auth failed" });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      const token = generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        customStatus: user.customStatus,
        status: user.status,
        phoneNumber: user.phoneNumber,
        premium: user.premium,
        readReceipts: user.readReceipts,
        showPreviews: user.showPreviews,
        disappearingMessages: user.disappearingMessages,
        blockedContacts: user.blockedContacts,
        aiSmartReply: user.aiSmartReply,
        aiSummarizer: user.aiSummarizer,
        aiToneEnhancer: user.aiToneEnhancer,
        aiPersonality: user.aiPersonality,
        selectedTheme: user.selectedTheme,
        accentColor: user.accentColor,
        fontSize: user.fontSize,
        token,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(res, user._id);
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        customStatus: user.customStatus,
        status: user.status,
        phoneNumber: user.phoneNumber,
        premium: user.premium,
        readReceipts: user.readReceipts,
        showPreviews: user.showPreviews,
        disappearingMessages: user.disappearingMessages,
        blockedContacts: user.blockedContacts,
        aiSmartReply: user.aiSmartReply,
        aiSummarizer: user.aiSummarizer,
        aiToneEnhancer: user.aiToneEnhancer,
        aiPersonality: user.aiPersonality,
        selectedTheme: user.selectedTheme,
        accentColor: user.accentColor,
        fontSize: user.fontSize,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.profilePicture = req.body.profilePicture || user.profilePicture;
      user.coverBanner = req.body.coverBanner || user.coverBanner;
      user.customStatus =
        req.body.customStatus !== undefined
          ? req.body.customStatus
          : user.customStatus;
      user.status = req.body.status || user.status;

      user.phoneNumber =
        req.body.phoneNumber !== undefined
          ? req.body.phoneNumber
          : user.phoneNumber;
      user.premium =
        req.body.premium !== undefined ? req.body.premium : user.premium;
      user.readReceipts =
        req.body.readReceipts !== undefined
          ? req.body.readReceipts
          : user.readReceipts;
      user.showPreviews =
        req.body.showPreviews !== undefined
          ? req.body.showPreviews
          : user.showPreviews;
      user.disappearingMessages =
        req.body.disappearingMessages !== undefined
          ? req.body.disappearingMessages
          : user.disappearingMessages;
      user.blockedContacts =
        req.body.blockedContacts !== undefined
          ? req.body.blockedContacts
          : user.blockedContacts;
      user.aiSmartReply =
        req.body.aiSmartReply !== undefined
          ? req.body.aiSmartReply
          : user.aiSmartReply;
      user.aiSummarizer =
        req.body.aiSummarizer !== undefined
          ? req.body.aiSummarizer
          : user.aiSummarizer;
      user.aiToneEnhancer =
        req.body.aiToneEnhancer !== undefined
          ? req.body.aiToneEnhancer
          : user.aiToneEnhancer;
      user.aiPersonality = req.body.aiPersonality || user.aiPersonality;
      user.selectedTheme = req.body.selectedTheme || user.selectedTheme;
      user.accentColor = req.body.accentColor || user.accentColor;
      user.fontSize =
        req.body.fontSize !== undefined ? req.body.fontSize : user.fontSize;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio,
        coverBanner: updatedUser.coverBanner,
        customStatus: updatedUser.customStatus,
        status: updatedUser.status,
        phoneNumber: updatedUser.phoneNumber,
        premium: updatedUser.premium,
        readReceipts: updatedUser.readReceipts,
        showPreviews: updatedUser.showPreviews,
        disappearingMessages: updatedUser.disappearingMessages,
        blockedContacts: updatedUser.blockedContacts,
        aiSmartReply: updatedUser.aiSmartReply,
        aiSummarizer: updatedUser.aiSummarizer,
        aiToneEnhancer: updatedUser.aiToneEnhancer,
        aiPersonality: updatedUser.aiPersonality,
        selectedTheme: updatedUser.selectedTheme,
        accentColor: updatedUser.accentColor,
        fontSize: updatedUser.fontSize,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Search users
// @route   GET /api/auth/search?search=...
// @access  Private
export const searchUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { username: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword)
    .find({ _id: { $ne: req.user._id } })
    .select("-password");
  res.json(users);
};

// @desc    Forgot Password (Mock logic returning success/reset message)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(404)
      .json({ message: "User with this email does not exist" });
  }
  // In real production we send email with temporary reset token, here we simulate reset successfully
  res.json({
    message: `Password reset instructions sent to ${email} (simulated)`,
  });
};
