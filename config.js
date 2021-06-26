

const TIMEUNIT = 60; // sec
const HOUR = 60 * TIMEUNIT;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;

const accounts =  [
    "0x9A74c9c5aDCEAC0dD97903bb2aF66F1E8Eec9bB9",
    "0x81a32051A7c6417E79591e239869F4179429563f",
    "0x5C6AfeEEd4AbB41E12434f7F55938c8C51a3F038",
    "0x1C04379A86A77D60e04a8838529635848aeFb182",
    "0x9417026379171dfa2e28025475236d427aA340A2",
    "0xf8Eec495d69D958F1Ecd5F27F688d47B173f0a9A",
    "0xb8B7d0121C34b0331Cf223F29e2984470BF99dE5"] //web3.eth.getAccounts();

const startTime = 1623260972;//Math.ceil((new Date("06/09/2021").getTime()) / 1000)

const vesting = {
    seedAndPrivate : {
        token : "", 
        beneficiary : accounts[1],
        startTime :  startTime,    
        cliffDuration : 2 * MONTH, 
        payOutPercentage : 1000, 
        payOutInterval : MONTH, 
        revocable : true, 
        totalAmountToBeVested: 5100000
    },
    teamAndAdvisory : {
        token : "", 
        beneficiary : accounts[2], 
        startTime :  startTime,    
        cliffDuration : 6 * MONTH, 
        payOutPercentage : 2000, 
        payOutInterval : 6 * MONTH, 
        revocable : true, 
        totalAmountToBeVested: 7500000		
    },
    reserveFunds : {
        token : "", 
        beneficiary :  accounts[3], 
        startTime :  startTime,    
        cliffDuration : 12 * MONTH, 
        payOutPercentage : 2000, 
        payOutInterval : 6 * MONTH, 
        revocable : true, 
        totalAmountToBeVested: 3750000		
    },
    liquidityProvision : {
        token : "", 
        beneficiary : accounts[4], 
        startTime :  startTime,    
        cliffDuration : 6 * MONTH, 
        payOutPercentage : 5000, 
        payOutInterval : 6 * MONTH, 
        revocable : true, 
        totalAmountToBeVested: 4000000		
    },
    bdAndPartnerShip : {
        token : "", 
        beneficiary : accounts[5], 
        startTime :  startTime,    
        cliffDuration : 3 * MONTH, 
        payOutPercentage : 1000, 
        payOutInterval : 3 * MONTH, 
        revocable : true, 
        totalAmountToBeVested: 5210000		
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


