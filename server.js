import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Rooms state in memory
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);

  // Create a new room
  socket.on('create_room', (callback) => {
    const roomId = 'CD-' + Math.floor(1000 + Math.random() * 9000);
    rooms.set(roomId, {
      white: socket.id,
      black: null,
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moves: [],
    });

    socket.join(roomId);
    console.log(`[Socket] Room created: ${roomId} by ${socket.id}`);
    if (typeof callback === 'function') {
      callback({ success: true, roomId, role: 'white' });
    }
  });

  // Join existing room
  socket.on('join_room', ({ roomId }, callback) => {
    const room = rooms.get(roomId);
    if (!room) {
      if (typeof callback === 'function') {
        callback({ success: false, error: 'Oda bulunamadı!' });
      }
      return;
    }

    if (room.black && room.black !== socket.id) {
      if (typeof callback === 'function') {
        callback({ success: false, error: 'Oda dolu!' });
      }
      return;
    }

    room.black = socket.id;
    socket.join(roomId);
    console.log(`[Socket] User ${socket.id} joined room: ${roomId} as black`);

    // Notify room that opponent joined
    io.to(roomId).emit('opponent_joined', {
      white: room.white,
      black: room.black,
    });

    if (typeof callback === 'function') {
      callback({ success: true, roomId, role: 'black' });
    }
  });

  // Relay move to opponent in room
  socket.on('make_move', ({ roomId, move, fen }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.fen = fen;
      room.moves.push(move);
      socket.to(roomId).emit('opponent_move', { move, fen });
    }
  });

  // Reset game in room
  socket.on('reset_room', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      room.moves = [];
      io.to(roomId).emit('game_reset');
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
    for (const [roomId, room] of rooms.entries()) {
      if (room.white === socket.id || room.black === socket.id) {
        socket.to(roomId).emit('opponent_disconnected');
        rooms.delete(roomId);
      }
    }
  });
});

// Serve Vite build if in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[ChessDuoM Server] Running on http://localhost:${PORT}`);
});
