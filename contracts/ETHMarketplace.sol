// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title NFTLabMarketplace
 * @notice Implements a ERC721 token marketplace. The market will be governed
 * by the Ethereum currency, and an ERC721 token that represents the
 * ownership of the items being traded. Only ads for selling items are
 * implemented. The item tokenization is responsibility of the ERC721 contract
 * which should encode any item details.
 */
contract NFTLabETHMarketplace {
    event TradeStatusChange(uint256 ad, bytes32 status);

    IERC721 itemToken;

    struct Trade {
        address poster;
        uint256 item;
        uint256 price;
        bytes32 status; // Open, Executed, Cancelled
    }

    mapping(uint256 => Trade) trades;
    mapping(address => uint256[]) addressToTrades;

    using Counters for Counters.Counter;
    Counters.Counter private tradeCounter;

    constructor(address _itemTokenAddress)
    {
        itemToken = IERC721(_itemTokenAddress);
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
     * @dev Opens a new trade. Puts _item in escrow.
     * @param _item The id for the item to trade.
     * @param _price The amount of currency for which to trade the item.
     */
    function openTrade(uint256 _item, uint256 _price) public virtual {
        itemToken.transferFrom(msg.sender, address(this), _item);
        Trade memory newTrade = Trade({
            poster: msg.sender,
            item: _item,
            price: _price,
            status: "Open"
        });
        trades[tradeCounter.current()] = newTrade;
        addressToTrades[msg.sender].push(tradeCounter.current());
        tradeCounter.increment();
        emit TradeStatusChange(tradeCounter.current() - 1, "Open");
    }

    /**
     * @dev Executes a trade. Must have approved this contract to transfer the
     * amount of currency specified to the poster. Transfers ownership of the
     * item to the filler.
     * @param _trade The id of an existing trade
     */
    function executeTrade(uint256 _trade) public virtual {
        Trade memory trade = trades[_trade];
        require(trade.status == "Open", "Trade is not Open.");
        payable(trade.poster).transfer(trade.price);
        itemToken.transferFrom(address(this), msg.sender, trade.item);
        trades[_trade].status = "Executed";
        emit TradeStatusChange(_trade, "Executed");
    }

    /**
     * @dev Cancels a trade by the poster.
     * @param _trade The trade to be cancelled.
     */
    function cancelTrade(uint256 _trade) public virtual {
        Trade memory trade = trades[_trade];
        require(
            msg.sender == trade.poster,
            "Trade can be cancelled only by poster."
        );
        require(trade.status == "Open", "Trade is not Open.");
        itemToken.transferFrom(address(this), trade.poster, trade.item);
        trades[_trade].status = "Cancelled";
        emit TradeStatusChange(_trade, "Cancelled");
    }
}
