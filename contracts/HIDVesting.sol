// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title HID simple vesting contract.
 * @dev A token holder contract that can release its token balance periodically
 * to beneficiary
 */
contract HIDVesting {
    
    using SafeERC20 for IERC20;

    // Hypersign identity token interface
    IERC20 private hidToken;

    // emit event when token is released
    event TokensReleased(uint256 amount, uint256 timestamp);

    // beneficiary account
    address private beneficiary;
    
    // cliff time
    uint256 private cliff;

    // start time
    uint256 private start;

    // interval at which token will be released
    uint256 private payOutInterval;

    // struct to keep info about each vesting schedule
    struct VestingSchedule {
        uint256 unlockTime;
        uint256 unlockPercentage;
    }

    // struct to keep information about vesting
    struct VestingInfo {
        VestingSchedule[] vestingSchedules;
        uint256 numberOfVestingPeriods;
        uint256 totalUnlockedAmount;
    }

    uint256 PERCENTAGE_MULTIPLIER = 100;
    uint256 totalReleasedAmount = 0;
    
    VestingInfo vestingInfo;
    
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
    */
    constructor(
        IERC20  _token,
        address _beneficiary,
        uint256 _startTime,
        uint256 _cliffDuration,
        uint256 _payOutPercentage,
        uint256 _payOutInterval
    ) {
        
        require(_beneficiary != address(0), "HIDVesting: beneficiary is the zero address");
        
        require(_payOutInterval > 0, "HIDVesting: payout interval is 0");

        require(_payOutInterval > 0, "HIDVesting: payout interval is 0");

        require(_payOutPercentage > 0, "HIDVesting: payout percentage is 0");

        require(_payOutPercentage <= (100 * PERCENTAGE_MULTIPLIER), "HIDVesting: payout percentage is more than 100%");

        
        // Calcualting in how many intervals the tokens will be unlocked        
        uint256 numberOfPayouts = (100 * PERCENTAGE_MULTIPLIER) / _payOutPercentage;
        
        // Get total time before the unlock starts
        uint256 st = _startTime + _cliffDuration;

        // preparing vesting schedules
        for (uint256 i = 0; i < numberOfPayouts; i++) {
            vestingInfo.vestingSchedules.push(VestingSchedule({
                    unlockPercentage: (i + 1) * _payOutPercentage,
                    unlockTime: st + (i * _payOutInterval)
                }));
        }
        
        vestingInfo.numberOfVestingPeriods = numberOfPayouts;
        vestingInfo.totalUnlockedAmount = 0;        

        start = _startTime;
        cliff = start + _cliffDuration;
        hidToken = _token;
        beneficiary = _beneficiary;
        payOutInterval = _payOutInterval;

    }

    /**
     * @return the beneficiary of the tokens.
     */
    function getBeneficiary() public view returns (address) {
        return beneficiary;
    }

    /**
     * @return cliff end date
     */
    function getCliff() public view returns (uint256) {
        return cliff;
    }

    /**
     * @return start time or TGE date
     */
    function getStart() public view returns (uint256) {
        return start;
    }

    /**
     * @notice Returns vesting schedule at each index
     * @param _index index of vestingSchedules array
     */
    function getVestingSchedule(
        uint256 _index
    ) public view returns (uint256, uint256) {
        return (
            vestingInfo
                .vestingSchedules[_index]
                .unlockTime,
            vestingInfo
                .vestingSchedules[_index]
                .unlockPercentage
        );
    }

    /**
     * @notice Returns info about current vesting period
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
            vestingInfo
                .numberOfVestingPeriods,
            vestingInfo
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
     * @notice Returns total vested amount
     */
    function getInitialBalance() public view returns (uint256) {
        uint256 currentBalance = getBalance();
        uint256 totalBalance = currentBalance + vestingInfo.totalUnlockedAmount; // this was the initial balance
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
        uint256 index =  (block.timestamp - cliff) / payOutInterval;
        
        uint256 unreleased = getReleasableAmount(index);

        require(unreleased > 0, "HIDVesting: no tokens are due");

        VestingInfo storage v = vestingInfo;
        v.totalUnlockedAmount += unreleased;
        
        totalReleasedAmount += unreleased;

        // Transfer tokens
        hidToken.safeTransfer(beneficiary, unreleased);

        // Raising event
        emit TokensReleased(unreleased, block.timestamp);
    }

    /**
     * @dev Calcualtes releasable amount for beneficiary
     * @param _index index of vestingSchedules array
     */
    function getReleasableAmount(uint256 _index)
        private
        view
        returns (uint256)
    {
        return getVestedAmount(_index) - vestingInfo.totalUnlockedAmount;
    }

    /**
     * @dev Calcualtes vestable amount for beneficiary for current time
     * @param _index index of vestingSchedules array
     */
    function getVestedAmount(uint256 _index)
        public
        view
        returns (uint256)
    {        
        uint256 totalBalance = getInitialBalance();

        return
            (totalBalance * vestingInfo.vestingSchedules[_index].unlockPercentage) /
            (100 * PERCENTAGE_MULTIPLIER);
    }
}
