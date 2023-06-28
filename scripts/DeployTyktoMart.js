//deployment script for tykto mart

const hre = require("hardhat");

async function main() {
  const tyktoNftAddress = "0x6eE5fd6FB00dE90944c4734FA986Ecc6bf142969";
  const tyktoTokenAddress = "0x4Df3F8F71e1aB54524BFd223024680867D432acb";
  const TyktoMart = await hre.ethers.getContractFactory("TyktoMart");
  //const tyktoMart = await TyktoMart.deploy(tyktoNftAddress, tyktoTokenAddress);
  const tyktoMart = await hre.upgrades.deployProxy(TyktoMart, [tyktoNftAddress, tyktoTokenAddress]);
  await tyktoMart.deployed();

  console.log("TyktoMart deployed to:", tyktoMart.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
