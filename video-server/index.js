const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

app.use(cors());
app.use(express.json());

const VIDEOS_DIR = path.join(__dirname, 'cached-videos');
if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR);

// ── Health ────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ok', message: 'EverSite Server', peers: peers.size }));
app.get('/health', (req, res) => res.json({ status: 'healthy', uptime: process.uptime(), peers: peers.size }));

// ── Video download ────────────────────────────────────────────
app.post('/api/download-video', async (req, res) => {
  try {
    const { videoId } = req.body;
    if (!videoId) return res.status(400).json({ success: false, error: 'Video ID required' });

    const videoPath = path.join(VIDEOS_DIR, `${videoId}.mp4`);
    if (fs.existsSync(videoPath)) return res.json({ success: true, message: 'Video already cached' });

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(videoUrl);
    const format = ytdl.chooseFormat(info.formats, { quality: 'lowest', filter: 'videoandaudio' });
    if (!format) return res.status(400).json({ success: false, error: 'No suitable format found' });

    const video = ytdl.downloadFromInfo(info, { format });
    const writeStream = fs.createWriteStream(videoPath);
    video.pipe(writeStream);
    writeStream.on('finish', () => res.json({ success: true, message: 'Downloaded successfully' }));
    video.on('error', (err) => {
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      res.status(500).json({ success: false, error: err.message });
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/video/:videoId', (req, res) => {
  const videoPath = path.join(VIDEOS_DIR, `${req.params.videoId}.mp4`);
  if (!fs.existsSync(videoPath)) return res.status(404).json({ error: 'Video not found' });

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': 'video/mp4',
    });
    fs.createReadStream(videoPath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': 'video/mp4' });
    fs.createReadStream(videoPath).pipe(res);
  }
});

// ── Socket.io — P2P signaling + voice/video rooms ─────────────
const peers = new Map();
const rooms = new Map();

io.on('connection', (socket) => {
  peers.set(socket.id, { id: socket.id, username: 'Anonymous' });
  io.emit('peer-count', peers.size);

  socket.on('register-peer', (data) => {
    peers.set(socket.id, { ...peers.get(socket.id), ...data });
    io.emit('peer-count', peers.size);
    socket.emit('peer-list', Array.from(peers.keys()).filter(id => id !== socket.id));
    socket.broadcast.emit('new-peer', socket.id);
  });

  socket.on('join-chat', (data) => {
    peers.set(socket.id, { ...peers.get(socket.id), username: data.username });
    io.emit('user-count', peers.size);
  });

  socket.on('chat-message', (data) => io.emit('chat-message', data));

  socket.on('get-peers', () => {
    socket.emit('available-peers', Array.from(peers.entries())
      .filter(([id]) => id !== socket.id)
      .map(([id, d]) => ({ id, ...d })));
  });

  // Generic WebRTC signal relay
  socket.on('signal', (data) => {
    io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
  });

  // Voice/video room signaling
  socket.on('join-room', ({ roomId, username }) => {
    if (!rooms.has(roomId)) rooms.set(roomId, new Set());
    const room = rooms.get(roomId);
    room.forEach(peerId => io.to(peerId).emit('peer-joined', { peerId: socket.id, username }));
    room.add(socket.id);
    socket.join(roomId);
    peers.set(socket.id, { ...peers.get(socket.id), username, roomId });
    socket.emit('room-peers', Array.from(room).filter(id => id !== socket.id));
  });

  socket.on('leave-room', ({ roomId }) => leaveRoom(socket, roomId));

  socket.on('call-signal', ({ to, signal, type }) => {
    io.to(to).emit('call-signal', { from: socket.id, signal, type });
  });

  socket.on('disconnect', () => {
    const peer = peers.get(socket.id);
    if (peer?.roomId) leaveRoom(socket, peer.roomId);
    peers.delete(socket.id);
    io.emit('peer-count', peers.size);
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

const PORT = process.env.PORT || 3002;
server.listen(PORT, '0.0.0.0', () => console.log(`EverSite server on port ${PORT}`));
