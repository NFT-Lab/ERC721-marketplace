import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import {
  BadToken,
  ERC20Marketplace,
  NFTLabStoreMarketplaceVariant,
} from "typechain";

describe("ERC20Marketplace - execute trade", function () {
  let signers: SignerWithAddress[];
  let nftLabMarketplace: ERC20Marketplace;
  let nftLabStore: NFTLabStoreMarketplaceVariant;
  let badToken: BadToken;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    const nftLabMarketplaceFactory = await ethers.getContractFactory(
      "ERC20Marketplace",
      signers[0]
    );

    const nftLabStoreFactory = await ethers.getContractFactory(
      "NFTLabStoreMarketplaceVariant",
      signers[0]
    );

    const badTokenFactory = await ethers.getContractFactory(
      "BadToken",
      signers[0]
    );

    badToken = (await badTokenFactory.deploy()) as BadToken;

    nftLabMarketplace = (await nftLabMarketplaceFactory.deploy(
      badToken.address,
      "NFTlabToken",
      "NFTL"
    )) as ERC20Marketplace;

    nftLabStore = (await nftLabStoreFactory.attach(
      await nftLabMarketplace.getStorage()
    )) as NFTLabStoreMarketplaceVariant;

    // each signer has 1000 tokens
    signers.forEach(async (signer) => {
      badToken.connect(signer).juice();
      badToken.connect(signer).approve(nftLabMarketplace.address, 1000);
    });
  });

  it("Should execute an open trade", async () => {
    nftLabStore.mint(signers[1].address, {
      cid: "cid",
      metadataCid: "metadataCid",
      image: true,
      music: false,
      video: false,
    });

    expect(await nftLabMarketplace.connect(signers[1]).openTrade(1, 100))
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(1, "Open");

    expect(await nftLabMarketplace.connect(signers[2]).executeTrade(1))
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(1, "Executed");
  });

  it("Should revert execute trade with insufficent funds", async () => {
    nftLabStore.mint(signers[1].address, {
      cid: "cid",
      metadataCid: "metadataCid",
      image: true,
      music: false,
      video: false,
    });

    expect(await nftLabMarketplace.connect(signers[1]).openTrade(1, 1000000))
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(1, "Open");

    await expect(
      nftLabMarketplace.connect(signers[2]).executeTrade(1)
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });

  it("Should not execute a not open tread", async () => {
    nftLabStore.mint(signers[1].address, {
      cid: "cid",
      metadataCid: "metadataCid",
      image: true,
      music: false,
      video: false,
    });

    expect(await nftLabMarketplace.connect(signers[1]).openTrade(1, 1))
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(1, "Open");

    expect(await nftLabMarketplace.connect(signers[1]).cancelTrade(1))
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(1, "Cancelled");

    await expect(
      nftLabMarketplace.connect(signers[2]).executeTrade(1)
    ).to.be.revertedWith("Trade is not open");
  });
});
