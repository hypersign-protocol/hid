// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title HID Vesting factory contract.
 * @dev A token holder contract that can release its token balance periodically
 * as per token economy. 
 * This is modified version of Openzeppelin's Vesting contract
 */
contract HIDVesting is Ownable {
    // This 
    using SafeERC20 for IERC20;
    IERC20 public hidToken;

    event TokensReleased(uint256 amount, uint256 timestamp);

    address public beneficiary;
    uint256 public cliff;
    uint256 public start;
    uint256 private duration;
    bool private revocable;

    struct VestingSchedule {
        uint256 unlockTime;
        uint256 unlockPercentage;
    }

    struct Vesting {
        VestingSchedule[] vestingSchedules;
        uint256 numberOfVestingPeriods;
        uint256 totalUnlockedAmount;
    }

    uint256 PERCENTAGE_MULTIPLIER = 100;
    uint256 totalReleasedAmount = 0;

    Vesting vestingData;

    /**
     * @notice Only allow calls from the beneficiary of the vesting contract
     */
    modifier onlyBeneficiary() {
        require(msg.sender == beneficiary);
        _;
    }

    /**
    * @notice Initialises the contract with required parameters
    * @param  _token HID token contract address
    * @param  _beneficiary address of beneficiary
    * @param  _startTime start time in seconds
    * @param  _cliffDuration cliff duration in second    
    * @param  _payOutPercentage % (in multiple of 100 i.e 12.50% = 1250) funds released in each interval.
    * @param  _payOutInterval intervals (in seconds) at which funds will be released
    * @param  _revocable is contract revokable by owner or not
    */
    constructor(
        IERC20  _token,
        address _beneficiary,
        uint256 _startTime,
        uint256 _cliffDuration,
        uint256 _payOutPercentage,
        uint256 _payOutInterval,
        bool    _revocable
    ) {
        
        require(_beneficiary != address(0), "HIDVesting: beneficiary is the zero address");
        
        require(_payOutInterval > 0, "HIDVesting: payout interval is 0");

        require(_payOutInterval > 0, "HIDVesting: payout interval is 0");

        require(_payOutPercentage > 0, "HIDVesting: payout percentage is 0");

        require(_payOutPercentage <= (100 * PERCENTAGE_MULTIPLIER), "HIDVesting: payout percentage is more than 100%");

        // this I need to find out why it is required. It was copied fromm Zepplin vest contract
        // require(_cliffDuration <= _payOutInterval, "HIDVesting: cliff is longer than payout interval");
        
        /////Preparing vesting schedule

        // Calcualting in how many intervals the tokens will be unlocked        
        uint256 numberOfPayouts = (100 * PERCENTAGE_MULTIPLIER) / _payOutPercentage;
        
        // Get total time before the unlock starts
        uint256 st = _startTime + _cliffDuration;

        // Prepare vesting schedule list
        for (uint256 i = 0; i < numberOfPayouts; i++) {
            vestingData.vestingSchedules[i] = VestingSchedule({
                    unlockPercentage: (i + 1) * _payOutPercentage,
                    unlockTime: st + (i * _payOutInterval)
                });
        }

        vestingData.numberOfVestingPeriods = numberOfPayouts;
        vestingData.totalUnlockedAmount = 0;        

        start = _startTime;
        cliff = start + _cliffDuration;
        hidToken = _token;
        beneficiary = _beneficiary;
        duration = _payOutInterval;

        // Need to use this later
        revocable = _revocable;
    }

    /**
     * @notice Returns vesting schedule at each index
     * @param _index index of vestingSchedules array
     */
    function getVestingSchedule(
        uint256 _index
    ) public view returns (uint256, uint256) {
        return (
            vestingData
                .vestingSchedules[_index]
                .unlockTime,
            vestingData
                .vestingSchedules[_index]
                .unlockPercentage
        );
    }

    /**
     * @notice Returns detials of current vesting perriod
     */
    function getCurrentVestingDetails()
        public
        view
        returns (
            uint256,
            uint256
        )
    {
        return (
            vestingData
                .numberOfVestingPeriods,
            vestingData
                .totalUnlockedAmount
        );
    }

    /**
     * @notice Returns current HID balance of this contract 
     */
    function getBalance() public view returns (uint256) {
        return hidToken.balanceOf(address(this));
    }

    /**
     * @notice Returns initial balance
     */
    function getInitialBalance() public view returns (uint256) {
        uint256 currentBalance = getBalance();
        uint256 totalBalance = currentBalance + vestingData.totalUnlockedAmount; // this was the initial balance
        return totalBalance;
    }

    /**
     * @notice Releases funds to the beneficiary
     */
    function release() public onlyBeneficiary {
        require(
            block.timestamp > cliff,
            "HIDVesting: No funds can be released during cliff period"
        );

        // calcualting installment number
        uint256 index =  (block.timestamp - cliff) / duration;
        
        uint256 unreleased = getReleasableAmount(index);

        require(unreleased > 0, "HIDVesting: no tokens are due");

        Vesting storage v = vestingData;
        v.totalUnlockedAmount += unreleased;
        
        totalReleasedAmount += unreleased;

        // Transfer tokens
        hidToken.safeTransfer(beneficiary, unreleased);

        // Raising event
        emit TokensReleased(unreleased, block.timestamp);
    }

    /**
     * @notice Calcualtes releasable amount for beneficiary
     * @param _index index of vestingSchedules array
     */
    function getReleasableAmount(uint256 _index)
        private
        view
        returns (uint256)
    {
        return getVestedAmount(_index) - vestingData.totalUnlockedAmount;
    }

    /**
     * @notice Calcualtes vestable amount for beneficiary for current time
     * @param _index index of vestingSchedules array
     */
    function getVestedAmount(uint256 _index)
        private
        view
        returns (uint256)
    {        
        uint256 totalBalance = getInitialBalance();

        return
            (totalBalance * vestingData.vestingSchedules[_index].unlockPercentage) /
            (100 * PERCENTAGE_MULTIPLIER);
    }
}
