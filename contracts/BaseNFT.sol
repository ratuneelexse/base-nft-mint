// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title BaseNFT
/// @notice A simple ERC-721 NFT with a public mint, per-address limit, and owner-configurable max supply.
contract BaseNFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    uint256 public maxSupply;
    uint256 public mintPrice;
    uint256 public maxPerWallet;

    string private _baseTokenURI;

    error MaxSupplyReached();
    error MaxPerWalletReached();
    error InsufficientPayment();

    event Minted(address indexed to, uint256 tokenId);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        uint256 maxPerWallet_,
        string memory baseTokenURI_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        maxSupply      = maxSupply_;
        mintPrice      = mintPrice_;
        maxPerWallet   = maxPerWallet_;
        _baseTokenURI  = baseTokenURI_;
    }

    /// @notice Mint one NFT. Caller must send >= mintPrice ETH.
    function mint() external payable {
        if (nextTokenId >= maxSupply)             revert MaxSupplyReached();
        if (balanceOf(msg.sender) >= maxPerWallet) revert MaxPerWalletReached();
        if (msg.value < mintPrice)                revert InsufficientPayment();

        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked(_baseTokenURI, _toString(tokenId), ".json")));
        emit Minted(msg.sender, tokenId);
    }

    /// @notice Withdraw accumulated ETH to owner.
    function withdraw() external onlyOwner {
        (bool ok,) = owner().call{value: address(this).balance}("");
        require(ok, "withdraw failed");
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buf = new bytes(digits);
        while (value != 0) { digits--; buf[digits] = bytes1(uint8(48 + value % 10)); value /= 10; }
        return string(buf);
    }
}
