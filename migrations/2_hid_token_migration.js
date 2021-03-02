const HID = artifacts.require("HID");
const config = require('../config');
const BigNumber = require('bignumber.js')
module.exports = function(deployer) {
    const t = config.TOTAL_SUPPLY * Math.pow(10, config.DECIMALS);
    deployer.deploy(HID, BigNumber(t));
};