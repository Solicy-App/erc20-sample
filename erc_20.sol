// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/token/ERC20/ERC20.sol";

contract SolicyCoinERC20 is ERC20 {
    mapping(address => bool) blackList;
    uint8 _fee;
    address public owner;

    constructor(uint8 __fee) ERC20("Solicy", "SOL"){
        owner = msg.sender;
        _fee = __fee;
        _mint(msg.sender, 10 ** 10);
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier tockenOwner (address user) {
        require(msg.sender == user);
        _;
    }

    function addToBlackList(address user) external {
        blackList[user] = true;
    }

    function delFromBlackList(address user) external {
        delete blackList[user];
    }

    function burn(address account, uint256 amount) external virtual tockenOwner(account) {
        _burn(account, amount);
    }

    function mint() pure public {
        require(false, "Mint action blocked in this contract");
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        require(!blackList[recipient], "some message");
        transferFrom(_msgSender(), recipient, amount);
        return true;
    }


    function setFee(uint8 fee) public onlyOwner {
        _fee = fee;
    }
}