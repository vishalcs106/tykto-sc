//deployment script for tykto platform

const hre = require("hardhat");

async function main() {
  const TyktoPlatform = await hre.ethers.getContractFactory("EventFactory");
  const tyktoTokenAddress = "0xDa7d15fcD79794DCfCAA06A32262c9cb00B165a9";
  //const tyktoPlatform = await TyktoPlatform.deploy(tyktoTokenAddress);
  const tyktoPlatform = await hre.upgrades.deployProxy(TyktoPlatform, [tyktoTokenAddress]);
  await tyktoPlatform.deployed();

  console.log("TyktoPlatform deployed to:", tyktoPlatform.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
