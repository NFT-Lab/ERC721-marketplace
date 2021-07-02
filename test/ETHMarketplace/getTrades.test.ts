import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { MockContract, smockit } from "@eth-optimism/smock";
import { expect } from "chai";
import { ETHMarketplace, NFTLabStoreMarketplaceVariant } from "typechain";

describe("ETHMarketplace - get trades", function () {
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

  it("Should get all the trades", async () => {
    nftLabStore.mint(signers[1].address, NFT);
    const tokenID = await nftLabStore.tokenOfOwnerByIndex(
      signers[1].address,
      0
    );
    expect(await nftLabMarketplace.connect(signers[1]).openTrade(tokenID, 1))
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(0, "Open");

    expect(
      await nftLabMarketplace
        .connect(signers[1])
        .getTradesOfAddress(signers[1].address)
    ).to.have.length(1);
  });

  it("Should get all the trades", async () => {
    nftLabStore.mint(signers[1].address, NFT);
    const tokenID = await nftLabStore.tokenOfOwnerByIndex(
      signers[1].address,
      0
    );
    expect(await nftLabMarketplace.connect(signers[1]).openTrade(tokenID, 1))
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(0, "Open");

    const trades = await nftLabMarketplace
      .connect(signers[1])
      .getTradesOfAddress(signers[1].address);
    expect(trades).to.have.length(1);

    expect(await nftLabMarketplace.getTrade(trades[0]))
      .to.contain(signers[1].address)
      .and.to.contain(ethers.utils.formatBytes32String("Open"));
  });
});
