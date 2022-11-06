require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
//module.exports = {
  //solidity: "0.8.17",
//};

require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

//let skale = "https://eth-sf.skalenodes.com/v1/hackathon-content-live-vega";
let skale = "https://eth-sf.skalenodes.com/v1/hackathon-complex-easy-naos";

module.exports = {
  //defaultNetwork: "skale",
  defaultNetwork: "hardhat",
  networks: {
      hardhat: {
		  },
      matic: {
		    url: "https://rpc-mumbai.maticvigil.com",
		    accounts: [process.env.PRIVATE_KEY]
		  },
	skale: {
	     url: skale,
	     accounts: [process.env.PRIVATE_KEY],
	     gasPrice: 0
	 },
	},
  etherscan: {
	      apiKey: process.env.POLYGONSCAN_API_KEY
	    },
  solidity: {
	      version: "0.8.9",
	      //version: "0.8.0",
  //solidity: "0.8.17",
	      settings: {
			    optimizer: {
					    enabled: true,
					    runs: 200
					  }
			  }
	    },
}
