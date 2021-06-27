import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "@ethersproject/contracts";
import { NFTLabStore } from "typechain";
import { sign } from "crypto";

describe("NFTLabStore", function () {
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

  it("Should let everyone mint", async () => {
    const nft = {
      cid: "contentID",
      metadataCid: "metadataContentID",
    };

    await expect(nftLabStore.connect(signers[1]).mint(nft))
      .to.emit(nftLabStore, "Minted")
      .withArgs(signers[1].address, nft.cid, nft.metadataCid);
  });

  it("Should not let mint an already minted nft", async () => {
    const nft = {
      cid: "contentID",
      metadataCid: "metadataContentID",
    };

    await expect(nftLabStore.connect(signers[1]).mint(nft))
      .to.emit(nftLabStore, "Minted")
      .withArgs(signers[1].address, nft.cid, nft.metadataCid);

    expect(nftLabStore.connect(signers[0]).mint(nft)).to.be.revertedWith(
      "Token already exists"
    );
  });
});
