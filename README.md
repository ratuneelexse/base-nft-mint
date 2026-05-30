# base-nft-mint

A simple NFT minting dapp on **Base** — ERC-721 contract with a React + wagmi frontend.

Based on the [Base get-started guide](https://docs.base.org/get-started/base).

## What's inside
```
contracts/
  BaseNFT.sol       ERC-721 with mint, tokenURI, max supply cap
scripts/
  deploy.js         Deploy to Base Sepolia + Basescan verify
test/
  BaseNFT.test.js   Hardhat tests
frontend/
  src/              Vite + React + wagmi mint UI
```

## Quick start
```bash
npm install && cp .env.example .env
# fill PRIVATE_KEY and BASESCAN_API_KEY
npx hardhat run scripts/deploy.js --network base-sepolia
cd frontend && VITE_CONTRACT_ADDRESS=0x... npm run dev
```
