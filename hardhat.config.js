require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config()

require('@openzeppelin/hardhat-upgrades');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
const accounts = await hre.ethers.getSigners();

for (const account of accounts) {
  console.log(account.address);
}
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
* @type import('hardhat/config').HardhatUserConfig
*/
module.exports = {
solidity: "0.8.9",
defaultNetwork: "fuji",
networks: {
  hardhat: {
    forking: {
      enabled: true,
      url : process.env.INFURA_URL
    },
    chainId: 137
  },
  fuji: {
    url: 'https://api.avax-test.network/ext/bc/C/rpc',
    chainId: 43113,
    accounts: [process.env.PRIVATE]
  },
  mumbai: {
    url: 'https://matic-mumbai.chainstacklabs.com',
    chainId: 80001,
    accounts: [process.env.PRIVATE]
  }

},
  etherscan:{
    apiKey: process.env.POLYGONSCAN_API_KEY
  }
};
