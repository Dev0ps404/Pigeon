import { io } from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_API_URL || 'http://localhost:5001';
let socket;

export const initiateSocketConnection = () => {
  socket = io(ENDPOINT, {
    withCredentials: true,
  });
  console.log(`Connecting socket...`);
  return socket;
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const getSocket = () => socket;
