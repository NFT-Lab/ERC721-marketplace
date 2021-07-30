// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Marketplace.sol";

/**
 * @title ERC20Marketplace
 * @notice Implements the classifieds board market. The market will be governed
 * by an ERC20 token as currency, and an NFTLabMarketplaceVariant that represents the
 * ownership of the items being traded. Only ads for selling items are
 * implemented. The item tokenization is responsibility of the ERC721 contract
 * which should encode any item details.
 */
contract ERC20Marketplace is Marketplace {

    IERC20 currencyToken;

    constructor(
        address _currencyTokenAddress,
        string memory _name,
        string memory _symbol
    ) Marketplace(_name, _symbol) {

        currencyToken = IERC20(_currencyTokenAddress);
        tokenHandler = new NFTLabStoreMarketplaceVariant(_name, _symbol);
    }

    function _pay(address from, address payable to, uint256 amount) internal override returns (bool) {
	return currencyToken.transferFrom(from, to, amount);
    }

    function _checkPayment(uint256 sent, uint256 price) internal override {}
}
