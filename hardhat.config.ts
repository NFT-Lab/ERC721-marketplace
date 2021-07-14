import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@openzeppelin/hardhat-upgrades';
import { HardhatUserConfig } from 'hardhat/types';

import 'solidity-coverage';

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
      hardhat: {},
      ganache: {
	  url: "http://localhost:8545"
      },
      kovan: {
	  url: "",
	  accounts: [
	      ""
	  ]
      }

  },
  solidity: {
    version: '0.8.0',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
      outputSelection: {
        '*': {
          '*': ['storageLayout']
        }
      }
    },
  }
};

export default config;
