import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [],
  activeChat: null,
  messages: [],
  onlineUsers: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    updateMessageInList: (state, action) => {
      const index = state.messages.findIndex((m) => m._id === action.payload._id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    removeMessageFromList: (state, action) => {
      state.messages = state.messages.filter((m) => m._id !== action.payload);
    },
  },
});

export const {
  setChats,
  setActiveChat,
  setMessages,
  addMessage,
  setOnlineUsers,
  updateMessageInList,
  removeMessageFromList,
} = chatSlice.actions;
export default chatSlice.reducer;
