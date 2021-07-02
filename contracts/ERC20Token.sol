// SPDX-License-Identifier: GPT-3
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BadToken is ERC20 {
    constructor() ERC20("BadToken", "BT") {
        _mint(msg.sender, 1000);
    }

    function juice() public {
        _mint(msg.sender, 1000);
    }
}
