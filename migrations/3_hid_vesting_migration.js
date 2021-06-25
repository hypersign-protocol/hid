const HID = artifacts.require("HID");
const HIDVesting = artifacts.require("HIDVesting");
const { vesting } = require('../config');

module.exports = function(deployer) {
    const { seedAndPrivate } = vesting;
    deployer.deploy(
        HIDVesting,
        HID.address,
        seedAndPrivate.beneficiary,
        seedAndPrivate.startTime,
        seedAndPrivate.cliffDuration,
        seedAndPrivate.waitDuration,
        seedAndPrivate.payOutPercentage,
        seedAndPrivate.payOutInterval,
        seedAndPrivate.revocable);
};

