const HID = artifacts.require("HID");
const HIDSeedAndPrivateInvestors = artifacts.require("HIDSeedAndPrivateInvestors");
const HIDLiquidityProvision = artifacts.require("HIDLiquidityProvision");
const HIDReserveFunds = artifacts.require("HIDReserveFunds");
const HIDTeamAndAdvisory = artifacts.require("HIDTeamAndAdvisory");
const HIDBDAndPartnership = artifacts.require("HIDBDAndPartnership");


const { vesting } = require('../config');

module.exports = function(deployer) {
    const { seedAndPrivate, liquidityProvision, teamAndAdvisory, reserveFunds, bdAndPartnerShip } = vesting;
    console.log(seedAndPrivate)
    deployer.deploy(
        HIDSeedAndPrivateInvestors,
        HID.address,
        seedAndPrivate.beneficiary,
        seedAndPrivate.startTime,
        seedAndPrivate.cliffDuration,
        seedAndPrivate.payOutPercentage,
        seedAndPrivate.payOutInterval,
        seedAndPrivate.revocable);

        return;
    deployer.deploy(
        HIDLiquidityProvision,
        HID.address,
        liquidityProvision.beneficiary,
        liquidityProvision.startTime,
        liquidityProvision.cliffDuration,
        liquidityProvision.payOutPercentage,
        liquidityProvision.payOutInterval,
        liquidityProvision.revocable);

    deployer.deploy(
        HIDTeamAndAdvisory,
        HID.address,
        teamAndAdvisory.beneficiary,
        teamAndAdvisory.startTime,
        teamAndAdvisory.cliffDuration,
        teamAndAdvisory.payOutPercentage,
        teamAndAdvisory.payOutInterval,
        teamAndAdvisory.revocable);

    deployer.deploy(
        HIDReserveFunds,
        HID.address,
        reserveFunds.beneficiary,
        reserveFunds.startTime,
        reserveFunds.cliffDuration,
        reserveFunds.payOutPercentage,
        reserveFunds.payOutInterval,
        reserveFunds.revocable);
    
    deployer.deploy(
        HIDBDAndPartnership,
        HID.address,
        bdAndPartnerShip.beneficiary,
        bdAndPartnerShip.startTime,
        bdAndPartnerShip.cliffDuration,
        bdAndPartnerShip.payOutPercentage,
        bdAndPartnerShip.payOutInterval,
        bdAndPartnerShip.revocable);
};

