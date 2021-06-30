import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "@ethersproject/contracts";
import { NFTLabStore } from "typechain";
import { BigNumberish } from "ethers";

describe("baseURI test", function () {
  let nftLabStore: NFTLabStore;
  let signers: SignerWithAddress[];
  let nftLabStoreFactory: ContractFactory;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    nftLabStoreFactory = await ethers.getContractFactory(
      "NFTLabStore",
      signers[0]
    );

    nftLabStore = (await nftLabStoreFactory.deploy(
      "NFTLab",
      "NFTL"
    )) as NFTLabStore;
  });

  it("Should burn an existing token", async () => {
    const nft = {
      cid: "contentID",
      metadataCid: "metadataContentID",
    };

    await nftLabStore.mint(nft);

    const tokenID: BigNumberish = await nftLabStore.getTokenId(nft.cid);
    await nftLabStore.burn(tokenID);
    await expect(nftLabStore.getNFTByHash(nft.cid)).to.be.revertedWith(
      "Unable to get a non-existent NFT."
    );
  });
});