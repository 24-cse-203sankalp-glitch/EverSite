import CryptoJS from 'crypto-js';

class BlockchainVerifier {
  constructor() {
    this.chain = [];
    this.pendingData = [];
    this.difficulty = 2;
    this.miningReward = 1;
    this.createGenesisBlock();
  }

  createGenesisBlock() {
    const genesisBlock = {
      index: 0,
      timestamp: Date.now(),
      data: 'Genesis Block',
      previousHash: '0',
      hash: '',
      nonce: 0
    };
    genesisBlock.hash = this.calculateHash(genesisBlock);
    this.chain.push(genesisBlock);
  }

  calculateHash(block) {
    return CryptoJS.SHA256(
      block.index +
      block.timestamp +
      JSON.stringify(block.data) +
      block.previousHash +
      block.nonce
    ).toString();
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  mineBlock(block) {
    while (block.hash.substring(0, this.difficulty) !== Array(this.difficulty + 1).join('0')) {
      block.nonce++;
      block.hash = this.calculateHash(block);
    }
    return block;
  }

  addBlock(data) {
    const newBlock = {
      index: this.chain.length,
      timestamp: Date.now(),
      data: data,
      previousHash: this.getLatestBlock().hash,
      hash: '',
      nonce: 0
    };

    const minedBlock = this.mineBlock(newBlock);
    this.chain.push(minedBlock);
    return minedBlock;
  }

  verifyContent(content) {
    const hash = CryptoJS.SHA256(JSON.stringify(content)).toString();
    
    // Check if content exists in blockchain
    for (let block of this.chain) {
      if (block.data && block.data.contentHash === hash) {
        return {
          verified: true,
          block: block,
          timestamp: block.timestamp
        };
      }
    }

    return {
      verified: false,
      hash: hash
    };
  }

  addContent(content, metadata = {}) {
    const contentHash = CryptoJS.SHA256(JSON.stringify(content)).toString();
    
    const blockData = {
      contentHash,
      metadata,
      timestamp: Date.now(),
      type: 'content'
    };

    return this.addBlock(blockData);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== this.calculateHash(currentBlock)) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getChainInfo() {
    return {
      length: this.chain.length,
      isValid: this.isChainValid(),
      latestBlock: this.getLatestBlock(),
      difficulty: this.difficulty
    };
  }
}

export default new BlockchainVerifier();
