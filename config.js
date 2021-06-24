

const MINUTE = 30;

module.exports = {
    TOTAL_SUPPLY: 50000000,
    TOKEN_NAME: "Hypersign Identity Token",
    TOKEN_SYMBOL: "HID",
    DECIMALS: 18,
    vesting:{
        seedAndPrivate : {
            token : "0x9491fae7A7CAAF993EAcB34a8Fc4848c9d1AB8C6", // HID token address
            beneficiary : "0xb516f8874633e2f4Ccb1F1Ba843EDC99197D065A", // address of beneficiary
            startTime :  Math.ceil((new Date().getTime() + (2 * MINUTE)) / 1000),    // start time in seconds (epoch time)
            cliffDuration : (5 * MINUTE), // cliff duration in seconds
            waitDuration : (5 * MINUTE), // wait duration after cliff in seconds
            payOutPercentage : 1000, // % (in multiple of 100 i.e 12.50% = 1250) funds released in each interval.
            payOutInterval : (5 * MINUTE), // intervals (in seconds) at which funds will be released
            revocable : true, 
            totalAmountToBeVested: 5100000
        }
    }
}
