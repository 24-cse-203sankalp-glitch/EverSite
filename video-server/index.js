const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const VIDEOS_DIR = path.join(__dirname, 'cached-videos');
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR);
}

app.post('/api/download-video', async (req, res) => {
  try {
    const { videoId } = req.body;
    const videoPath = path.join(VIDEOS_DIR, `${videoId}.mp4`);

    if (fs.existsSync(videoPath)) {
      return res.json({ success: true, message: 'Video already cached' });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const video = ytdl(videoUrl, { quality: 'lowest' });

    video.pipe(fs.createWriteStream(videoPath));

    video.on('end', () => {
      res.json({ success: true, message: 'Video downloaded successfully' });
    });

    video.on('error', (error) => {
      console.error('Download error:', error);
      res.status(500).json({ success: false, error: error.message });
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/video/:videoId', (req, res) => {
  const { videoId } = req.params;
  const videoPath = path.join(VIDEOS_DIR, `${videoId}.mp4`);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Video download server running on port ${PORT}`);
});
