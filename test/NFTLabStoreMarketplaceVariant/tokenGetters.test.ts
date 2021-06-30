import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "@ethersproject/contracts";
import { NFTLabStoreMarketplaceVariant } from "typechain";
import { BigNumberish } from "ethers";

describe("NFTLabStoreMarketplace - token getters", function () {
  let nftLabStore: NFTLabStoreMarketplaceVariant;
  let signers: SignerWithAddress[];
  let nftLabStoreFactory: ContractFactory;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    nftLabStoreFactory = await ethers.getContractFactory(
      "NFTLabStoreMarketplaceVariant",
      signers[0]
    );

    nftLabStore = (await nftLabStoreFactory.deploy(
      "NFTLab",
      "NFTL"
    )) as NFTLabStoreMarketplaceVariant;
  });

  it("Should get nft by hash", async () => {
    const nft = {
      cid: "contentID",
      metadataCid: "metadataContentID",
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
    };

    await nftLabStore.mint(signers[0].address, nft);

    const tokenID: BigNumberish = await nftLabStore.getTokenId(nft.cid);
    expect(tokenID).to.be.equal(1);
  });

  it("Should get nft by id", async () => {
    const nft = {
      cid: "contentID",
      metadataCid: "metadataContentID",
    };

    await nftLabStore.mint(signers[0].address, nft);

    const tokenID: BigNumberish = await nftLabStore.getTokenId(nft.cid);

    const [NFTcid, NFTmetadataCid] = await nftLabStore.getNFTById(tokenID);
    expect(NFTcid).to.be.equal(nft.cid);
    expect(NFTmetadataCid).to.be.equal(nft.metadataCid);
  });
});
