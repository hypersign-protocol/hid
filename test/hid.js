const HID = artifacts.require("HID");

const TOTAL_SUPPLY = 50000000;

contract("HID", accounts => {
    // beforeEach(async function () {
    //     this.token = await HID.new(owner, 100);
    //   });

    it("totalSupply of token should be 50 million", async() => {
        let instance = await HID.deployed();
        let totalSupply = await instance.totalSupply();
        totalSupply = totalSupply.toNumber() / Math.pow(10, 2)
        assert.equal(totalSupply, TOTAL_SUPPLY);
    });

});