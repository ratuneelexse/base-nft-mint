require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

module.exports = {
  solidity: { version: '0.8.24', settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    base:          { url: 'https://mainnet.base.org',  accounts: [process.env.PRIVATE_KEY || '0'.repeat(64)], chainId: 8453 },
    'base-sepolia':{ url: 'https://sepolia.base.org',  accounts: [process.env.PRIVATE_KEY || '0'.repeat(64)], chainId: 84532 },
  },
  etherscan: {
    apiKey: { 'base-sepolia': process.env.BASESCAN_API_KEY, base: process.env.BASESCAN_API_KEY },
    customChains: [{
      network: 'base-sepolia', chainId: 84532,
      urls: { apiURL: 'https://api-sepolia.basescan.org/api', browserURL: 'https://sepolia.basescan.org' },
    }],
  },
}
