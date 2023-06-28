//deployment script to deploy TyktoNft contract

const hre = require("hardhat");

async function main() {
  const TyktoNft = await hre.ethers.getContractFactory("TyktoNft");
  const tyktoNft = await TyktoNft.deploy();

  await tyktoNft.deployed();

  console.log("TyktoNft deployed to:", tyktoNft.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
