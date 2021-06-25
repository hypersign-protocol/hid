// SPDX-License-Identifier: MIT

pragma solidity 0.6.2;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
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
    uint256 public waitTime;

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

    constructor(
        IERC20 _token, // HID token address
        address _beneficiary, // address of beneficiary
        uint256 _startTime, // start time in seconds (epoch time)
        uint256 _cliffDuration, // cliff duration in seconds
        uint256 _waitDuration, // wait duration after cliff in seconds
        uint256 _payOutPercentage, // % (in multiple of 100 i.e 12.50% = 1250) funds released in each interval.
        uint256 _payOutInterval, // intervals (in seconds) at which funds will be released
        bool _revocable
    ) public {
        
        require(_beneficiary != address(0), "HIDVesting: beneficiary is the zero address");
        
        // Need to check this later .. it was not working
        // require(_startTime  > block.timestamp, "HIDVesting: start time is before current time");

        require(_payOutInterval > 0, "HIDVesting: payout interval is 0");

        require(_payOutInterval > 0, "HIDVesting: payout interval is 0");

        require(_payOutPercentage > 0, "HIDVesting: payout percentage is 0");

        require(_payOutPercentage <= (100 * PERCENTAGE_MULTIPLIER), "HIDVesting: payout percentage is more than 100%");

        // this I need to find out why it is required. It was copied fromm Zepplin vest contract
        require(_cliffDuration <= _payOutInterval, "HIDVesting: cliff is longer than payout interval");
        
        /**
         *  Example explanation
            start = 12:03  1624429980
            cliff = 2 min
            wt = 1 min
            interval = 2 min

            st = start + cliff + wt
            
            it = 1000 HID

            0.  12:03 0%   0                        1624429980              0
            1.  12:06 20%   st + (0 * interval)     1624430160      it         200
            2.  12:08 40%   st + (1 * interval)     1624430280              400
            3.  12:10 60%   st + (2 * interval)     1624430400              600
            4.  12:12 80%   st + (3 * interval)     1624430520              800
            5.  12:14 100%  st + (4 * interval)     1624430640              1000 
        
        */
        // 33.33
        // 3333

        /////Preparing vesting schedule
        // Calcualting in how many intervals the tokens will be unlocked
        // WARNING: _payOutPercentage should be even number, otherwise it might wrong calcualtion
        uint256 numberOfPayouts = (100 * PERCENTAGE_MULTIPLIER) /
            _payOutPercentage;
        
        // Get total time before the unlock starts
        uint256 st = _startTime + _cliffDuration + _waitDuration;

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

        // vestingData = vesting;

        start = _startTime;
        cliff = start + _cliffDuration;
        waitTime = cliff + _waitDuration;
        hidToken = _token;
        beneficiary = _beneficiary;

        // Need to use this later
        revocable = _revocable;
    }

    function getBenificiaryVestingSchedules(
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

    function getBeneVestingDetails()
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

    function getBalance() public view returns (uint256) {
        return hidToken.balanceOf(address(this));
    }

    function release() public onlyBeneficiary {
        //
        require(
            block.timestamp > cliff,
            "No funds can be released during cliff period"
        );

        // no funds to be released before waitTime
        require(
            block.timestamp >= waitTime,
            "No funds can be released during waiting period"
        );

        Vesting storage v = vestingData;

        // Figure out the slot : index for % payout & payout time
        uint256 index;
        
        if (v.lastUnlockedTime == 0) {
            // Release tokens for first slot
            index = 0;
        } else if( block.timestamp > v.vestingSchedules[ v.numberOfVestingPeriods - 1].unlockTime ){
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

        v.lastUnlockedTime = v.vestingSchedules[index].unlockTime;
        v.totalUnlockedAmount += unreleased;
        totalReleasedAmount += unreleased;

        hidToken.safeTransfer(beneficiary, unreleased);
    }

    function getReleasableAmount(uint256 _index)
        private
        view
        returns (uint256)
    {
        return getVestedAmount(_index) - vestingData.totalUnlockedAmount;
    }

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
