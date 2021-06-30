import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "@ethersproject/contracts";
import { NFTLabStoreMarketplaceVariant } from "typechain";
import { BigNumberish } from "ethers";

describe("NFTLabStoreMarketplace - minting test", function () {
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

  it("Should let owner mint", async () => {
    const nft = {
      cid: "contentID",
      metadataCid: "metadataContentID",
    };

    await expect(nftLabStore.mint(signers[1].address, nft))
      .to.emit(nftLabStore, "Minted")
      .withArgs(signers[1].address, nft.cid, nft.metadataCid);

    const totalSupply: BigNumberish = await nftLabStore.totalSupply();
    await expect(totalSupply).to.be.equal(1);
  });

  it("Should not let anyone but the owner to mint", async () => {
    const nft = {
      cid: "contentID",
      metadataCid: "metadataContentID",
    };

    await expect(
      nftLabStore.connect(signers[1]).mint(signers[0].address, nft)
    ).to.be.revertedWith("");

    const totalSupply: BigNumberish = await nftLabStore.totalSupply();
    await expect(totalSupply).to.be.equal(0);
  });

  it("Should not let mint an already minted nft", async () => {
    const nft = {
      cid: "contentID",
      metadataCid: "metadataContentID",
    };

    await expect(nftLabStore.mint(signers[0].address, nft))
      .to.emit(nftLabStore, "Minted")
      .withArgs(signers[0].address, nft.cid, nft.metadataCid);

    expect(nftLabStore.mint(signers[0].address, nft)).to.be.revertedWith(
      "Token already exists"
    );
  });

  it("Should not let mint an already minted nft based only on CID", async () => {
    let nft = {
      cid: "contentID",
      metadataCid: "metadataContentID",
    };

    await expect(nftLabStore.mint(signers[0].address, nft))
      .to.emit(nftLabStore, "Minted")
      .withArgs(signers[0].address, nft.cid, nft.metadataCid);

    nft.metadataCid = "anotherMetadataContentID";

    expect(
      nftLabStore.connect(signers[0]).mint(signers[0].address, nft)
    ).to.be.revertedWith("Token already exists");
  });
});
