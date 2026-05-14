const { Server } = require('socket.io');

function initSocket(server) {

  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {

    console.log('✅ Socket connected:', socket.id);

    // JOIN ROOM
    socket.on('room:join', (roomId) => {
      socket.join(roomId);
    });

    // SEND MESSAGE
    socket.on('message:send', (message) => {

      // SEND TO ALL USERS IN ROOM
      io.to(message.roomId).emit('message:new', {
        _id: Date.now().toString(),
        room: message.roomId,
        text: message.text,
        sender: {
          _id: message.senderId || 'socket-user',
          username: message.username || 'User',
        },
        createdAt: new Date(),
      });
    });

    // TYPING START
    socket.on('typing:start', ({ roomId, username }) => {
      socket.to(roomId).emit('typing:update', {
        roomId,
        username,
        isTyping: true,
      });
    });

    // TYPING STOP
    socket.on('typing:stop', ({ roomId, username }) => {
      socket.to(roomId).emit('typing:update', {
        roomId,
        username,
        isTyping: false,
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

  });
}

module.exports = { initSocket };
