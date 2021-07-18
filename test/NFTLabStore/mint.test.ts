import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "@ethersproject/contracts";
import { NFTLabStore } from "typechain";
import { BigNumberish } from "ethers";

describe("NFTLabStore - minting test", function () {
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
      image: true,
      music: false,
      video: false,
    };

    await expect(nftLabStore.connect(signers[1]).mint(signers[1].address, nft))
      .to.emit(nftLabStore, "Minted")
      .withArgs(
        signers[1].address,
        nft.cid,
        nft.metadataCid,
        nft.image,
        nft.music,
        nft.video
      );

    const totalSupply: BigNumberish = await nftLabStore.totalSupply();
    await expect(totalSupply).to.be.equal(1);
  });

  it("Should not let mint an already minted nft", async () => {
    const nft = {
      cid: "contentID",
      metadataCid: "metadataContentID",
      image: false,
      music: true,
      video: false,
    };

    await expect(nftLabStore.connect(signers[1]).mint(signers[1].address, nft))
      .to.emit(nftLabStore, "Minted")
      .withArgs(
        signers[1].address,
        nft.cid,
        nft.metadataCid,
        nft.image,
        nft.music,
        nft.video
      );

    expect(
      nftLabStore.connect(signers[0]).mint(signers[1].address, nft)
    ).to.be.revertedWith("Token already exists");
  });

  it("Should not let mint an already minted nft based only on CID", async () => {
    let nft = {
      cid: "contentID",
      metadataCid: "metadataContentID",
      image: true,
      music: false,
      video: false,
    };

    await expect(nftLabStore.connect(signers[1]).mint(signers[1].address, nft))
      .to.emit(nftLabStore, "Minted")
      .withArgs(
        signers[1].address,
        nft.cid,
        nft.metadataCid,
        nft.image,
        nft.music,
        nft.video
      );

    nft.metadataCid = "anotherMetadataContentID";

    expect(
      nftLabStore.connect(signers[0]).mint(signers[2].address, nft)
    ).to.be.revertedWith("Token already exists");
  });
});
