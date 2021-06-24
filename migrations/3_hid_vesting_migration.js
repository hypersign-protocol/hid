const HID = artifacts.require("HID");
const HIDVesting = artifacts.require("HIDVesting");
const { vesting } = require('../config');

module.exports = function(deployer) {
    const { seedAndPrivate } = vesting;
    deployer.deploy(
        HIDVesting,
        HID.address,
        "0x31beAb2d3cCD79b589A181f3fAb5fc5B6530d2E8",
        seedAndPrivate.startTime,
        seedAndPrivate.cliffDuration,
        seedAndPrivate.waitDuration,
        seedAndPrivate.payOutPercentage,
        seedAndPrivate.payOutInterval,
        seedAndPrivate.revocable);
};

