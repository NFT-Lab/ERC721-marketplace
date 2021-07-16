import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import {
  BadToken,
  ERC20Marketplace,
  NFTLabStoreMarketplaceVariant,
} from "typechain";

describe("ERC20Marketplace - get trades", function () {
  let signers: SignerWithAddress[];
  let nftLabMarketplace: ERC20Marketplace;
  let nftLabStore: NFTLabStoreMarketplaceVariant;
  let NFT = {
    cid: "cid",
    metadataCid: "metadataCid",
    image: true,
    music: false,
    video: false,
  };

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

    const badToken = (await badTokenFactory.deploy()) as BadToken;

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
      badToken.approve(nftLabMarketplace.address, 10000);
    });
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

  it("Should get all the active trades", async () => {
    nftLabStore.mint(signers[1].address, NFT);
    const tokenID = await nftLabStore.tokenOfOwnerByIndex(
      signers[1].address,
      0
    );
    expect(await nftLabMarketplace.connect(signers[1]).openTrade(tokenID, 1))
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(0, "Open");

    const trade = await nftLabMarketplace
      .connect(signers[1])
      .getTradeOfNft(tokenID);

    expect(await nftLabMarketplace.getTrade(trade)).not.to.be.null;
  });
});
