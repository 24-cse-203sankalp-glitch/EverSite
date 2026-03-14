// Uses Pinata free tier — plain fetch, works in any browser, no Node.js APIs
// Free tier: 1GB storage, unlimited pins
// Sign up free at pinata.cloud to get your own JWT if needed

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';
const PUBLIC_GATEWAY = 'https://ipfs.io/ipfs';

class IPFSManager {
  constructor() {
    this.siteHash = localStorage.getItem('eversite-ipfs-hash') || null;
    this.uploadLog = JSON.parse(localStorage.getItem('eversite-ipfs-log') || '[]');
    this.nodeType = 'pinata';
  }

  async init() {
    // Nothing to init — Pinata is always available if we have a JWT
    return true;
  }

  async uploadSite() {
    try {
      // Collect the current page HTML + inline everything into one file
      const html = await this._getPageHTML();
      const blob = new Blob([html], { type: 'text/html' });

      const formData = new FormData();
      formData.append('file', blob, 'index.html');
      formData.append('pinataMetadata', JSON.stringify({ name: `EverSite-${Date.now()}` }));
      formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

      const headers = {};
      if (PINATA_JWT) {
        headers['Authorization'] = `Bearer ${PINATA_JWT}`;
      }

      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.text();
        // If no JWT, fall back to public w3s upload
        if (res.status === 401) return await this._uploadViaW3S(html);
        throw new Error(`Pinata error ${res.status}: ${err}`);
      }

      const data = await res.json();
      const hash = data.IpfsHash;

      this._saveHash(hash, 'pinata');
      return { success: true, hash, url: `${PUBLIC_GATEWAY}/${hash}`, node: 'pinata' };

    } catch (err) {
      // Final fallback — try web3.storage public endpoint
      try {
        const html = await this._getPageHTML();
        return await this._uploadViaW3S(html);
      } catch (e) {
        return { success: false, error: err.message };
      }
    }
  }

  async _uploadViaW3S(html) {
    // web3.storage free public upload (no auth needed for small files)
    const blob = new Blob([html], { type: 'text/html' });
    const formData = new FormData();
    formData.append('file', blob, 'index.html');

    const res = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: { 'X-NAME': 'EverSite' },
      body: blob,
    });

    if (!res.ok) throw new Error(`web3.storage error: ${res.status}`);
    const data = await res.json();
    const hash = data.cid;
    this._saveHash(hash, 'web3.storage');
    return { success: true, hash, url: `${PUBLIC_GATEWAY}/${hash}`, node: 'web3.storage' };
  }

  async _getPageHTML() {
    try {
      const r = await fetch(window.location.origin + '/');
      return await r.text();
    } catch {
      return document.documentElement.outerHTML;
    }
  }

  _saveHash(hash, node) {
    this.siteHash = hash;
    this.nodeType = node;
    localStorage.setItem('eversite-ipfs-hash', hash);
    const logEntry = { hash, uploadedAt: new Date().toISOString(), node };
    this.uploadLog = [logEntry, ...this.uploadLog.slice(0, 9)];
    localStorage.setItem('eversite-ipfs-log', JSON.stringify(this.uploadLog));
  }

  getUploadLog() { return this.uploadLog; }
  getIPFSUrl() { return this.siteHash ? `${PUBLIC_GATEWAY}/${this.siteHash}` : null; }
  getSiteHash() { return this.siteHash; }
  getNodeType() { return this.nodeType || null; }
}

export default new IPFSManager();
