import { create } from 'ipfs-http-client';

class IPFSManager {
  constructor() {
    this.client = null;
    this.siteHash = localStorage.getItem('eversite-ipfs-hash') || null;
  }

  async init() {
    try {
      this.client = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https'
      });
      return true;
    } catch (error) {
      console.error('IPFS init failed:', error);
      return false;
    }
  }

  async uploadSite() {
    if (!this.client) await this.init();

    try {
      const files = await this.collectSiteFiles();
      const results = [];

      for (const file of files) {
        const result = await this.client.add(file.content);
        results.push({
          path: file.path,
          hash: result.path
        });
      }

      const rootHash = results[0].hash;
      localStorage.setItem('eversite-ipfs-hash', rootHash);
      this.siteHash = rootHash;

      return {
        success: true,
        hash: rootHash,
        url: `https://ipfs.io/ipfs/${rootHash}`,
        files: results
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
