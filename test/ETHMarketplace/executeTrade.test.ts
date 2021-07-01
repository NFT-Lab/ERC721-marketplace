import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { ETHMarketplace, NFTLabStoreMarketplaceVariant } from "typechain";

describe("ETHMarketplace - execute trade", function () {
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

    expect(await nftLabMarketplace.connect(signers[1]).openTrade(1, 1000))
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(0, "Open");

    expect(
      await nftLabMarketplace
        .connect(signers[2])
        .executeTrade(0, { value: ethers.utils.parseEther("1") })
    )
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(0, "Executed");
  });
});
