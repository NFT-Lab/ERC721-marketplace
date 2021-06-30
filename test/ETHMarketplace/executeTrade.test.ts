import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { MockContract, smockit } from "@eth-optimism/smock";
import { expect } from "chai";
import {
  ETHMarketplace,
  NFTLabStore,
  NFTLabStoreMarketplaceVariant,
} from "typechain";

describe("ETHMarketplace tests - execute trade", function () {
  let nftLabStore: NFTLabStoreMarketplaceVariant;
  let signers: SignerWithAddress[];
  let nftLabStoreFactory: ContractFactory;
  let nftLabMarketplaceFactory: ContractFactory;
  let nftLabMarketplace: ETHMarketplace;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    nftLabStoreFactory = await ethers.getContractFactory(
      "NFTLabStore",
      signers[0]
    );

    nftLabMarketplaceFactory = await ethers.getContractFactory(
      "ETHMarketplace",
      signers[0]
    );

    nftLabStore = (await nftLabStoreFactory.deploy(
      "NFTLabToken",
      "NFTL"
    )) as NFTLabStoreMarketplaceVariant;

    nftLabMarketplace = (await nftLabMarketplaceFactory.deploy(
      nftLabStore.address
    )) as ETHMarketplace;

    nftLabStore.mint(signers[1].address, {
      cid: "cid",
      metadataCid: "metadataCid",
    });
    nftLabStore.mint(signers[2].address, {
      cid: "cid1",
      metadataCid: "metadataCid",
    });
    nftLabStore.mint(signers[3].address, {
      cid: "cid2",
      metadataCid: "metadataCid",
    });
    nftLabStore.mint(signers[4].address, {
      cid: "cid3",
      metadataCid: "metadataCid",
    });
    console.log("minted 4 nfts");
  });

  it("Should execute an open trade", async () => {
    nftLabMarketplace.connect(signers[1]).openTrade(1, 1000);
    expect(await nftLabMarketplace.connect(signers[1]).executeTrade(0)).to.emit(
      nftLabMarketplace,
      "TradeStatusChange"
    );
  });
});
