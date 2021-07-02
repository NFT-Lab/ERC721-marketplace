import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { ETHMarketplace, NFTLabStoreMarketplaceVariant } from "typechain";

describe("ETHMarketplace tests", function () {
  let signers: SignerWithAddress[];
  let nftLabMarketplaceFactory: ContractFactory;
  let nftLabMarketplace: ETHMarketplace;
  let nftLabStore: NFTLabStoreMarketplaceVariant;
  let nftLabStoreFactory: ContractFactory;
  let NFT = { cid: "cid", metadataCid: "metadataCid" };

  beforeEach(async () => {
    signers = await ethers.getSigners();
    nftLabMarketplaceFactory = await ethers.getContractFactory(
      "ETHMarketplace",
      signers[0]
    );

    nftLabStoreFactory = await ethers.getContractFactory(
      "NFTLabStoreMarketplaceVariant",
      signers[0]
    );

    nftLabMarketplace = (await nftLabMarketplaceFactory.deploy(
      "NFTlabToken",
      "NFTL"
    )) as ETHMarketplace;

    nftLabStore = (await nftLabStoreFactory.attach(
      await nftLabMarketplace.getStorage()
    )) as NFTLabStoreMarketplaceVariant;
  });

  it("Get a non empty address of storage", async () => {
    const address = await nftLabMarketplace.getStorage();
    expect(address).to.have.length.greaterThanOrEqual(1);
  });
});
