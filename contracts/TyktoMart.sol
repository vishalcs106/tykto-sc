// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./BaseTicket.sol";

/*
* @author Vishal
* @notice Marketplace for TyktoNFT. Can be listed for sale and bought.
*/

contract TyktoMart is Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable  {
    //@notice NFT contract address
    address public tyktoNftAddress;
    
    //@notice Token contract address
    address public tyktoTokenAddress;


    //@notice Sale status of a ticket
    enum SaleStatus {
        ACTIVE,
        CANCELLED,
        SOLD
    }

    //@notice Mapping for tickets listed for sale
    mapping(address => SaleItem[]) public saleItems;

    //@notice Fee percentage charged by the marketplace
    uint256 public feePercentage;

    struct SaleItem {
        uint256 ticketId;
        uint256 price;
        address seller;
        address buyer;
        uint256 duration;
        uint256 startTime;
        SaleStatus status;
    }

    //@notice Constructor 
    //@param _tyktoNftAddress Address of TyktoNFT contract
    //@param _tyktoTokenAddress Address of TyktoToken contract
    function initialize(address _tyktoNftAddress, address _tyktoTokenAddress) public initializer {
        tyktoNftAddress = _tyktoNftAddress;
        tyktoTokenAddress = _tyktoTokenAddress;
        feePercentage = 5;
    }

    event SaleItemCreated(
        address indexed ticketAddress,
        uint256 indexed tokenId,
        uint256 price,
        address indexed seller
    );
    event SaleCancelled(
        address indexed ticketAddress,
        uint256 indexed tokenId,
        address indexed seller
    );
    event ItemSold(
        address ticketAddress,
        uint256 indexed tokenId,
        uint256 price,
        address indexed seller,
        address indexed buyer
    );

    function pause() public onlyOwner() {
        _pause();
    }

    function unpause() public onlyOwner(){
        _unpause();
    }

    //@notice Change the fee percentage charged by the marketplace
    function setFeePercentage(
        uint256 _feePercentage
    ) external whenNotPaused onlyOwner {
        require(
            _feePercentage <= 100,
            "Fee percentage cannot be more than 100"
        );
        feePercentage = _feePercentage;
    }

    //@notice List a ticket for sale
    function listForSale(
        address ticketAddress,
        uint256 tokenId,
        uint256 amount,
        uint256 saleDuration
    ) external whenNotPaused {
        require(
            msg.sender == BaseTicket(ticketAddress).ownerOf(tokenId),
            "You are not the owner of this ticket"
        );
        SaleItem memory saleItem = SaleItem({
            ticketId: tokenId,
            price: amount,
            seller: msg.sender,
            buyer: address(0),
            duration: saleDuration,
            startTime: block.timestamp,
            status: SaleStatus.ACTIVE
        });
        saleItems[ticketAddress].push(saleItem);
        emit SaleItemCreated(ticketAddress, tokenId, amount, msg.sender);
    }

    //@notice Buy a ticket listed from sale
    function buyTicket(
        address ticketAddress,
        uint tokenId
    ) external payable whenNotPaused {
        SaleItem[] storage saleItemList = saleItems[ticketAddress];
        SaleItem memory saleItem;
        uint256 itemIndex;
        for (uint i = 0; i < saleItemList.length; i++) {
            if (saleItemList[i].ticketId == tokenId) {
                itemIndex = i;
                saleItem = saleItemList[i];
                break;
            }
        }
        BaseTicket ticket = BaseTicket(ticketAddress);
        require(saleItem.status == SaleStatus.ACTIVE, "Ticket is not for sale");
        require(msg.value == saleItem.price, "Incorrect amount sent");
        require(
            block.timestamp < saleItem.startTime + saleItem.duration,
            "Sale has expired"
        );
        require(
            msg.sender != saleItem.seller,
            "You cannot buy your own ticket"
        );
        require(
            ticket.ownerOf(tokenId) == saleItem.seller,
            "Seller does not own this ticket"
        );
        saleItem.buyer = msg.sender;
        saleItem.status = SaleStatus.SOLD;
        saleItemList[itemIndex] = saleItem;
        ticket.transferFrom(saleItem.seller, msg.sender, tokenId);

        (address creator, uint256 royaltyAmount) = ticket.royaltyInfo(
            tokenId,
            msg.value
        );

        uint256 platformFee = calculateMarketplaceFee();
        uint256 remainingAmount = msg.value - royaltyAmount - platformFee;
        payable(creator).transfer(royaltyAmount);
        payable(saleItem.seller).transfer(remainingAmount);
        emit ItemSold(
            ticketAddress,
            tokenId,
            saleItem.price,
            saleItem.seller,
            msg.sender
        );
    }

    //@notice Cancel a ticket listed for sale
    function cancelListing(address ticketAddress, uint256 tokenId) public {
        SaleItem[] storage saleItemList = saleItems[ticketAddress];
        SaleItem memory saleItem;
        uint256 itemIndex;
        for (uint i = 0; i < saleItemList.length; i++) {
            if (saleItemList[i].ticketId == tokenId) {
                itemIndex = i;
                saleItem = saleItemList[i];
                break;
            }
        }
        require(saleItem.status == SaleStatus.ACTIVE, "Ticket is not for sale");
        require(
            msg.sender == saleItem.seller,
            "You are not the owner of this ticket"
        );
        saleItem.status = SaleStatus.CANCELLED;
        saleItemList[itemIndex] = saleItem;
        emit SaleCancelled(ticketAddress, tokenId, msg.sender);
    }

    //@notice Calculates the marketplace fee
    function calculateMarketplaceFee() internal view returns (uint256) {
        return (msg.value * feePercentage) / 100;
    }

    //@notice Withdraws the balance from the contract
    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

}
