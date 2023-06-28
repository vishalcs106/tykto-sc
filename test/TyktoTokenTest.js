const { expect } = require("chai");

describe("TyktoToken", function () {
  let TyktoToken;
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    TyktoToken = await ethers.getContractFactory("TyktoToken");
    token = await TyktoToken.deploy();
    await token.deployed();
  });

  it("should have correct name, symbol, and decimals", async function () {
    expect(await token.name()).to.equal("Tykto");
    expect(await token.symbol()).to.equal("Tyk");
    expect(await token.decimals()).to.equal(18);
  });

  it("should grant roles to the deployer", async function () {
    expect(
      await token.hasRole(await token.DEFAULT_ADMIN_ROLE(), owner.address)
    ).to.equal(true);
    expect(
      await token.hasRole(await token.PAUSER_ROLE(), owner.address)
    ).to.equal(true);
    expect(
      await token.hasRole(await token.MINTER_ROLE(), owner.address)
    ).to.equal(true);
  });

  it("should pause and unpause the token", async function () {
    await token.pause();
    expect(await token.paused()).to.equal(true);
    await token.unpause();
    expect(await token.paused()).to.equal(false);
  });

  it("should mint new tokens", async function () {
    const initialSupply = await token.totalSupply();
    const amount = ethers.utils.parseEther("100");
    await token.mint(addr1, amount);
    expect(await token.totalSupply()).to.equal(initialSupply.add(amount));
    expect(await token.balanceOf(addr1)).to.equal(amount);
  });

  it("should not allow transfers when paused", async function () {
    await token.pause();
    const amount = ethers.utils.parseEther("100");
    await token.mint(addr1, amount);
    await expect(
      token.connect(addr1).transfer(addr2, amount)
    ).to.be.revertedWith("ERC20Pausable: token transfer while paused");
  });
});
