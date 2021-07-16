import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "@ethersproject/contracts";
import { NFTLabStore } from "typechain";
import { BigNumberish } from "ethers";

describe("NFTLabStore - token getters", function () {
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

  it("Should get nft by hash", async () => {
    const nft = {
      cid: "contentID",
      metadataCid: "metadataContentID",
      image: true,
      music: false,
      video: false,
    };

    await nftLabStore.mint(signers[0].address, nft);

    const [NFTcid, NFTmetadataCid] = await nftLabStore.getNFTByHash(nft.cid);
    expect(NFTcid).to.be.equal(nft.cid);
    expect(NFTmetadataCid).to.be.equal(nft.metadataCid);
  });

  it("Should get token id by hash", async () => {
    const nft = {
      cid: "contentID",
      metadataCid: "metadataContentID",
      image: true,
      music: false,
      video: false,
    };

    await nftLabStore.mint(signers[0].address, nft);

    const tokenID: BigNumberish = await nftLabStore.getTokenId(nft.cid);
    expect(tokenID).to.be.equal(1);
  });

  it("Should revert if the token does not exist", async () => {
    await expect(
      nftLabStore.getTokenId("this-hash-does-not-exist")
    ).to.be.revertedWith("Unable to get the ID of a non-existent NFT.");
  });

  it("Should get nft by id", async () => {
    const nft = {
      cid: "contentID",
      metadataCid: "metadataContentID",
      image: true,
      music: false,
      video: false,
    };

    await nftLabStore.mint(signers[0].address, nft);

    const tokenID: BigNumberish = await nftLabStore.getTokenId(nft.cid);

    const [NFTcid, NFTmetadataCid] = await nftLabStore.getNFTById(tokenID);
    expect(NFTcid).to.be.equal(nft.cid);
    expect(NFTmetadataCid).to.be.equal(nft.metadataCid);
  });

  it("Should revert if the token does not exist", async () => {
    await expect(nftLabStore.getNFTById(1)).to.be.revertedWith(
      "Unable to get a non-existent NFT."
    );
  });
});
