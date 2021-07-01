import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { MockContract, smockit } from "@eth-optimism/smock";
import { expect } from "chai";
import { ETHMarketplace } from "typechain";

describe("ETHMarketplace - token by index", function () {
  let signers: SignerWithAddress[];
  let nftLabMarketplaceFactory: ContractFactory;
  let nftLabMarketplace: ETHMarketplace;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    nftLabMarketplaceFactory = await ethers.getContractFactory(
      "ETHMarketplace",
      signers[0]
    );

    nftLabMarketplace = (await nftLabMarketplaceFactory.deploy(
      "NFTLab",
      "NFTL"
    )) as ETHMarketplace;
  });

  it("Should get token by index if less or equal of total supply", async () => {
    for (let i = 0; i < 10; i++) {
      nftLabMarketplace.mint(signers[Math.floor(Math.random() * 9)].address, {
        cid: "cid" + i,
        metadataCid: "metadataCid" + i,
      });
    }

    const total = await nftLabMarketplace.totalSupply();
    expect(total).to.be.equal(10);

    const tokenID = await nftLabMarketplace.connect(signers[1]).tokenByIndex(8);
      expect(tokenID).to.be.equal(9);
  });
});
