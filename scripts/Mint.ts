import hardhat from "hardhat";
import {
  ETHMarketplace,
  ETHMarketplace__factory,
  NFTLabStoreMarketplaceVariant,
  NFTLabStoreMarketplaceVariant__factory,
} from "typechain";

async function Mint(
  address: string,
  to: string,
  nft: { cid: string; metadataCid: string }
) {
  const ETHMarketplaceFactory = (await hardhat.ethers.getContractFactory(
    "ETHMarketplace"
  )) as ETHMarketplace__factory;
  const ETHMarketplace = (await ETHMarketplaceFactory.attach(
    address
  )) as ETHMarketplace;
  const StoreAddress = await ETHMarketplace.getStorage();
  const NFTLabStoreFactory = (await hardhat.ethers.getContractFactory(
    "NFTLabStoreMarketplaceVariant"
  )) as NFTLabStoreMarketplaceVariant__factory;
  const NFTLabStore = (await NFTLabStoreFactory.attach(
    StoreAddress
  )) as NFTLabStoreMarketplaceVariant;

  await NFTLabStore.mint(to, nft);
}

for (let i = 0; i < 10; i++) {
  Mint(
    // rinkeby contract deployed
    "0xc2539eA9909d10FD512F079280967f1543e9D583",
    "0x344bb1D56393cc2DB8b523d7670FD9f4C8079977",
    { cid: "hash" + i, metadataCid: "metadataHash" }
  )
    .then(() => {
      console.log("done.");
    })
    .catch((error) => {
      console.log(error);
    });
}
