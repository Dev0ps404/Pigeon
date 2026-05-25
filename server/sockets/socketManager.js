// In-memory set to track online users in real-time
const activeUsers = new Map();

export const socketManager = (io) => {
  io.on('connection', (socket) => {
    console.log('Connected to socket.io');

    socket.on('setup', (userData) => {
      if (!userData || !userData._id) return;
      socket.join(userData._id);
      
      // Track user as online
      activeUsers.set(userData._id, socket.id);
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
        const userId = typeof user === 'object' ? user._id : user;
        if (userId == newMessageRecieved.sender._id) return;

        socket.in(userId).emit('message recieved', newMessageRecieved);
      });
    });

    socket.on('edit message', (editedMessage) => {
      const chat = editedMessage.chat;
      if (!chat || !chat.users) return;
      chat.users.forEach((user) => {
        const userId = typeof user === 'object' ? user._id : user;
        if (userId == editedMessage.sender._id) return;
        socket.in(userId).emit('message edited', editedMessage);
      });
    });

    socket.on('delete message', (deletedMessage) => {
      const chat = deletedMessage.chat;
      if (!chat || !chat.users) return;
      chat.users.forEach((user) => {
        const userId = typeof user === 'object' ? user._id : user;
        if (userId == deletedMessage.sender._id) return;
        socket.in(userId).emit('message deleted', deletedMessage);
      });
    });

    socket.on('message reaction', (reactedMessage) => {
      const chat = reactedMessage.chat;
      if (!chat || !chat.users) return;
      chat.users.forEach((user) => {
        const userId = typeof user === 'object' ? user._id : user;
        socket.in(userId).emit('message reacted', reactedMessage);
      });
    });

    // --- WebRTC Signaling Events ---
    socket.on('call-user', ({ userToCall, signalData, from, callerName }) => {
      const receiverSocket = activeUsers.get(userToCall);
      if (receiverSocket) {
        io.to(receiverSocket).emit('incoming-call', {
          signal: signalData,
          from,
          callerName,
        });
      }
    });

    socket.on('answer-call', ({ to, signal }) => {
      const callerSocket = activeUsers.get(to);
      if (callerSocket) {
        io.to(callerSocket).emit('call-accepted', signal);
      }
    });

    socket.on('decline-call', ({ to }) => {
      const callerSocket = activeUsers.get(to);
      if (callerSocket) {
        io.to(callerSocket).emit('call-declined');
      }
    });

    socket.on('end-call', ({ to }) => {
      const userSocket = activeUsers.get(to);
      if (userSocket) {
        io.to(userSocket).emit('call-ended');
      }
    });

    socket.on('ice-candidate', ({ to, candidate, from }) => {
      const targetSocket = activeUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit('ice-candidate', { candidate, from });
      }
    });

    // --- Realtime Notifications ---
    socket.on('send-notification', ({ receiverId, notification }) => {
      const receiverSocket = activeUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit('notification-received', notification);
      }
    });

    socket.on('disconnect', () => {
      let disconnectedUserId = null;
      for (let [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          activeUsers.delete(userId);
          break;
        }
      }
      if (disconnectedUserId) {
        io.emit('online-users-list', Array.from(activeUsers.keys()));
      }
      console.log('USER DISCONNECTED');
    });
  });
};
