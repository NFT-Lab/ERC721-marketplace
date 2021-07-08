import { ethers } from "ethers";
import hardhat from "hardhat";

async function deploy(name: String, symbol: String) {
  const ETHMarketplace = await hardhat.ethers.getContractFactory(
    "ETHMarketplace"
  );
  const nftmp = await ETHMarketplace.deploy(name, symbol);

  await nftmp.deployed();

  console.log(
    "Base account: " + (await hardhat.ethers.getSigners())[0].address
  );
  console.log("Generated at: " + nftmp.address);
}

deploy("Token name", "TKNS")
  .then(() => {
    console.log("done.");
  })
  .catch((error) => {
    console.log(error);
  });
