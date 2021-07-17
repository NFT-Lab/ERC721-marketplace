import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import {
  ERC20Marketplace,
  NFTLabStoreMarketplaceVariant,
  BadToken,
} from "typechain";

describe("ERC20Marketplace tests", function () {
  let signers: SignerWithAddress[];
  let nftLabMarketplace: ERC20Marketplace;
  let nftLabStore: NFTLabStoreMarketplaceVariant;
  let badToken: BadToken;
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
      badToken.approve(
        nftLabMarketplace.address,
        await badToken.balanceOf(signer.address)
      );
    });
  });

  it("Should cancel an open trade", async () => {
    nftLabStore.mint(signers[1].address, NFT);
    const tokenID = await nftLabStore.tokenOfOwnerByIndex(
      signers[1].address,
      0
    );
    nftLabMarketplace.connect(signers[1]).openTrade(tokenID, 10);
    await expect(nftLabMarketplace.connect(signers[1]).cancelTrade(1))
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(1, "Cancelled");
  });

  it("Only poster should be able to cancel", async () => {
    nftLabStore.mint(signers[1].address, NFT);
    const tokenID = await nftLabStore.tokenOfOwnerByIndex(
      signers[1].address,
      0
    );
    nftLabMarketplace.connect(signers[1]).openTrade(tokenID, 1);
    await expect(
      nftLabMarketplace.connect(signers[2]).cancelTrade(1)
    ).to.be.revertedWith("");
  });

  it("Only open trades can be cancelled", async () => {
    nftLabStore.mint(signers[1].address, NFT);
    const tokenID = await nftLabStore.tokenOfOwnerByIndex(
      signers[1].address,
      0
    );

    nftLabMarketplace.connect(signers[1]).openTrade(tokenID, 1);

    badToken
      .connect(signers[1])
      .increaseAllowance(nftLabMarketplace.address, 1);

    await expect(nftLabMarketplace.connect(signers[1]).executeTrade(1))
      .to.emit(nftLabMarketplace, "TradeStatusChange")
      .withArgs(1, "Executed");

    await expect(
      nftLabMarketplace.connect(signers[1]).cancelTrade(1)
    ).to.be.revertedWith("Trade is not open");
  });
});
