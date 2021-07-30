// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Marketplace.sol";

/**
 * @title ETHMarketplace
 * @notice Implements a ERC721 token marketplace. The market will be governed
 * by the Ethereum currency, and an ERC721 token that represents the
 * ownership of the items being traded. Only ads for selling items are
 * implemented. The item tokenization is responsibility of the ERC721 contract
 * which should encode any item details.
 */
contract ETHMarketplace is Marketplace {
    constructor(string memory _name, string memory _symbol)
        Marketplace(_name, _symbol)
    {}
}
