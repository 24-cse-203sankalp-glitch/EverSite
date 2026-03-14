import { create } from 'ipfs-http-client';

class IPFSManager {
  constructor() {
    this.client = null;
    this.siteHash = localStorage.getItem('eversite-ipfs-hash') || null;
    this.uploadLog = JSON.parse(localStorage.getItem('eversite-ipfs-log') || '[]');
  }

  // Try local IPFS node first, fall back to Infura
  async init() {
    // 1. Try local IPFS daemon (ipfs daemon must be running)
    try {
      const local = create({ host: '127.0.0.1', port: 5001, protocol: 'http' });
      // Quick connectivity check
      await local.version();
      this.client = local;
      this.nodeType = 'local';
      console.log('IPFS: connected to local node');
      return true;
    } catch {
      console.log('IPFS: local node not available, trying Infura...');
    }

    // 2. Fall back to Infura
    try {
      const auth = 'Basic ' + btoa('2VxJYKLZ8QqGvVXhZ9K9qQqGvVX:e33ef09bd9bb4448a7f15e95580e20aa');
      this.client = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: { authorization: auth },
      });
      this.nodeType = 'infura';
      console.log('IPFS: connected via Infura');
      return true;
    } catch (e) {
      console.error('IPFS init failed:', e);
      return false;
    }
  }

  async uploadSite() {
    if (!this.client) {
      const ok = await this.init();
      if (!ok) return { success: false, error: 'Could not connect to any IPFS node. Make sure ipfs daemon is running on localhost:5001.' };
    }

    try {
      // Collect all site assets
      const files = await this.collectSiteFiles();
      console.log(`IPFS: uploading ${files.length} files via ${this.nodeType}...`);

      const results = [];
      for (const file of files) {
        const content = typeof file.content === 'string'
          ? new TextEncoder().encode(file.content)
          : file.content;
        const result = await this.client.add(
          { path: file.path, content },
          { wrapWithDirectory: false }
        );
        results.push({ path: file.path, cid: result.cid.toString() });
        console.log(`IPFS: added ${file.path} → ${result.cid}`);
      }

      // Use the index.html CID as the main hash
      const indexResult = results.find(r => r.path === 'index.html') || results[0];
      const hash = indexResult.cid;

      localStorage.setItem('eversite-ipfs-hash', hash);
      const logEntry = { hash, uploadedAt: new Date().toISOString(), files: results.length, node: this.nodeType };
      this.uploadLog = [logEntry, ...this.uploadLog.slice(0, 9)];
      localStorage.setItem('eversite-ipfs-log', JSON.stringify(this.uploadLog));
      this.siteHash = hash;

      return { success: true, hash, url: `https://ipfs.io/ipfs/${hash}`, files: results, node: this.nodeType };
    } catch (error) {
      console.error('IPFS upload failed:', error);
      return { success: false, error: error.message };
    }
  }

  async collectSiteFiles() {
    const files = [];

    // index.html
    try {
      const r = await fetch('/');
      files.push({ path: 'index.html', content: await r.text() });
    } catch {}

    // CSS
    for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
      try {
        const r = await fetch(link.href);
        files.push({ path: link.href.split('/').pop(), content: await r.text() });
      } catch {}
    }

    // JS
    for (const script of document.querySelectorAll('script[src]')) {
      try {
        const r = await fetch(script.src);
        files.push({ path: script.src.split('/').pop(), content: await r.text() });
      } catch {}
    }

    return files;
  }

  getUploadLog() { return this.uploadLog; }
  getIPFSUrl() { return this.siteHash ? `https://ipfs.io/ipfs/${this.siteHash}` : null; }
  getSiteHash() { return this.siteHash; }
  getNodeType() { return this.nodeType || null; }
}

export default new IPFSManager();
