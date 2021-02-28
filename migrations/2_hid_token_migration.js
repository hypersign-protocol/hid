const HID = artifacts.require("HID");
// const config = require('../config_txt')

module.exports = function(deployer) {
    deployer.deploy(HID,
        5000,
        "Hypersign Token",
        8,
        "HID");
};