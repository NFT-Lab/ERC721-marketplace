// SPDX-License-Identifier: MIT
pragma solidity >=0.5.8;

import "./NFTLabStore.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTLabStoreMarketplaceVariant is NFTLabStore, Ownable {
    constructor(string memory _name, string memory _symbol)
        NFTLabStore(_name, _symbol)
    {}

    /**
     * @dev Forcefully transfers an NFT from `from` to `to`. since
     * does not use the safe transfer is accessible only by the owner
     * (The marketplace). The history is preserved and recorded.
     * @param from the address who currently owns the token
     * @param to the address who will own the token
     * @param tokenId the tokenId to be transferred
     */
    function _marketTransfer(
        address from,
        address to,
        uint256 tokenId
    ) public onlyOwner {
        super._transfer(from, to, tokenId);
        _recordHistory(from, to, tokenId);
        emit Transferred(tokenId, from, to, block.timestamp);
    }
}
