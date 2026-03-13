import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Play, Download, Upload, X, Video, Users, Wifi, WifiOff } from 'lucide-react';
import localforage from 'localforage';

const videoStore = localforage.createInstance({ name: 'eversite-videos' });

export default function VideosPage({ darkMode }) {
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [peerVideos, setPeerVideos] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadCachedVideos();
  }, []);

  const loadCachedVideos = async () => {
    const keys = await videoStore.keys();
    const cached = [];
    for (const key of keys) {
      const video = await videoStore.getItem(key);
      cached.push(video);
    }
    setVideos(cached);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('video/')) return;

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      const videoData = {
        id: Date.now().toString(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        size: file.size,
        type: file.type,
        data: event.target.result,
        uploadedAt: new Date().toISOString(),
        cached: true
      };

      await videoStore.setItem(videoData.id, videoData);
      setVideos(prev => [...prev, videoData]);
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDownloadForOffline = async (video) => {
    if (!video.cached) {
      await videoStore.setItem(video.id, { ...video, cached: true });
      setVideos(prev => prev.map(v => v.id === video.id ? { ...v, cached: true } : v));
    }
  };

  const handleDeleteVideo = async (videoId) => {
    await videoStore.removeItem(videoId);
    setVideos(prev => prev.filter(v => v.id !== videoId));
    if (selectedVideo?.id === videoId) setSelectedVideo(null);
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Video Library
        </h1>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Upload, cache, and share videos across the P2P network
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''} p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cached Videos</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{videos.length}</p>
            </div>
          </div>
        </div>

        <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''} p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Online Mode</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Active</p>
            </div>
          </div>
        </div>

        <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''} p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Peer Videos</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{peerVideos.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos..."
            className={`w-full pl-10 pr-4 py-3 rounded-lg ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="btn-primary px-6 flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl w-full max-w-4xl`}
          >
            <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedVideo.title}
              </h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <video
                src={selectedVideo.data}
                controls
                autoPlay
                className="w-full rounded-lg"
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''} overflow-hidden group cursor-pointer`}
            onClick={() => setSelectedVideo(video)}
          >
            <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
              <Play className="w-16 h-16 text-white opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              {video.cached && (
                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  Offline
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
                {video.title}
              </h3>
              <div className={`flex items-center justify-between text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>{formatFileSize(video.size)}</span>
                <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2 mt-3">
                {!video.cached && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadForOffline(video);
                    }}
                    className="btn-secondary text-xs flex-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Cache
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteVideo(video.id);
                  }}
                  className="btn-secondary text-xs px-3"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className={`text-center py-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <Video className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">No videos found</p>
          <p className="text-sm">Upload your first video to get started</p>
        </div>
      )}
    </div>
  );
}
