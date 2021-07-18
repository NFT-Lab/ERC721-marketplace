import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import { HardhatUserConfig } from "hardhat/types";

import "solidity-coverage";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    ganache: {
      url: "http://localhost:8545",
    },
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/-uVxd3dNo1JIIpyWG21P7k2mzAvawVEF",
      accounts: [
        "a5b45d4f022bd4d8eba78d99c5add55005089ae363005b4dfc3a50d730bc58ad",
      ],
    },
  },
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
      outputSelection: {
        "*": {
          "*": ["storageLayout"],
        },
      },
    },
  },
};

export default config;
