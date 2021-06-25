const HID = artifacts.require("HID");
const HIDVesting = artifacts.require("HIDVesting");
const { vesting } = require('../config');

module.exports = function(deployer) {
    const { seedAndPrivate } = vesting;
    deployer.deploy(
        HIDVesting,
        HID.address,
        "0x81a32051A7c6417E79591e239869F4179429563f",
        seedAndPrivate.startTime,
        seedAndPrivate.cliffDuration,
        seedAndPrivate.waitDuration,
        seedAndPrivate.payOutPercentage,
        seedAndPrivate.payOutInterval,
        seedAndPrivate.revocable);
};

