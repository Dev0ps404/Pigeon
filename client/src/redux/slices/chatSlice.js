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
    replaceOptimisticMessage: (state, action) => {
      const { optimisticId, realMessage } = action.payload;
      const index = state.messages.findIndex((m) => m._id === optimisticId);
      if (index !== -1) {
        state.messages[index] = realMessage;
      }
    },
    updateUserPresence: (state, action) => {
      const { userId, status, lastSeen } = action.payload;
      if (state.activeChat && state.activeChat.users) {
        state.activeChat.users = state.activeChat.users.map((u) => {
          const uId = typeof u === 'object' ? u._id : u;
          if (uId === userId) {
            return typeof u === 'object' ? { ...u, status, lastSeen } : { _id: userId, status, lastSeen };
          }
          return u;
        });
      }
      state.chats = state.chats.map((chat) => {
        if (chat.users) {
          return {
            ...chat,
            users: chat.users.map((u) => {
              const uId = typeof u === 'object' ? u._id : u;
              if (uId === userId) {
                return typeof u === 'object' ? { ...u, status, lastSeen } : { _id: userId, status, lastSeen };
              }
              return u;
            }),
          };
        }
        return chat;
      });
    },
    markMessagesAsReadInList: (state, action) => {
      const { chatId, userId } = action.payload;
      state.messages = state.messages.map((m) => {
        const msgChatId = typeof m.chat === 'object' ? m.chat?._id : m.chat;
        if (msgChatId === chatId) {
          const seenBy = m.seenBy || [];
          const deliveredTo = m.deliveredTo || [];
          return {
            ...m,
            seenBy: seenBy.includes(userId) ? seenBy : [...seenBy, userId],
            deliveredTo: deliveredTo.includes(userId) ? deliveredTo : [...deliveredTo, userId],
          };
        }
        return m;
      });
    },
    markMessageAsDeliveredInList: (state, action) => {
      const { messageId, userId } = action.payload;
      state.messages = state.messages.map((m) => {
        if (m._id === messageId) {
          const deliveredTo = m.deliveredTo || [];
          return {
            ...m,
            deliveredTo: deliveredTo.includes(userId) ? deliveredTo : [...deliveredTo, userId],
          };
        }
        return m;
      });
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
  updateUserPresence,
  markMessagesAsReadInList,
  markMessageAsDeliveredInList,
  replaceOptimisticMessage,
} = chatSlice.actions;
export default chatSlice.reducer;
