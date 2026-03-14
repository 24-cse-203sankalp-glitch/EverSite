const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

app.use(cors());
app.use(express.json());

const peers = new Map();   // socketId -> { username, inCall }
const rooms = new Map();   // roomId -> Set of socketIds

app.get('/', (req, res) => res.json({ status: 'online', message: 'EverSite Signaling Server', peers: peers.size }));
app.get('/health', (req, res) => res.json({ status: 'ok', peers: peers.size }));

io.on('connection', (socket) => {
  console.log(`+ connected: ${socket.id}`);
  peers.set(socket.id, { id: socket.id, username: 'Anonymous', inCall: false });
  io.emit('peer-count', peers.size);

  // ── P2P / Chat ──────────────────────────────────────────────
  socket.on('register-peer', (data) => {
    peers.set(socket.id, { ...peers.get(socket.id), ...data });
    io.emit('peer-count', peers.size);
    const otherPeers = Array.from(peers.keys()).filter(id => id !== socket.id);
    socket.emit('peer-list', otherPeers);
    socket.broadcast.emit('new-peer', socket.id);
  });

  socket.on('join-chat', (data) => {
    peers.set(socket.id, { ...peers.get(socket.id), username: data.username });
    io.emit('user-count', peers.size);
  });

  socket.on('chat-message', (data) => io.emit('chat-message', data));

  socket.on('get-peers', () => {
    const list = Array.from(peers.entries())
      .filter(([id]) => id !== socket.id)
      .map(([id, d]) => ({ id, ...d }));
    socket.emit('available-peers', list);
  });

  // ── WebRTC generic signal relay ──────────────────────────────
  socket.on('signal', (data) => {
    io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
  });

  // ── Voice / Video call signaling ─────────────────────────────
  // Join a named room (roomId = shared code both callers use)
  socket.on('join-room', ({ roomId, username }) => {
    if (!rooms.has(roomId)) rooms.set(roomId, new Set());
    const room = rooms.get(roomId);

    // Tell existing members someone joined
    room.forEach(peerId => {
      io.to(peerId).emit('peer-joined', { peerId: socket.id, username });
    });

    room.add(socket.id);
    socket.join(roomId);
    peers.set(socket.id, { ...peers.get(socket.id), username, roomId });

    // Send the new peer the list of existing members
    const existing = Array.from(room).filter(id => id !== socket.id);
    socket.emit('room-peers', existing);
    console.log(`Room ${roomId}: ${room.size} peers`);
  });

  socket.on('leave-room', ({ roomId }) => {
    leaveRoom(socket, roomId);
  });

  // WebRTC offer/answer/ice relay for calls
  socket.on('call-signal', ({ to, signal, type }) => {
    io.to(to).emit('call-signal', { from: socket.id, signal, type });
  });

  // ── Disconnect ───────────────────────────────────────────────
  socket.on('disconnect', () => {
    const peer = peers.get(socket.id);
    if (peer?.roomId) leaveRoom(socket, peer.roomId);
    peers.delete(socket.id);
    io.emit('peer-count', peers.size);
    console.log(`- disconnected: ${socket.id} | remaining: ${peers.size}`);
  });

  function leaveRoom(sock, roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    room.delete(sock.id);
    sock.to(roomId).emit('peer-left', { peerId: sock.id });
    sock.leave(roomId);
    if (room.size === 0) rooms.delete(roomId);
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`EverSite server on port ${PORT}`));
