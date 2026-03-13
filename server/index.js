const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

app.use(cors());
app.use(express.json());

// Store active peers
const peers = new Map();
const siteData = new Map();

io.on('connection', (socket) => {
  console.log(`✅ Peer connected: ${socket.id}`);
  
  // Immediately broadcast peer count
  io.emit('peer-count', peers.size + 1);
  
  // Register peer
  socket.on('register-peer', (data) => {
    peers.set(socket.id, {
      id: socket.id,
      hasFullSite: data.hasFullSite || false,
      chunks: data.chunks || [],
      timestamp: Date.now()
    });
    
    // Broadcast updated peer count
    io.emit('peer-count', peers.size);
    
    // Send list of all other peers to this peer
    const otherPeers = Array.from(peers.keys()).filter(id => id !== socket.id);
    socket.emit('peer-list', otherPeers);
    
    // Notify all other peers about this new peer
    socket.broadcast.emit('new-peer', socket.id);
    
    console.log(`📊 Active peers: ${peers.size}`);
  });

  // Store site data from peers
  socket.on('store-site-data', (data) => {
    siteData.set(data.chunkId, {
      data: data.content,
      peerId: socket.id,
      timestamp: Date.now()
    });
    console.log(`💾 Stored chunk: ${data.chunkId}`);
  });

  // Request site data
  socket.on('request-site-data', (chunkId) => {
    if (siteData.has(chunkId)) {
      socket.emit('site-data-response', {
        chunkId,
        content: siteData.get(chunkId).data
      });
    } else {
      // Ask other peers
      socket.broadcast.emit('request-chunk', { chunkId, requesterId: socket.id });
    }
  });

  // WebRTC signaling
  socket.on('signal', (data) => {
    io.to(data.to).emit('signal', {
      from: socket.id,
      signal: data.signal
    });
  });

  // Get available peers
  socket.on('get-peers', () => {
    const availablePeers = Array.from(peers.entries())
      .filter(([id]) => id !== socket.id)
      .map(([id, data]) => ({ id, ...data }));
    
    socket.emit('available-peers', availablePeers);
  });

  // Disconnect
  socket.on('disconnect', () => {
    peers.delete(socket.id);
    io.emit('peer-count', peers.size);
    console.log(`❌ Peer disconnected: ${socket.id} | Remaining: ${peers.size}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 EverSite Signaling Server running on port ${PORT}`);
});
