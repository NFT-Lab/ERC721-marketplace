import { ethers } from 'ethers';
import hardhat from 'hardhat';

async function deploy(name: String, symbol: String) {
  const NFTLabStore = await hardhat.ethers.getContractFactory("NFTLabStore");
  const nftls = await NFTLabStore.deploy(name, symbol);

  await nftls.deployed();

  console.log("Base account: " + (await hardhat.ethers.getSigners())[0].address)
  console.log("Generated at: " + nftls.address);
}

deploy("Token name", "TKNS").then(() => {
  console.log("done.")
}).catch(error => {
  console.log(error)
})