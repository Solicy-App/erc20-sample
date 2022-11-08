// import { HardhatUserConfig } from "hardhat/config";
// import "@nomicfoundation/hardhat-toolbox";

// const config: HardhatUserConfig = {
//   solidity: "0.8.17",
//   // networks: {
//   //   host: "127.0.0.1",
//   // }
// };

// export default config;

require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.1",
  networks: {
    localganache: {
      url: process.env.PROVIDER_URL,
      accounts: [`72c17498e86bb630e7888072350caac3c361a679b4b492734012bafc7d52f74e`]
    }
  }
};