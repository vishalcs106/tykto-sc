const { expect } = require("chai");

describe("TyktoNft", function () {
  let TyktoNft;
  let tyktoNft;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    TyktoNft = await ethers.getContractFactory("TyktoNft");
    tyktoNft = await TyktoNft.deploy();
    await tyktoNft.deployed();
  });

  it("should have correct name and symbol", async function () {
    expect(await tyktoNft.name()).to.equal("TyktoNft");
    expect(await tyktoNft.symbol()).to.equal("TykNft");
  });

  it("should allow the owner to update mint price", async function () {
    await tyktoNft.updateMintPrice(0.2);
    expect(await tyktoNft.mintPrice()).to.equal(0.2);
  });

  it("should allow the owner to update max supply", async function () {
    await tyktoNft.updateMaxSupply(100);
    expect(await tyktoNft.maxSupply()).to.equal(100);
  });

  it("should allow the owner to update base URI", async function () {
    await tyktoNft.updateBaseUri("https://example.com/token/");
    expect(await tyktoNft.baseUri()).to.equal("https://example.com/token/");
  });

  it("should allow the owner to update royalty address", async function () {
    const newAddress = await addr1.getAddress();
    await tyktoNft.updateRoyaltyAddress(newAddress);
    expect(await tyktoNft.royaltyAddress()).to.equal(newAddress);
  });

  it("should pause and unpause the contract", async function () {
    await tyktoNft.pause();
    expect(await tyktoNft.paused()).to.equal(true);
    await tyktoNft.unpause();
    expect(await tyktoNft.paused()).to.equal(false);
  });

  it("should mint new tokens when ETH sent is sufficient", async function () {
    await tyktoNft.updateMaxSupply(1);
    const mintPrice = await tyktoNft.mintPrice();
    const tokenId = await tyktoNft.tokenIdCounter();
    await expect(() =>
      tyktoNft.safeMint(addr1.address, "token-uri")
    ).to.changeEtherBalance(addr1, -mintPrice);
    expect(await tyktoNft.ownerOf(tokenId)).to.equal(addr1.address);
    expect(await tyktoNft.tokenURI(tokenId)).to.equal("token-uri");
  });

  it("should revert minting when ETH sent is insufficient", async function () {
    await expect(
      tyktoNft.safeMint(addr1.address, "token-uri")
    ).to.be.revertedWith("Not enough ETH sent; check price!");
  });
});
