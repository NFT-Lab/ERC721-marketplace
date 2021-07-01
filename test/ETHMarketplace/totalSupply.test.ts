import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { MockContract, smockit } from "@eth-optimism/smock";
import { expect } from "chai";
import { ETHMarketplace } from "typechain";

describe("ETHMarketplace - total supply", function () {
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

  it("Should get right toalSupply", async () => {
    nftLabMarketplace.mint(signers[1].address, {
      cid: "cid",
      metadataCid: "metadataCid",
    });

    const total = await nftLabMarketplace.totalSupply();
    expect(total).to.be.equal(1);
  });
});
