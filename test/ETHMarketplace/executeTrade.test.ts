import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { ETHMarketplace, NFTLabStoreMarketplaceVariant } from "typechain";
import { sign } from "crypto";

describe("ETHMarketplace - execute trade", function () {
  let signers: SignerWithAddress[];
  let nftLabMarketplaceFactory: ContractFactory;
  let nftLabMarketplace: ETHMarketplace;
  let nftLabStore: NFTLabStoreMarketplaceVariant;
  let nftLabStoreFactory: ContractFactory;
  let NFT = {
    cid: "cid",
    metadataCid: "metadataCid",

    image: true,
    music: false,
    video: false,
  };
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

  it("Should execute an open trade", async () => {
    nftLabStore.mint(signers[1].address, {
      cid: "cid",
      metadataCid: "metadataCid",
      image: true,
      music: false,
      video: false,
    });

    expect(await nftLabMarketplace.connect(signers[1]).openTrade(1, 1000))
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(1, "Open");

    expect(
      await nftLabMarketplace
        .connect(signers[2])
        .executeTrade(1, { value: ethers.utils.parseEther("1") })
    )
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

    expect(
      await nftLabMarketplace
        .connect(signers[1])
        .openTrade(1, ethers.utils.parseEther("1"))
    )
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(1, "Open");

    await expect(
      nftLabMarketplace
        .connect(signers[2])
        .executeTrade(1, { value: ethers.utils.parseEther("0.5") })
    ).to.be.revertedWith("You should pay the price of the token to get it");
  });

  it("Should execute an open trade", async () => {
    nftLabStore.mint(signers[1].address, {
      cid: "cid",
      metadataCid: "metadataCid",
      image: true,
      music: false,
      video: false,
    });

    expect(
      await nftLabMarketplace
        .connect(signers[1])
        .openTrade(1, ethers.utils.parseEther("1"))
    )
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(1, "Open");

    expect(
      await nftLabMarketplace
        .connect(signers[2])
        .executeTrade(1, { value: ethers.utils.parseEther("1") })
    )
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(1, "Executed");
  });

  it("Should revert execute not open trade", async () => {
    nftLabStore.mint(signers[1].address, {
      cid: "cid",
      metadataCid: "metadataCid",
      image: true,
      music: false,
      video: false,
    });

    expect(
      await nftLabMarketplace
        .connect(signers[1])
        .openTrade(1, ethers.utils.parseEther("1"))
    )
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(1, "Open");

    expect(await nftLabMarketplace.connect(signers[1]).cancelTrade(1))
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(1, "Cancelled");

    await expect(
      nftLabMarketplace
        .connect(signers[2])
        .executeTrade(1, { value: ethers.utils.parseEther("1.5") })
    ).to.be.revertedWith("Trade is not open");
  });
});
