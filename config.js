

const MINUTE = 60;

module.exports = {
    TOTAL_SUPPLY: 50000000,
    TOKEN_NAME: "Hypersign Identity Token",
    TOKEN_SYMBOL: "HID",
    DECIMALS: 18,
    vesting:{
        seedAndPrivate : {
            token : "0x9491fae7A7CAAF993EAcB34a8Fc4848c9d1AB8C6", // HID token address
            beneficiary : "0x31beAb2d3cCD79b589A181f3fAb5fc5B6530d2E8", // address of beneficiary
            startTime :  Math.ceil((new Date().getTime()) / 1000),    // start time in seconds (epoch time)
            cliffDuration : (2 * MINUTE), // cliff duration in seconds
            waitDuration : (2 * MINUTE), // wait duration after cliff in seconds
            payOutPercentage : 1000, // % (in multiple of 100 i.e 12.50% = 1250) funds released in each interval.
            payOutInterval : (1 * MINUTE), // intervals (in seconds) at which funds will be released
            revocable : true, 
            totalAmountToBeVested: 5100000
        }
    }
}
