const { ethers, network, run } = require('hardhat')

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log(`Deploying BaseNFT with: ${deployer.address}  network: ${network.name}`)

  const BaseNFT = await ethers.getContractFactory('BaseNFT')
  const nft = await BaseNFT.deploy(
    'Base NFT',                           // name
    'BNFT',                               // symbol
    1000,                                 // maxSupply
    ethers.parseEther('0.001'),           // mintPrice (0.001 ETH)
    3,                                    // maxPerWallet
    'ipfs://YOUR_CID_HERE/'               // baseTokenURI
  )
  await nft.waitForDeployment()
  const address = await nft.getAddress()
  console.log(`BaseNFT deployed to: ${address}`)
  console.log(`Basescan: https://sepolia.basescan.org/address/${address}`)

  if (!['localhost','hardhat'].includes(network.name)) {
    console.log('Waiting 5 blocks then verifying...')
    await nft.deploymentTransaction()?.wait(5)
    try {
      await run('verify:verify', {
        address,
        constructorArguments: ['Base NFT','BNFT',1000,ethers.parseEther('0.001'),3,'ipfs://YOUR_CID_HERE/'],
      })
    } catch (e) { console.warn('Verify skipped:', e.message) }
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
