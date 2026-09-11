import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (!socket) {
    // In dev, connect to localhost:3001 or window.location.origin
    const serverUrl = window.location.port === '5173' ? 'http://localhost:3001' : window.location.origin;
    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
    });
  }
  return socket;
};

export const getSocket = (): Socket | null => socket;
