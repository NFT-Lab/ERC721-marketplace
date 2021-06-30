import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { NFTLabStoreMarketplaceVariant } from "typechain";

describe("Marketplace variant - Transfer tests", function () {
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

  it("Only owner should be able to safeTransferFrom a NFT", async () => {
    const signers = await ethers.getSigners();

    const nft = {
      cid: "NFT Cid",
      metadataCid: "Metadata Cid",
    };

    const transaction = {
      tokenId: 1,
      seller: signers[0].address,
      sellerId: 0,
      buyer: signers[1].address,
      buyerId: 1,
      price: "1 ETH",
      timestamp: "2021",
    };

    await nftLabStore.mint(signers[1].address, nft);

    const notOwnerCaller: NFTLabStoreMarketplaceVariant = nftLabStore.connect(
      signers[1]
    );

    await expect(
      notOwnerCaller.safeTransferFrom(
        transaction.seller,
        transaction.buyer,
        transaction.tokenId
      )
    ).to.be.revertedWith("ERC721: safeTransferFrom of token that is not own");
  });
});
