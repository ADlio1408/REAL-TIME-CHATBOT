import { io } from 'socket.io-client';
import { API_URL } from './api';

let socket;

export function connectSocket(token) {
  if (socket) {
    socket.disconnect();
  }

  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function getSocket() {
  return socket;
}
