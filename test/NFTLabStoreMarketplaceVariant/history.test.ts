import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "@ethersproject/contracts";
import { NFTLabStoreMarketplaceVariant } from "typechain";
import { BigNumberish } from "ethers";

describe("history test", function () {
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

  it("Should return the right amount of history items", async () => {
    const nft = {
      cid: "contentID",
      metadataCid: "metadataContentID",
    };

    await nftLabStore.mint(signers[0].address, nft);
    const tokenID: BigNumberish = await nftLabStore.getTokenId(nft.cid);

    expect((await nftLabStore.getHistory(tokenID)).length).to.be.equal(1);

    await nftLabStore["safeTransferFrom(address,address,uint256)"](
      signers[0].address,
      signers[1].address,
      tokenID
    );

    expect((await nftLabStore.getHistory(tokenID)).length).to.be.equal(2);
  });
});
