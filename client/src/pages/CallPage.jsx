import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Copy, Check, Users } from 'lucide-react';
import { io } from 'socket.io-client';

const SIGNAL_SERVER = import.meta.env.VITE_SIGNALING_SERVER || 'http://localhost:3001';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ]
};

export default function CallPage({ darkMode }) {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState(() => localStorage.getItem('eversite-username') || 'User');
  const [inRoom, setInRoom] = useState(false);
  const [peers, setPeers] = useState([]);   // [{ peerId, username, stream }]
  const [localStream, setLocalStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [callMode, setCallMode] = useState('video'); // 'video' | 'voice'
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | joining | connected | error
  const [errorMsg, setErrorMsg] = useState('');

  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const pcsRef = useRef({});   // peerId -> RTCPeerConnection
  const pendingCandidates = useRef({}); // peerId -> [candidates]

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, []);

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  function cleanup() {
    Object.values(pcsRef.current).forEach(pc => pc.close());
    pcsRef.current = {};
    if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
    if (localStream) localStream.getTracks().forEach(t => t.stop());
  }

  async function joinRoom() {
    if (!roomId.trim()) return;
    setStatus('joining');
    setErrorMsg('');

    try {
      const constraints = callMode === 'video'
        ? { video: true, audio: true }
        : { video: false, audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      const socket = io(SIGNAL_SERVER, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join-room', { roomId: roomId.trim(), username });
        setInRoom(true);
        setStatus('connected');
      });

      socket.on('connect_error', () => {
        setStatus('error');
        setErrorMsg('Cannot reach signaling server. Check your connection.');
      });

      // Existing peers in room — initiate call to each
      socket.on('room-peers', async (existingPeers) => {
        for (const peerId of existingPeers) {
          await createPeerConnection(peerId, stream, socket, true);
        }
      });

      // New peer joined — they will initiate to us
      socket.on('peer-joined', async ({ peerId, username: peerName }) => {
        setPeers(prev => [...prev.filter(p => p.peerId !== peerId), { peerId, username: peerName, stream: null }]);
        await createPeerConnection(peerId, stream, socket, false);
      });

      socket.on('peer-left', ({ peerId }) => {
        if (pcsRef.current[peerId]) { pcsRef.current[peerId].close(); delete pcsRef.current[peerId]; }
        setPeers(prev => prev.filter(p => p.peerId !== peerId));
      });

      // Receive WebRTC signals
      socket.on('call-signal', async ({ from, signal, type }) => {
        if (!pcsRef.current[from]) {
          await createPeerConnection(from, stream, socket, false);
        }
        const pc = pcsRef.current[from];
        if (type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
          // Flush pending candidates
          if (pendingCandidates.current[from]) {
            for (const c of pendingCandidates.current[from]) await pc.addIceCandidate(c);
            delete pendingCandidates.current[from];
          }
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('call-signal', { to: from, signal: answer, type: 'answer' });
        } else if (type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
          if (pendingCandidates.current[from]) {
            for (const c of pendingCandidates.current[from]) await pc.addIceCandidate(c);
            delete pendingCandidates.current[from];
          }
        } else if (type === 'candidate') {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(signal));
          } else {
            if (!pendingCandidates.current[from]) pendingCandidates.current[from] = [];
            pendingCandidates.current[from].push(new RTCIceCandidate(signal));
          }
        }
      });

    } catch (err) {
      setStatus('error');
      setErrorMsg(err.name === 'NotAllowedError'
        ? 'Camera/mic permission denied. Please allow access and try again.'
        : `Error: ${err.message}`);
    }
  }

  async function createPeerConnection(peerId, stream, socket, isInitiator) {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcsRef.current[peerId] = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('call-signal', { to: peerId, signal: e.candidate, type: 'candidate' });
      }
    };

    pc.ontrack = (e) => {
      const remoteStream = e.streams[0];
      setPeers(prev => prev.map(p =>
        p.peerId === peerId ? { ...p, stream: remoteStream } : p
      ).concat(prev.find(p => p.peerId === peerId) ? [] : [{ peerId, username: peerId, stream: remoteStream }]));
    };

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('call-signal', { to: peerId, signal: offer, type: 'offer' });
    }

    return pc;
  }

  function leaveRoom() {
    if (socketRef.current) socketRef.current.emit('leave-room', { roomId });
    cleanup();
    setInRoom(false);
    setLocalStream(null);
    setPeers([]);
    setStatus('idle');
  }

  function toggleMic() {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMicOn(prev => !prev);
  }

  function toggleCam() {
    if (!localStream) return;
    localStream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOn(prev => !prev);
  }

  function generateRoom() {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    setRoomId(id);
  }

  function copyRoom() {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const base = darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900';
  const card = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const inp = darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900';

  if (!inRoom) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-73px)] px-4 ${base}`}>
        <div className={`w-full max-w-md rounded-2xl border p-8 shadow-xl ${card}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>P2P Calls</h2>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Voice & video — peer to peer</p>
            </div>
          </div>

          {/* Call mode */}
          <div className="flex gap-2 mb-5">
            {['video', 'voice'].map(mode => (
              <button
                key={mode}
                onClick={() => setCallMode(mode)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  callMode === mode
                    ? 'bg-blue-600 text-white border-blue-600'
                    : darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {mode === 'video' ? '📹 Video Call' : '🎙 Voice Only'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Your Name</label>
              <input
                value={username}
                onChange={e => { setUsername(e.target.value); localStorage.setItem('eversite-username', e.target.value); }}
                className={`mt-1 w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${inp}`}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Room Code</label>
              <div className="flex gap-2 mt-1">
                <input
                  value={roomId}
                  onChange={e => setRoomId(e.target.value.toUpperCase())}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${inp}`}
                  placeholder="Enter or generate code"
                  maxLength={8}
                />
                <button onClick={generateRoom} className={`px-3 py-2 rounded-lg border text-xs ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  Generate
                </button>
                {roomId && (
                  <button onClick={copyRoom} className={`px-3 py-2 rounded-lg border text-xs ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Share this code with the person you want to call
              </p>
            </div>

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">{errorMsg}</div>
            )}

            <button
              onClick={joinRoom}
              disabled={!roomId.trim() || status === 'joining'}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              {status === 'joining' ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Connecting...</>
              ) : (
                <><Phone className="w-4 h-4" /> Join Room</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-[calc(100vh-73px)] ${base}`}>
      {/* Call header */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${darkMode ? 'border-gray-800 bg-black' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Room: {roomId}</span>
          <button onClick={copyRoom} className={`text-xs px-2 py-1 rounded border ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Users className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{peers.length + 1} in room</span>
        </div>
      </div>

      {/* Video grid */}
      <div className="flex-1 p-4 grid gap-3 overflow-auto"
        style={{ gridTemplateColumns: peers.length === 0 ? '1fr' : peers.length === 1 ? '1fr 1fr' : 'repeat(auto-fit, minmax(280px, 1fr))' }}
      >
        {/* Local */}
        <div className={`relative rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} aspect-video`}>
          {callMode === 'video' ? (
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {username[0]?.toUpperCase()}
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
            {username} (you)
          </div>
          {!micOn && <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1"><MicOff className="w-3 h-3 text-white" /></div>}
        </div>

        {/* Remote peers */}
        {peers.map(peer => (
          <div key={peer.peerId} className={`relative rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} aspect-video`}>
            {peer.stream && callMode === 'video' ? (
              <video
                autoPlay playsInline className="w-full h-full object-cover"
                ref={el => { if (el && peer.stream) el.srcObject = peer.stream; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {peer.username?.[0]?.toUpperCase() || '?'}
                </div>
              </div>
            )}
            {peer.stream && callMode === 'voice' && (
              <audio autoPlay ref={el => { if (el && peer.stream) el.srcObject = peer.stream; }} />
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
              {peer.username || 'Peer'}
            </div>
          </div>
        ))}

        {peers.length === 0 && (
          <div className={`flex flex-col items-center justify-center rounded-2xl aspect-video border-2 border-dashed ${darkMode ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400'}`}>
            <Users className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">Waiting for others to join...</p>
            <p className="text-xs mt-1">Share room code: <span className="font-mono font-bold">{roomId}</span></p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={`flex items-center justify-center gap-4 py-4 border-t ${darkMode ? 'border-gray-800 bg-black' : 'border-gray-200 bg-white'}`}>
        <button
          onClick={toggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${micOn ? darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-red-600 text-white hover:bg-red-700'}`}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {callMode === 'video' && (
          <button
            onClick={toggleCam}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${camOn ? darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
        )}

        <button
          onClick={leaveRoom}
          className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
