// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "@openzeppelin/contracts/token/common/ERC2981.sol";

/*
* @author Vishal
* @notice ERC721 token for Tykto. These are the NFTS can be minted and burned to claim entry to the Tykto Events.
*/

contract BaseTicket is
    ERC721,
    ERC721URIStorage,
    ERC2981,
    Pausable,
    Ownable,
    ERC721Burnable,
    ReentrancyGuard
{
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private tokenIdCounter;

    uint public mintPrice;
    uint public maxSupply;

    uint public royaltyFeeInBips = 500;
    address royaltyAddress;
    string public ticketURI;

    constructor(string memory _name, string memory _symbol, uint256 _mintPrice, 
    uint256 _maxSupply, uint _royaltyFeeInBips, address _royaltyAddress, string memory _tokenUri) ERC721(_name, _symbol) {
        mintPrice = _mintPrice;
        royaltyAddress = msg.sender;
        maxSupply = _maxSupply;
        royaltyAddress = _royaltyAddress;
        royaltyFeeInBips = _royaltyFeeInBips;
        ticketURI = _tokenUri;
    }

    function setMaxSupply(uint256 _maxSupply) public onlyOwner {
        maxSupply = _maxSupply;
    }

    function updateMintPrice(uint256 newMintPrice) public onlyOwner {
        mintPrice = newMintPrice;
    }

    function updateMaxSupply(uint256 newMaxSupply) public onlyOwner {
        maxSupply = newMaxSupply;
    }

    function updateRoyaltyAddress(address newRoyaltyAddress) public onlyOwner {
        royaltyAddress = newRoyaltyAddress;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function setTokenURI(string memory _tokenURI) public onlyOwner {
        ticketURI = _tokenURI;
    }

    //@notice Mint a new NFT
    function safeMint(address to) external payable {
        require(msg.value >= mintPrice, "Not enough ETH sent; check price!");
        require(tokenIdCounter.current() < maxSupply, "Max supply reached");
        _safeMint(to, tokenIdCounter.current());
        _setTokenURI(tokenIdCounter.current(), ticketURI);
        tokenIdCounter.increment();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // The following functions are overrides required by Solidity.

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    //@notice Get royalty info for a given token. Will be used my marketplaces to calculate royalty fee
    function royaltyInfo(
        uint256 _tokenId,
        uint256 _salePrice
    ) public view override returns (address, uint256) {
        return (royaltyAddress, calculateRoyalty(_salePrice));
    }

    //@notice Calculate royalty fee for a given sale price
    function calculateRoyalty(
        uint256 _salePrice
    ) public view returns (uint256) {
        return (_salePrice / 10000) * royaltyFeeInBips;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    //@notice Withdraw ETH from the contract
    function withdraw() public onlyOwner {
        uint balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}
