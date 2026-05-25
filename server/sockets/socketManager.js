import User from '../models/User.js';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';

// In-memory set to track online users and their active socket IDs in real-time
// Maps: userId (string) -> Set of active socket.id (strings)
const activeUsers = new Map();

export const socketManager = (io) => {
  io.on('connection', (socket) => {
    console.log('Connected to socket.io');

    socket.on('setup', async (userData) => {
      if (!userData || !userData._id) return;
      
      const userId = userData._id.toString();
      socket.join(userId);
      
      // Track socket in user's active sockets set
      if (!activeUsers.has(userId)) {
        activeUsers.set(userId, new Set());
      }
      activeUsers.get(userId).add(socket.id);
      
      // Update database status to 'online' if transitioning from offline
      try {
        await User.findByIdAndUpdate(userId, { status: 'online' });
        io.emit('presence-change', { userId, status: 'online' });
        
        // Dynamic receipts: auto-mark messages in user's chats as delivered
        const userChats = await Chat.find({ users: userId });
        const userChatIds = userChats.map((c) => c._id);
        
        await Message.updateMany(
          { 
            chat: { $in: userChatIds }, 
            sender: { $ne: userId }, 
            deliveredTo: { $ne: userId } 
          },
          { $addToSet: { deliveredTo: userId } }
        );
      } catch (err) {
        console.error('Socket setup database sync error:', err);
      }
      
      io.emit('online-users-list', Array.from(activeUsers.keys()));
      socket.emit('connected');
    });

    socket.on('join chat', (room) => {
      socket.join(room);
      console.log('User Joined Room: ' + room);
    });

    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

    socket.on('new message', (newMessageRecieved) => {
      const chat = newMessageRecieved.chat;
      if (!chat.users) return console.log('chat.users not defined');

      chat.users.forEach((user) => {
        const userId = typeof user === 'object' ? user._id.toString() : user.toString();
        if (userId === newMessageRecieved.sender._id.toString()) return;

        socket.in(userId).emit('message recieved', newMessageRecieved);
      });
    });

    socket.on('edit message', (editedMessage) => {
      const chat = editedMessage.chat;
      if (!chat || !chat.users) return;
      chat.users.forEach((user) => {
        const userId = typeof user === 'object' ? user._id.toString() : user.toString();
        if (userId === editedMessage.sender._id.toString()) return;
        socket.in(userId).emit('message edited', editedMessage);
      });
    });

    socket.on('delete message', (deletedMessage) => {
      const chat = deletedMessage.chat;
      if (!chat || !chat.users) return;
      chat.users.forEach((user) => {
        const userId = typeof user === 'object' ? user._id.toString() : user.toString();
        if (userId === deletedMessage.sender._id.toString()) return;
        socket.in(userId).emit('message deleted', deletedMessage);
      });
    });

    socket.on('message reaction', (reactedMessage) => {
      const chat = reactedMessage.chat;
      if (!chat || !chat.users) return;
      chat.users.forEach((user) => {
        const userId = typeof user === 'object' ? user._id.toString() : user.toString();
        socket.in(userId).emit('message reacted', reactedMessage);
      });
    });

    // --- Message Delivery & Read Receipts Events ---
    socket.on('mark-read', async ({ chatId, userId }) => {
      if (!chatId || !userId) return;
      try {
        await Message.updateMany(
          { chat: chatId, sender: { $ne: userId }, seenBy: { $ne: userId } },
          { $addToSet: { seenBy: userId, deliveredTo: userId } }
        );
        
        const chat = await Chat.findById(chatId);
        if (chat && chat.users) {
          chat.users.forEach((user) => {
            const participantId = typeof user === 'object' ? user._id.toString() : user.toString();
            if (participantId !== userId.toString()) {
              io.to(participantId).emit('messages-read', { chatId, userId });
            }
          });
        }
      } catch (err) {
        console.error('Socket mark-read error:', err);
      }
    });

    socket.on('mark-delivered', async ({ messageId, chatId, userId }) => {
      if (!messageId || !userId) return;
      try {
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { deliveredTo: userId }
        });
        
        const chat = await Chat.findById(chatId);
        if (chat && chat.users) {
          chat.users.forEach((user) => {
            const participantId = typeof user === 'object' ? user._id.toString() : user.toString();
            if (participantId !== userId.toString()) {
              io.to(participantId).emit('message-delivered', { messageId, chatId, userId });
            }
          });
        }
      } catch (err) {
        console.error('Socket mark-delivered error:', err);
      }
    });

    // --- Dynamic Presence & Activity Updates ---
    socket.on('user-active', async ({ userId }) => {
      if (!userId) return;
      try {
        await User.findByIdAndUpdate(userId, { status: 'online', lastSeen: new Date() });
        io.emit('presence-change', { userId, status: 'online', lastSeen: new Date() });
      } catch (err) {
        console.error('Socket user-active error:', err);
      }
    });

    // --- WebRTC Signaling Events (Multi-Device Broadcast Support) ---
    socket.on('call-user', ({ userToCall, signalData, from, callerName }) => {
      const receiverSockets = activeUsers.get(userToCall.toString());
      if (receiverSockets) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit('incoming-call', {
            signal: signalData,
            from,
            callerName,
          });
        });
      }
    });

    socket.on('answer-call', ({ to, signal }) => {
      const callerSockets = activeUsers.get(to.toString());
      if (callerSockets) {
        callerSockets.forEach((socketId) => {
          io.to(socketId).emit('call-accepted', signal);
        });
      }
    });

    socket.on('decline-call', ({ to }) => {
      const callerSockets = activeUsers.get(to.toString());
      if (callerSockets) {
        callerSockets.forEach((socketId) => {
          io.to(socketId).emit('call-declined');
        });
      }
    });

    socket.on('end-call', ({ to }) => {
      const userSockets = activeUsers.get(to.toString());
      if (userSockets) {
        userSockets.forEach((socketId) => {
          io.to(socketId).emit('call-ended');
        });
      }
    });

    socket.on('ice-candidate', ({ to, candidate, from }) => {
      const targetSockets = activeUsers.get(to.toString());
      if (targetSockets) {
        targetSockets.forEach((socketId) => {
          io.to(socketId).emit('ice-candidate', { candidate, from });
        });
      }
    });

    // --- Realtime Notifications ---
    socket.on('send-notification', ({ receiverId, notification }) => {
      const receiverSockets = activeUsers.get(receiverId.toString());
      if (receiverSockets) {
        receiverSockets.forEach((socketId) => {
          io.to(socketId).emit('notification-received', notification);
        });
      }
    });

    socket.on('disconnect', async () => {
      let disconnectedUserId = null;
      
      for (let [userId, socketIds] of activeUsers.entries()) {
        if (socketIds.has(socket.id)) {
          socketIds.delete(socket.id);
          if (socketIds.size === 0) {
            disconnectedUserId = userId;
            activeUsers.delete(userId);
          }
          break;
        }
      }
      
      if (disconnectedUserId) {
        try {
          const lastSeenTime = new Date();
          await User.findByIdAndUpdate(disconnectedUserId, { 
            status: 'offline', 
            lastSeen: lastSeenTime 
          });
          io.emit('presence-change', { 
            userId: disconnectedUserId, 
            status: 'offline', 
            lastSeen: lastSeenTime 
          });
        } catch (err) {
          console.error('Socket disconnect database sync error:', err);
        }
        
        io.emit('online-users-list', Array.from(activeUsers.keys()));
      }
      console.log('USER DISCONNECTED');
    });
  });
};
