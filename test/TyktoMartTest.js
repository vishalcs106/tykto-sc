import { expect } from "chai";
import { ethers } from "ethers";
import TyktoMart from "./TyktoMart.sol";

describe("TyktoMart", () => {
  let deployer;
  let tyktoMart;
  let tyktoNft;
  let buyer;
  let seller;
  let ticket;

  beforeEach(async () => {
    deployer = await ethers.getWitness();
    tyktoNft = await ethers.deploy(TyktoNft);
    tyktoMart = await deployer.deploy(TyktoMart, tyktoNft.address);
    buyer = deployer.accounts[0];
    seller = deployer.accounts[1];
    ticket = await tyktoNft.mint(seller, { from: seller });
  });

  it("should allow a user to list a ticket for sale", async () => {
    await tyktoMart.listForSale(
      tyktoNft.address,
      ticket.id,
      100,
      10000
    );
    const saleItem = await tyktoMart.saleItems(tyktoNft.address, ticket.id);
    expect(saleItem.ticketId).to.equal(ticket.id);
    expect(saleItem.price).to.equal(100);
    expect(saleItem.seller).to.equal(seller);
    expect(saleItem.buyer).to.be.null();
    expect(saleItem.status).to.equal(SaleStatus.ACTIVE);
  });

  it("should allow a user to buy a listed ticket", async () => {
    await tyktoMart.listForSale(
      tyktoNft.address,
      ticket.id,
      100,
      10000
    );
    await buyer.sendTransaction({ value: 100 });
    await tyktoMart.buyTicket(tyktoNft.address, ticket.id, 100);
    const saleItem = await tyktoMart.saleItems(tyktoNft.address, ticket.id);
    expect(saleItem.buyer).to.equal(buyer);
    expect(saleItem.status).to.equal(SaleStatus.SOLD);
  });

  it("should not allow a user to buy a listed ticket that has expired", async () => {
    await tyktoMart.listForSale(
      tyktoNft.address,
      ticket.id,
      100,
      10000
    );
    await ethers.increaseBlockNumber(10001);
    await buyer.sendTransaction({ value: 100 });
    await expect(tyktoMart.buyTicket(tyktoNft.address, ticket.id, 100)).to.be.revertedWith(
      "Sale has expired"
    );
  });

  it("should not allow a user to buy their own listed ticket", async () => {
    await tyktoMart.listForSale(
      tyktoNft.address,
      ticket.id,
      100,
      10000
    );
    await seller.sendTransaction({ value: 100});
    await expect(tyktoMart.buyTicket(tyktoNft.address, ticket.id, 100)).to.be.revertedWith(
      "You cannot buy your own ticket"
    );
  });
})