import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { ETHMarketplace, NFTLabStoreMarketplaceVariant } from "typechain";

describe("ETHMarketplace tests - execute trade", function () {
  let nftLabStore: NFTLabStoreMarketplaceVariant;
  let signers: SignerWithAddress[];
  let nftLabStoreFactory: ContractFactory;
  let nftLabMarketplaceFactory: ContractFactory;
  let nftLabMarketplace: ETHMarketplace;

  beforeEach(async () => {
    signers = await ethers.getSigners();

    nftLabMarketplaceFactory = await ethers.getContractFactory(
      "ETHMarketplace",
      signers[0]
    );

    nftLabMarketplace = (await nftLabMarketplaceFactory.deploy(
      "NFTLabToken",
      "NFTL"
    )) as ETHMarketplace;
  });

  it("Should execute an open trade", async () => {
    nftLabMarketplace.mint(signers[1].address, {
      cid: "cid",
      metadataCid: "metadataCid",
    });
    const tokenID = await nftLabMarketplace.tokenOfOwnerByIndex(
      signers[1].address,
      0
    );
    console.log(tokenID);
    expect(await nftLabMarketplace.connect(signers[1]).openTrade(tokenID, 1000))
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(0);
    expect(await nftLabMarketplace.connect(signers[1]).executeTrade(0)).to.emit(
      nftLabMarketplace,
      "TradeStatusChange"
    );
  });
});
