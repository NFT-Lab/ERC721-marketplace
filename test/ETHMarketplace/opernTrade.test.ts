import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { MockContract, smockit } from "@eth-optimism/smock";
import { expect } from "chai";
import { ETHMarketplace } from "typechain";

describe("ETHMarketplace tests", function () {
  let mockedStore: MockContract;
  let signers: SignerWithAddress[];
  let nftLabStoreFactory: ContractFactory;
  let nftLabMarketplaceFactory: ContractFactory;
  let nftLabMarketplace: ETHMarketplace;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    nftLabStoreFactory = await ethers.getContractFactory(
      "NFTLabStore",
      signers[0]
    );

    nftLabMarketplaceFactory = await ethers.getContractFactory(
      "ETHMarketplace",
      signers[0]
    );

    mockedStore = await smockit(nftLabStoreFactory);

    nftLabMarketplace = (await nftLabMarketplaceFactory.deploy(
      mockedStore.address
    )) as ETHMarketplace;
  });

  it("Should open a new trade", async () => {
    await expect(nftLabMarketplace.openTrade(1, 1)).to.emit(
      nftLabMarketplace,
      "TradeStatusChange"
    );
  });

  it("Should not open a new trade if sender does not own the article", async () => {
    mockedStore.smocked[
      "safeTransferFrom(address,address,uint256)"
    ].will.revert();
    await expect(nftLabMarketplace.openTrade(1, 1)).to.be.revertedWith("");
  });
});
