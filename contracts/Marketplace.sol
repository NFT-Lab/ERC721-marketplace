// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./NFTLabStoreMarketplaceVariant.sol";

/**
 * @title NFTLabMarketplace
 * @notice Implements a ERC721 token marketplace. The market will be governed
 * by the Ethereum currency, and an ERC721 token that represents the
 * ownership of the items being traded. Only ads for selling items are
 * implemented. The item tokenization is responsibility of the ERC721 contract
 * which should encode any item details.
 */
contract Marketplace is Ownable {
    event TradeStatusChange(uint256 id, string status);

    NFTLabStoreMarketplaceVariant tokenHandler;

    struct Trade {
        address payable poster;
        uint256 item;
        uint256 price;
        bytes32 status; // Open, Executed, Cancelled
    }

    mapping(uint256 => Trade) trades;
    mapping(address => uint256[]) addressToTrades;
    mapping(uint256 => uint256) nftToActivetrade;

    using Counters for Counters.Counter;
    Counters.Counter private tradeCounter;

    constructor(string memory _name, string memory _symbol) {
        tokenHandler = new NFTLabStoreMarketplaceVariant(_name, _symbol);
    }

    /**
     * @dev Returns the details for a trade.
     * @param _trade The id for the trade.
     */
    function getTrade(uint256 _trade)
        public
        view
        virtual
        returns (
            address,
            uint256,
            uint256,
            bytes32
        )
    {
        Trade memory trade = trades[_trade];
        return (trade.poster, trade.item, trade.price, trade.status);
    }

    /**
     * @dev Returns all the trades of an address
     * @param addr the addres of wich you want to get all the trades
     */
    function getTradesOfAddress(address addr)
        public
        view
        virtual
        returns (uint256[] memory)
    {
        return addressToTrades[addr];
    }

    /**
     * @dev Returns the active trade of an NFT, 0 if no active trades are in place
     * @param _nft the nft of wich fetch the active trade
     */
    function getTradeOfNft(uint256 _nft) public view virtual returns (uint256) {
        return nftToActivetrade[_nft];
    }

    /**
     * @dev Opens a new trade. Puts _item in escrow.
     * @param _item The id for the item to trade.
     * @param _price The amount of currency for which to trade the item.
     */
    function openTrade(uint256 _item, uint256 _price) external virtual {
        tokenHandler._marketTransfer(msg.sender, address(this), _item);
        tradeCounter.increment();
        trades[tradeCounter.current()] = Trade({
            poster: payable(msg.sender),
            item: _item,
            price: _price,
            status: "Open"
        });
        addressToTrades[msg.sender].push(tradeCounter.current());
        nftToActivetrade[_item] = tradeCounter.current();
        emit TradeStatusChange(tradeCounter.current(), "Open");
    }

    /**
     * @dev Executes a trade. Must have approved this contract to transfer the
     * amount of currency specified to the poster. Transfers ownership of the
     * item to the filler.
     * @param _trade The id of an existing trade
     */
    function executeTrade(uint256 _trade) external payable virtual {
        Trade memory trade = trades[_trade];
        _checkPayment(msg.value, trade.price);
        require(trade.status == "Open", "Trade is not open");
        bool sent = _pay(msg.sender, trade.poster, trade.price);
        require(sent, "Failed to send eth to pay the art");
        tokenHandler._marketTransfer(address(this), msg.sender, trade.item);
        delete nftToActivetrade[trade.item];
        trades[_trade].status = "Executed";
        emit TradeStatusChange(_trade, "Executed");
    }

    /**
     * @dev Pays the reciver the selected amount;
     * @param from the sender of the payament
     * @param to the reciver of the payament
     * @param amount amount to pay
     */
    function _pay(address from, address payable to, uint256 amount) internal virtual returns (bool) {
	(bool sent, ) = to.call{value: amount}("");
	return sent;
    }

    /**
     * @dev Checks wether the payment is legible to operate a transaction or not
     * @param sent amount sent
     * @param price price of the NFT
     */
    function _checkPayment(uint256 sent, uint256 price) internal virtual {
	require(
            sent >= price,
            "You should pay the price of the token to get it"
        );
    }

    /**
     * @dev Cancels a trade made by the poster, the NFT returns to the
     * poster.
     * @param _trade The trade to be cancelled.
     */
    function cancelTrade(uint256 _trade) external virtual {
        Trade memory trade = trades[_trade];
        require(
            msg.sender == trade.poster,
            "Trade can be cancelled only by poster."
        );
        require(trade.status == "Open", "Trade is not open");
        tokenHandler._marketTransfer(address(this), trade.poster, trade.item);
        trades[_trade].status = "Cancelled";
        delete nftToActivetrade[trade.item];
        emit TradeStatusChange(_trade, "Cancelled");
    }

    /**
     * @dev Returns the NFTLabStorage address to interact with nfts.
     * The trade logic handles everything that regards moving tokens
     * when they are put on a trade (so that owners cannot open a
     * trade and then move them), this way the owner of an nft can do
     * whatever he wants with it, even give it for free to someone
     * else
     */
    function getStorage() external view returns (address) {
        return address(tokenHandler);
    }
}
