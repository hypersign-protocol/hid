const HID = artifacts.require("HID");
const config = require('../config')

module.exports = function(deployer) {
    deployer.deploy(HID,
        config.TOTAL_SUPPLY,
        config.TOKEN_NAME,
        config.DECMALS,
        config.TOKEN_SYMBOL);
};