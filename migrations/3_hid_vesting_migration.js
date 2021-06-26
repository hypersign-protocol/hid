const HID = artifacts.require("HID");
const HIDSeedAndPrivateInvestors = artifacts.require("HIDSeedAndPrivateInvestors");
// const HIDLiquidityProvision = artifacts.require("HIDLiquidityProvision");

// const HIDReserveFunds = artifacts.require("HIDReserveFunds");
// const HIDTeamAndAdvisory = artifacts.require("HIDTeamAndAdvisory");
// const HIDBDAndPartnership = artifacts.require("HIDBDAndPartnership");


const { vesting } = require('../config');

module.exports = function(deployer) {
    const { seedAndPrivate } = vesting;
    deployer.deploy(
        HIDSeedAndPrivateInvestors,
        HID.address,
        seedAndPrivate.beneficiary,
        seedAndPrivate.startTime,
        seedAndPrivate.cliffDuration,
        seedAndPrivate.payOutPercentage,
        seedAndPrivate.payOutInterval,
        seedAndPrivate.revocable);


    // deployer.deploy(
    //     HIDSeedAndPrivateInvestors,
    //     HID.address,
    //     seedAndPrivate.beneficiary,
    //     seedAndPrivate.startTime,
    //     seedAndPrivate.cliffDuration,
    //     seedAndPrivate.payOutPercentage,
    //     seedAndPrivate.payOutInterval,
    //     seedAndPrivate.revocable);

    
    

};

