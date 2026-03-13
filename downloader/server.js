const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const VIDEOS_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR);
}

app.get('/', (req, res) => {
  res.json({ status: 'Video downloader running' });
});

app.post('/download', async (req, res) => {
  const { videoId } = req.body;
  const videoPath = path.join(VIDEOS_DIR, `${videoId}.mp4`);
  
  if (fs.existsSync(videoPath)) {
    return res.json({ success: true, message: 'Already downloaded' });
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const command = `python -m yt_dlp -f "best[height<=480]" -o "${videoPath}" "${videoUrl}"`;
  
  console.log('Downloading:', videoUrl);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Download error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
    
    console.log('Download complete:', videoId);
    res.json({ success: true, message: 'Downloaded successfully' });
  });
});

app.get('/video/:videoId', (req, res) => {
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

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Video downloader running on port ${PORT}`);
  console.log('Make sure yt-dlp is installed: python -m pip install yt-dlp');
});