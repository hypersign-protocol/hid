// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TokenVesting
 * @dev A token holder contract that can release its token balance gradually like a
 * typical vesting scheme, with a cliff and vesting period. Optionally revocable by the
 * owner.
 */
contract HIDVesting is Ownable {
    // The vesting schedule is time-based (i.e. using block timestamps as opposed to e.g. block numbers), and is
    // therefore sensitive to timestamp manipulation (which is something miners can do, to a certain degree). Therefore,
    // it is recommended to avoid using short time durations (less than a minute). Typical vesting schemes, with a
    // cliff period of a year and a duration of four years, are safe to use.
    using SafeERC20 for IERC20;

    IERC20 public hidToken;

    event TokensReleased(address token, uint256 amount);
    event TokenVestingRevoked(address token);

    // beneficiary of tokens after they are released
    address public beneficiary;

    // Durations and timestamps are expressed in UNIX time, the same units as block.timestamp.
    uint256 public cliff;
    uint256 public start;
    uint256 private duration;

    bool private revocable;

    mapping(address => uint256) private released;
    mapping(address => bool) private _revoked;

    struct VestingSchedule {
        uint256 unlockTime;
        uint256 unlockPercentage;
    }

    struct Vesting {
        VestingSchedule[] vestingSchedules;
        uint256 numberOfVestingPeriods;
        uint256 totalUnlockedAmount;
        uint256 lastUnlockedTime;
    }

    uint256 PERCENTAGE_MULTIPLIER = 100;
    uint256 totalReleasedAmount = 0;

    Vesting[] vestings; // only used to initialised 
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
    * @param  _startTime start time in seconds (epoch time)
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
        
        // Need to check this later .. it was not working
        // require(_startTime  > block.timestamp, "HIDVesting: start time is before current time");

        require(_payOutInterval > 0, "HIDVesting: payout interval is 0");

        require(_payOutInterval > 0, "HIDVesting: payout interval is 0");

        require(_payOutPercentage > 0, "HIDVesting: payout percentage is 0");

        require(_payOutPercentage <= (100 * PERCENTAGE_MULTIPLIER), "HIDVesting: payout percentage is more than 100%");

        // this I need to find out why it is required. It was copied fromm Zepplin vest contract
        require(_cliffDuration <= _payOutInterval, "HIDVesting: cliff is longer than payout interval");
        
        /////Preparing vesting schedule
        // Calcualting in how many intervals the tokens will be unlocked
        
        // WARNING: _payOutPercentage should be even number, otherwise it might wrong calcualtion
        uint256 numberOfPayouts = (100 * PERCENTAGE_MULTIPLIER) / _payOutPercentage;
        
        // Get total time before the unlock starts
        uint256 st = _startTime + _cliffDuration;

        // Prepare vesting schedule list
        vestingData = vestings.push();
        for (uint256 i = 0; i < numberOfPayouts; i++) {
            vestingData.vestingSchedules.push(
                VestingSchedule({
                    unlockPercentage: (i + 1) * _payOutPercentage,
                    unlockTime: st + (i * _payOutInterval)
                })
            );
        }

        vestingData.numberOfVestingPeriods = numberOfPayouts;
        vestingData.totalUnlockedAmount = 0;
        vestingData.lastUnlockedTime = 0;        

        start = _startTime;
        cliff = start + _cliffDuration;
        hidToken = _token;
        beneficiary = _beneficiary;

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
            uint256,
            uint256
        )
    {
        return (
            vestingData
                .numberOfVestingPeriods,
            vestingData
                .totalUnlockedAmount,
            vestingData.lastUnlockedTime
        );
    }

    /**
     * @notice Returns current HID balance of this contract 
     */
    function getBalance() public view returns (uint256) {
        return hidToken.balanceOf(address(this));
    }

    /**
     * @notice Releases funds to the beneficiary
     */
    function release() public onlyBeneficiary {
        //
        require(
            block.timestamp > cliff,
            "HIDVesting: No funds can be released during cliff period"
        );

        Vesting storage v = vestingData;

        // Figure out the slot : index for % payout & payout time
        uint256 index;
        
        if (v.lastUnlockedTime == 0) {
            // Release tokens for first slot
            index = 0;
        } else if( block.timestamp >= v.vestingSchedules[ v.numberOfVestingPeriods - 1].unlockTime ){
            // Release all tokens after completing all vesting periods
            index = v.numberOfVestingPeriods - 1;
        } else {
            // Releae tokes between slot 2 to last - 1;
            for (uint256 i = 1; i < v.numberOfVestingPeriods; i++) {
                if (
                    block.timestamp > v.lastUnlockedTime &&
                    block.timestamp <= v.vestingSchedules[i].unlockTime
                ) {
                    index = i;
                    break;
                }
            }
        }

        uint256 unreleased = getReleasableAmount(index);

        require(unreleased > 0, "HIDVesting: no tokens are due");

        v.lastUnlockedTime = v.vestingSchedules[index].unlockTime;
        v.totalUnlockedAmount += unreleased;
        totalReleasedAmount += unreleased;

        hidToken.safeTransfer(beneficiary, unreleased);
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
        public
        view
        returns (uint256)
    {
        // Vesting storage v = vestingData;

        uint256 currentBalance = hidToken.balanceOf(address(this));
        uint256 totalBalance = currentBalance + vestingData.totalUnlockedAmount; // this was the initial balance

        // VestingSchedule memory vs = vestingData.vestingSchedules[_index];
        return
            (totalBalance * vestingData.vestingSchedules[_index].unlockPercentage) /
            (100 * PERCENTAGE_MULTIPLIER);
    }
}
