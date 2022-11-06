import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";

// Provide your wallet private key
// let privateKey = "[YOUR_PRIVATE_KEY]";
//
 //Provide your SKALE endpoint address
 let skale = "https://eth-sf.skalenodes.com/v1/hackathon-content-live-vega";

 const config: HardhatUserConfig = {
   defaultNetwork: "skale",
     solidity: {
         version: '0.8.0',
             settings: {
                   optimizer:{
                           enabled: true,
                                   runs: 200
                                         }
                                             }
                                               },
                                                 networks: {
                                                     skale: {
                                                             url: skale,
                                                                     accounts: b0c9764cd76567bf7c1afc7f041d3449a29828d1d4de1a2d24e5a30327b19780,
                                                                             gasPrice: 0
                                                                                 }
                                                                                   }
                                                                                   };

                                                                                   export default config;
