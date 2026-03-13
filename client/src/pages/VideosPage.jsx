import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Play, Download, X, Video, Trash2, Share2, Youtube } from 'lucide-react';
import localforage from 'localforage';

const videoStore = localforage.createInstance({ name: 'eversite-videos' });

export default function VideosPage({ darkMode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [downloadedVideos, setDownloadedVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    loadDownloadedVideos();
  }, []);

  const loadDownloadedVideos = async () => {
    const keys = await videoStore.keys();
    const videos = [];
    for (const key of keys) {
      const video = await videoStore.getItem(key);
      videos.push(video);
    }
    setDownloadedVideos(videos);
  };

  const searchYouTube = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const API_KEY = 'AIzaSyCgBK_NfiP8MCqR2XcYryh6Y5WD7uKoa0o';
      const survivalQuery = `${searchQuery} survival emergency medical educational tutorial`;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(survivalQuery)}&type=video&videoCategoryId=26&key=${API_KEY}`
      );
      const data = await response.json();
      
      if (data.items) {
        setSearchResults(data.items.map(item => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          channel: item.snippet.channelTitle,
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt
        })));
      }
    } catch (error) {
      console.error('YouTube search failed:', error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleDownloadVideo = async (video) => {
    try {
      setIsSearching(true);
      
      const response = await fetch('http://localhost:3002/api/download-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const videoData = {
          ...video,
          downloadedAt: new Date().toISOString(),
          localUrl: `http://localhost:3002/api/video/${video.id}`,
          cached: true,
          offline: true
        };
        
        await videoStore.setItem(video.id, videoData);
        setDownloadedVideos(prev => [...prev, videoData]);
      }
      
      setIsSearching(false);
    } catch (error) {
      console.error('Download failed:', error);
      setIsSearching(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    await videoStore.removeItem(videoId);
    setDownloadedVideos(prev => prev.filter(v => v.id !== videoId));
    if (selectedVideo?.id === videoId) setSelectedVideo(null);
  };

  const handlePlayVideo = (video) => {
    setSelectedVideo(video);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Video Library
        </h1>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Download and watch videos offline
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            activeTab === 'search'
              ? 'bg-blue-600 text-white'
              : darkMode
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Youtube className="w-5 h-5 inline mr-2" />
          Search Online
        </button>
        <button
          onClick={() => setActiveTab('downloaded')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            activeTab === 'downloaded'
              ? 'bg-blue-600 text-white'
              : darkMode
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Download className="w-5 h-5 inline mr-2" />
          Downloaded ({downloadedVideos.length})
        </button>
      </div>

      {activeTab === 'search' && (
        <>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchYouTube()}
                placeholder="Search survival, medical, emergency videos..."
                className={`w-full pl-10 pr-4 py-3 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <button
              onClick={searchYouTube}
              disabled={isSearching || !searchQuery.trim()}
              className="btn-primary px-8"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''} overflow-hidden`}
              >
                <div className="relative aspect-video bg-gray-900">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handlePlayVideo(video)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors group"
                  >
                    <Play className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
                    {video.title}
                  </h3>
                  <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {video.channel}
                  </p>
                  <button
                    onClick={() => handleDownloadVideo(video)}
                    disabled={downloadedVideos.some(v => v.id === video.id) || isSearching}
                    className="btn-primary w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {downloadedVideos.some(v => v.id === video.id) ? 'Downloaded' : isSearching ? 'Downloading...' : 'Download for Offline'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {searchResults.length === 0 && !isSearching && (
            <div className={`text-center py-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <Video className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">Search for videos</p>
              <p className="text-sm">Enter a search term to find videos online</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'downloaded' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloadedVideos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''} overflow-hidden`}
              >
                <div className="relative aspect-video bg-gray-900">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handlePlayVideo(video)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors group"
                  >
                    <Play className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
                  </button>
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    Offline Ready
                  </div>
                </div>
                <div className="p-4">
                  <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'} line-clamp-2`}>
                    {video.title}
                  </h3>
                  <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {video.channel}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="btn-secondary flex-1 text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                    <button
                      className="btn-secondary px-4 text-sm"
                      title="Share via P2P"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {downloadedVideos.length === 0 && (
            <div className={`text-center py-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <Download className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No downloaded videos</p>
              <p className="text-sm">Search and download videos to watch offline</p>
            </div>
          )}
        </>
      )}

      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className={`${darkMode ? 'bg-gray-900' : 'bg-gray-800'} rounded-xl shadow-2xl w-full max-w-5xl`}
          >
            <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-700'}`}>
              <h3 className="text-xl font-semibold text-white">
                {selectedVideo.title}
              </h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {selectedVideo.offline && selectedVideo.localUrl ? (
                  <video
                    src={selectedVideo.localUrl}
                    controls
                    autoPlay
                    className="w-full h-full"
                  />
                ) : navigator.onLine ? (
                  <iframe
                    src={selectedVideo.embedUrl || `https://www.youtube.com/embed/${selectedVideo.id}`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold mb-2">Offline Mode</p>
                      <p className="text-sm text-gray-400">Video not downloaded. Connect to internet to play.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
