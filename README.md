# ERC721 Marketplace
## Description
This repo contains the contracts (along with their tests) to build an ERC721 marketplace on ethereum, wich underlying currency can either be ethereum itself (with _eth_) or an IERC20 implementation ([Openzeppelin's implementation](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/token/ERC20) or your custom implementation).

## Usage
```bash
npm i
npm run compile
```
- compile the contracts
- deploy them trough the provided scripts trough an ethereum node ([Infura](infura.io) provides some for free)
- build a frontend that handles contract calls (I suggest [metamask](metamask.io) apis combined with [ethers](https://github.com/ethers-io/ethers.js/) to interact with your contract)
- deploy (if your site is a single page site build for example with angular or react i also suggesto [ipfs](ipfs.io) to deploy it for free)

### Tests
All the contracts are tested with hardhat (and compiled with it), the tests are available in the `test` folder and can be executed with
```bash
npm run test
```

## Contributing
For every feature request submit a pull request and if useful and meaningful wil certainly be approved by someone.

### Standards
all the code to be integrated has to be formatted with [prettier](prettier.io). Fortunately we provide an easy way to do so, just run
```bash
npm run prettify
```
and your code will automatically be formatted, so that everything is uniform. After that commit and make your pull request

## Documentation
Documentation for architectural and implementation decisions can be found on the [wiki](/wiki) page