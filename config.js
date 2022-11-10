const MINUTE = 60; 
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const WEEK = 7 * DAY;
const YEAR = 52 * WEEK;
const HALF_YEAR = 26 * WEEK;
const QUATER = 13 * WEEK;

const accounts =  [
    "0x9A74c9c5aDCEAC0dD97903bb2aF66F1E8Eec9bB9",
    "0x81a32051A7c6417E79591e239869F4179429563f",
    "0x5C6AfeEEd4AbB41E12434f7F55938c8C51a3F038",
    "0x1C04379A86A77D60e04a8838529635848aeFb182",
    "0x9417026379171dfa2e28025475236d427aA340A2",
    "0xf8Eec495d69D958F1Ecd5F27F688d47B173f0a9A",
    "0xb8B7d0121C34b0331Cf223F29e2984470BF99dE5"] //web3.eth.getAccounts();

const startTime = 1623260972; // 9 June
const vesting = {
    seedAndPrivate : {
        token : "", 
        beneficiary : accounts[1],
        startTime :  startTime,    
        cliffDuration : 2 * MONTH, 
        payOutPercentage : 1000, 
        payOutInterval : MONTH, 
        totalAmountToBeVested: 5100000
    },
    teamAndAdvisory : {
        token : "", 
        beneficiary : accounts[2], 
        startTime :  startTime,    
        cliffDuration : HALF_YEAR, 
        payOutPercentage : 2000, 
        payOutInterval : HALF_YEAR, 
        totalAmountToBeVested: 7500000		
    },
    reserveFunds : {
        token : "", 
        beneficiary :  accounts[3], 
        startTime :  startTime,    
        cliffDuration : YEAR, 
        payOutPercentage : 2000, 
        payOutInterval : QUATER, 
        totalAmountToBeVested: 3750000		
    },
    liquidityProvision : {
        token : "", 
        beneficiary : accounts[4], 
        startTime :  startTime,    
        cliffDuration : HALF_YEAR, 
        payOutPercentage : 5000, 
        payOutInterval : HALF_YEAR, 
        totalAmountToBeVested: 2000000		
    },
    bdAndPartnerShip : {
        token : "", 
        beneficiary : accounts[5], 
        startTime :  startTime,    
        cliffDuration : QUATER, 
        payOutPercentage : 1000, 
        payOutInterval : QUATER, 
        totalAmountToBeVested: 5210000		
    },
    netOpsMining : {
        token : "", 
        beneficiary : accounts[6], 
        startTime :  startTime,    
        cliffDuration : 6 * QUATER, 
        payOutPercentage : 10000, 
        payOutInterval : 1 * MONTH, 
        totalAmountToBeVested: 16000000		
    },
    memPoolVesting : {
        token : "", 
        beneficiary : "0x81a32051A7c6417E79591e239869F4179429563f", 
        startTime :  1668066344, // 9 nov    
        cliffDuration : 1, 
        payOutPercentage : 0833, 
        payOutInterval : 1 * MINUTE, 
        totalAmountToBeVested: 5000		
    }
}

// console.log(vesting)
module.exports = {
    TOTAL_SUPPLY: 50000000,
    TOKEN_NAME: "Hypersign Identity Token",
    TOKEN_SYMBOL: "HID",
    DECIMALS: 18,
    vesting
}


