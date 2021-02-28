const HID = artifacts.require("HID");
// const config = require('../config_txt')

module.exports = function(deployer) {
    deployer.deploy(HID,
        50000000,
        "Hypersign Token",
        18,
        "HID");
};