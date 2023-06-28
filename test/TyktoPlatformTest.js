import { expect } from "chai";
import { ethers } from "ethers";
import TyktoPlatform from "./TyktoPlatform.sol";

describe("TyktoPlatform", () => {
  let deployer;
  let tyktoPlatform;
  let tyktoToken;
  let buyer;
  let seller;
  let event;
  let ticket;

  beforeEach(async () => {
    deployer = await ethers.getWitness();
    tyktoToken = await ethers.deploy(TyktoToken);
    tyktoPlatform = await deployer.deploy(TyktoPlatform, tyktoToken.address);
    buyer = deployer.accounts[0];
    seller = deployer.accounts[1];
    ticket = await tyktoToken.mint(seller, { from: seller });
  });

  it("should allow a user to create an event", async () => {
    await tyktoPlatform.createEvent(
      "My Event",
      "This is my event",
      "The Venue",
      1640992000,
      1641088000,
      tyktoToken.address
    );
    const event = await tyktoPlatform.activeEvents(seller);
    expect(event.name).to.equal("My Event");
    expect(event.description).to.equal("This is my event");
    expect(event.venue).to.equal("The Venue");
    expect(event.startTime).to.equal(1640992000);
    expect(event.endTime).to.equal(1641088000);
    expect(event.ticketAddress).to.equal(tyktoToken.address);
    expect(event.isActive).to.be.true;
    expect(event.isVerified).to.be.false;
  });

  it("should not allow a user to create an event with insufficient fee", async () => {
    await expect(tyktoPlatform.createEvent(
      "My Event",
      "This is my event",
      "The Venue",
      1640992000,
      1641088000,
      tyktoToken.address
    )).to.be.revertedWith("TyktoPlatform: Insufficient fee");
  });

  it("should allow a user to claim entry to an event", async () => {
    await tyktoPlatform.createEvent(
      "My Event",
      "This is my event",
      "The Venue",
      1640992000,
      1641088000,
      tyktoToken.address
    );
    await tyktoPlatform.claimEntry(1, ticket.id);
    const balance = await tyktoToken.balanceOf(buyer);
    expect(balance).to.equal(100);
  });

  it("should not allow a user to claim entry to an event with an invalid ticket", async () => {
    await expect(tyktoPlatform.claimEntry(1, 1234567890)).to.be.revertedWith("TyktoPlatform: You do not own this ticket");
  });

  it("should not allow a user to claim entry to an event that has ended", async () => {
    await tyktoPlatform.createEvent(
      "My Event",
      "This is my event",
      "The Venue",
      1640992000,
      1640992001,
      tyktoToken.address
    );
    await tyktoPlatform.claimEntry(1, ticket.id);
    expect(
      await tyktoPlatform.activeEvents(seller)[0].isActive
    ).to.be.false;
  });
});