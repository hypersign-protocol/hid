// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title HID token contract with ERC20 specification
/// @notice You can use this contract for managing states of HID tokens
contract HID is ERC20 {

    /// @notice initiates HID token contract passed initial supply
    /// @param initialSupply total numebr of HID token
    constructor(uint256 initialSupply) ERC20("Hypersign Identity Token", "HID") {
        _mint(msg.sender, initialSupply);
    }
}





