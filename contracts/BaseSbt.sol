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
* @notice ERC721 token for Tykto. These are the SBT's that user can earn afetr burning the NFT.
*/

contract BaseSbt is
    ERC721,
    ERC721URIStorage,
    Ownable,
    ReentrancyGuard
{

    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private tokenIdCounter;
    uint public maxSupply;
    string public ticketURI;

    error TokenIsSoulbound();

    constructor(string memory _name, string memory _symbol, string memory _baseUri) ERC721(_name, _symbol){
        ticketURI = _baseUri;
    }

    function setTokenURI(string memory _tokenURI) public onlyOwner {
        ticketURI = _tokenURI;
    }

    function safeMint(address mintTo) public{
        _safeMint(mintTo, tokenIdCounter.current());
        tokenIdCounter.increment();
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        onlySoulbound(from, to);
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function onlySoulbound(address from, address to) internal pure {
        if (from != address(0) && to != address(0)) {
            revert TokenIsSoulbound();
        }
    }
}