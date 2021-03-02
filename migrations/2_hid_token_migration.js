const HID = artifacts.require("HID");
const config = require('../config')

module.exports = function(deployer) {
    deployer.deploy(HID, config.TOTAL_SUPPLY * (Math.pow(10, config.DECMALS)));
};