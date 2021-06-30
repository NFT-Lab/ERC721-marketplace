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

  it("Should execute an open trade", async () => {
    nftLabMarketplace.openTrade(1, 1);
    await expect(nftLabMarketplace.executeTrade(0)).to.emit(
      nftLabMarketplace,
      "TradeStatusChange"
    );
  });

  it("Should not open a new trade if sender does not own the article", async () => {
    nftLabMarketplace.openTrade(1, 10);
    await expect(
      nftLabMarketplace.connect(signers[1]).executeTrade(0)
    ).to.be.revertedWith("");
  });
});
