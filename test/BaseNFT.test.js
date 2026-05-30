const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('BaseNFT', () => {
  let nft, owner, alice, bob

  const deploy = async (max = 10, price = 0n, perWallet = 3) =>
    (await ethers.getContractFactory('BaseNFT')).deploy(
      'TestNFT', 'TNFT', max, price, perWallet, 'ipfs://test/'
    )

  beforeEach(async () => {
    ;[owner, alice, bob] = await ethers.getSigners()
    nft = await deploy()
  })

  it('mints token 0 to alice', async () => {
    await nft.connect(alice).mint()
    expect(await nft.ownerOf(0)).to.equal(alice.address)
    expect(await nft.nextTokenId()).to.equal(1n)
  })

  it('sets token URI with base + id', async () => {
    await nft.connect(alice).mint()
    expect(await nft.tokenURI(0)).to.equal('ipfs://test/0.json')
  })

  it('enforces max per wallet', async () => {
    for (let i = 0; i < 3; i++) await nft.connect(alice).mint()
    await expect(nft.connect(alice).mint())
      .to.be.revertedWithCustomError(nft, 'MaxPerWalletReached')
  })

  it('enforces max supply', async () => {
    nft = await deploy(2, 0n, 10)
    await nft.connect(alice).mint()
    await nft.connect(alice).mint()
    await expect(nft.connect(bob).mint())
      .to.be.revertedWithCustomError(nft, 'MaxSupplyReached')
  })

  it('requires correct mint price', async () => {
    nft = await deploy(10, ethers.parseEther('0.001'), 3)
    await expect(nft.connect(alice).mint({ value: 0 }))
      .to.be.revertedWithCustomError(nft, 'InsufficientPayment')
    await nft.connect(alice).mint({ value: ethers.parseEther('0.001') })
    expect(await nft.ownerOf(0)).to.equal(alice.address)
  })

  it('allows owner to withdraw', async () => {
    nft = await deploy(10, ethers.parseEther('0.001'), 3)
    await nft.connect(alice).mint({ value: ethers.parseEther('0.001') })
    const before = await ethers.provider.getBalance(owner.address)
    const tx = await nft.connect(owner).withdraw()
    const receipt = await tx.wait()
    const gas = receipt.gasUsed * receipt.gasPrice
    const after = await ethers.provider.getBalance(owner.address)
    expect(after + gas - before).to.be.closeTo(ethers.parseEther('0.001'), ethers.parseEther('0.0001'))
  })
})
