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

  it("Should let owner transfer focefully", async () => {
    const nft = {
      cid: "contentID",
      metadataCid: "metadataContentID",
    };

    await expect(nftLabStore.mint(signers[1].address, nft))
      .to.emit(nftLabStore, "Minted")
      .withArgs(signers[1].address, nft.cid, nft.metadataCid);

    await expect(
      nftLabStore._marketTransfer(signers[1].address, signers[2].address, 1)
    ).to.emit(nftLabStore, "Transferred");
  });
});
