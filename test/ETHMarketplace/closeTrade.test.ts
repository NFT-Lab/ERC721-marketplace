import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { MockContract, smockit } from "@eth-optimism/smock";
import { expect } from "chai";
import { ETHMarketplace } from "typechain";

describe("ETHMarketplace tests", function () {
  let signers: SignerWithAddress[];
  let nftLabMarketplaceFactory: ContractFactory;
  let nftLabMarketplace: ETHMarketplace;
  let NFT = { cid: "cid", metadataCid: "metadataCid" };

  beforeEach(async () => {
    signers = await ethers.getSigners();
    nftLabMarketplaceFactory = await ethers.getContractFactory(
      "ETHMarketplace",
      signers[0]
    );

    nftLabMarketplace = (await nftLabMarketplaceFactory.deploy(
      "NFTlabToken",
      "NFTL"
    )) as ETHMarketplace;
  });

  it("Should close an open trade", async () => {
    nftLabMarketplace.mint(signers[1].address, NFT);
    const tokenID = await nftLabMarketplace.tokenOfOwnerByIndex(
      signers[1].address,
      0
    );
    nftLabMarketplace.connect(signers[1]).openTrade(tokenID, 1);
    await expect(nftLabMarketplace.connect(signers[1]).cancelTrade(0)).to.emit(
      nftLabMarketplace,
      "TradeStatusChange"
    );
  });

  it("Only poster should be able to close", async () => {
    nftLabMarketplace.mint(signers[1].address, NFT);
    const tokenID = await nftLabMarketplace.tokenOfOwnerByIndex(
      signers[1].address,
      0
    );
    nftLabMarketplace.connect(signers[1]).openTrade(tokenID, 1);
    await expect(
      nftLabMarketplace.connect(signers[2]).cancelTrade(0)
    ).to.be.revertedWith("");
  });
});
