// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./HIDVesting.sol";


contract HIDReserveFunds is HIDVesting {
    constructor(
             IERC20  _token,
            address _beneficiary,
            uint256 _startTime,
            uint256 _cliffDuration,
            uint256 _payOutPercentage,
            uint256 _payOutInterval,
            bool    _revocable
        )   HIDVesting(
                _token,
                _beneficiary,
                _startTime,
                _cliffDuration,
                _payOutPercentage,
                _payOutInterval,
                _revocable
            )
            {}
}