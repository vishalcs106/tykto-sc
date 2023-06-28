//deploymeet script for tykto token

const hre = require("hardhat");

async function main() {
  const TyktoToken = await hre.ethers.getContractFactory("Tyk");
  const tyktoToken = await TyktoToken.deploy();

  await tyktoToken.deployed();

  console.log("TyktoToken deployed to:", tyktoToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
