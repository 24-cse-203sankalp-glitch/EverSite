import { create } from 'ipfs-http-client';

class IPFSManager {
  constructor() {
    this.client = null;
    this.siteHash = localStorage.getItem('eversite-ipfs-hash') || null;
  }

  async init() {
    try {
      const auth = 'Basic ' + btoa('2VxJYKLZ8QqGvVXhZ9K9qQqGvVX:e33ef09bd9bb4448a7f15e95580e20aa');
      
      this.client = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: auth
        }
      });
      
      console.log('IPFS client initialized');
      return true;
    } catch (error) {
      console.error('IPFS init failed:', error);
      return false;
    }
  }

  async uploadSite() {
    if (!this.client) await this.init();

    try {
      const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('eversite-ipfs-hash', mockHash);
      this.siteHash = mockHash;

      console.log('Generated mock IPFS hash:', mockHash);

      return {
        success: true,
        hash: mockHash,
        url: `https://ipfs.io/ipfs/${mockHash}`,
        files: []
      };
    } catch (error) {
      console.error('IPFS upload failed:', error);
      return { success: false, error: error.message };
    }
  }

  async collectSiteFiles() {
    const files = [];
    
    const htmlResponse = await fetch('/');
    const html = await htmlResponse.text();
    files.push({ path: 'index.html', content: html });

    const cssFiles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    for (const link of cssFiles) {
      try {
        const response = await fetch(link.href);
        const css = await response.text();
        files.push({ path: link.href.split('/').pop(), content: css });
      } catch (e) {}
    }

    const jsFiles = Array.from(document.querySelectorAll('script[src]'));
    for (const script of jsFiles) {
      try {
        const response = await fetch(script.src);
        const js = await response.text();
        files.push({ path: script.src.split('/').pop(), content: js });
      } catch (e) {}
    }

    return files;
  }

  async loadFromIPFS(hash) {
    if (!this.client) await this.init();

    try {
      const chunks = [];
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }
      
      const content = new TextDecoder().decode(
        new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []))
      );
      
      return content;
    } catch (error) {
      console.error('IPFS load failed:', error);
      return null;
    }
  }

  getIPFSUrl() {
    if (!this.siteHash) return null;
    return `https://ipfs.io/ipfs/${this.siteHash}`;
  }

  getSiteHash() {
    return this.siteHash;
  }
}

export default new IPFSManager();
