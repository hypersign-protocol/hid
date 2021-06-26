

const TIMEUNIT = 60; // sec

module.exports = {
    TOTAL_SUPPLY: 50000000,
    TOKEN_NAME: "Hypersign Identity Token",
    TOKEN_SYMBOL: "HID",
    DECIMALS: 18,
    vesting:{
        seedAndPrivate : {
            token : "", // HID token address
            beneficiary : "0x81a32051A7c6417E79591e239869F4179429563f", // address of beneficiary
            startTime :  Math.ceil((new Date().getTime()) / 1000),    // start time in seconds (epoch time)
            cliffDuration : (3 * TIMEUNIT), // cliff duration in seconds
            payOutPercentage : 2000, // % (in multiple of 100 i.e 12.50% = 1250) funds released in each interval.
            payOutInterval : (5 * TIMEUNIT), // intervals (in seconds) at which funds will be released
            revocable : true, 
            totalAmountToBeVested: 5100000
        },
        teamAndAdvisory : {
            token : "", // HID token address
            beneficiary : "0x81a32051A7c6417E79591e239869F4179429563f", // address of beneficiary
            startTime :  Math.ceil((new Date().getTime()) / 1000),    // start time in seconds (epoch time)
            cliffDuration : (2 * TIMEUNIT), // cliff duration in seconds
            waitDuration : (2 * TIMEUNIT), // wait duration after cliff in seconds
            payOutPercentage : 2000, // % (in multiple of 100 i.e 12.50% = 1250) funds released in each interval.
            payOutInterval : (2 * TIMEUNIT), // intervals (in seconds) at which funds will be released
            revocable : true, 
            totalAmountToBeVested: 7500000		
        }
    }
}


