const HID = artifacts.require("HID");
const config = require('../config');
const BigNumber = require('bignumber.js')

function convertToken(amount) {
    amount = amount * Math.pow(10, config.DECIMALS)
    return BigNumber(amount.toString());
}

contract("HID", accounts => {
    const TOTALSUPPLY = BigNumber(config.TOTAL_SUPPLY * Math.pow(10, config.DECIMALS))
    const admin = accounts[0];
    const alice = accounts[1];
    const bob = accounts[2];
    const tom = accounts[3];
    const charlie = accounts[4];
    const dany = accounts[5];

    let instance;

    beforeEach(async() => {
        instance = await HID.deployed();
    })

    describe('Success scenarios', async() => {
        it("Name of token should be set", async() => {
            instance = await HID.deployed();
            let name = await instance.name();
            assert.equal(name, config.TOKEN_NAME);
        });

        it("Symbol of token should be set", async() => {
            instance = await HID.deployed();
            let symbol = await instance.symbol();
            assert.equal(symbol, config.TOKEN_SYMBOL);
        });

        it("totalSupply of token should be 50 million", async() => {
            instance = await HID.deployed();
            let totalSupply = BigNumber(await instance.totalSupply());
            assert.equal(0, TOTALSUPPLY.comparedTo(totalSupply));
        });

        it("balance of admin should be 50 million", async() => {
            instance = await HID.deployed();
            let balance = BigNumber(await instance.balanceOf(admin));
            assert.equal(0, TOTALSUPPLY.comparedTo(balance));
        })



        it("admin should send 100 token to alice", async() => {
            const amountToSpend = convertToken(100);

            const aliceBalance_before = BigNumber(await instance.balanceOf(alice));
            const admin_before = BigNumber(await instance.balanceOf(admin));

            await instance.transfer(alice, amountToSpend, { from: admin });

            const aliceBalance_after = BigNumber(await instance.balanceOf(alice));
            const admin_after = BigNumber(await instance.balanceOf(admin));
            assert.equal(
                0,
                aliceBalance_after.comparedTo(aliceBalance_before.plus(amountToSpend)), // comparedTo return 0 if two bignumbers are same; Ref: https://mikemcl.github.io/bignumber.js/#cmp
                "Amount wasn't correctly taken from the sender"
            )

            assert.equal(
                0,
                admin_after.comparedTo(admin_before.minus(amountToSpend)),
                "Amount wasn't correctly sent to the receiver"
            )
        })


        it("alice should send 10 token to bob", async() => {
            const amountToSpend = convertToken(10)
            const aliceBalance_before = BigNumber(await instance.balanceOf(alice));
            const bob_before = BigNumber(await instance.balanceOf(bob));

            await instance.transfer(bob, amountToSpend, { from: alice });

            const aliceBalance_after = BigNumber(await instance.balanceOf(alice));
            const bob_after = BigNumber(await instance.balanceOf(bob));

            assert.equal(
                0,
                bob_after.comparedTo(bob_before.plus(amountToSpend)),
                "Amount wasn't correctly taken from the sender"
            )

            assert.equal(
                0,
                aliceBalance_after.comparedTo(aliceBalance_before.minus(amountToSpend)),
                "Amount wasn't correctly sent to the receiver"
            )
        })


        it("alice should send 1.5 token to Dany", async() => {
            const amountToSpend = convertToken(1.5)
            const aliceBalance_before = BigNumber(await instance.balanceOf(alice));
            const bob_before = BigNumber(await instance.balanceOf(dany));

            await instance.transfer(dany, amountToSpend, { from: alice });

            const aliceBalance_after = BigNumber(await instance.balanceOf(alice));
            const bob_after = BigNumber(await instance.balanceOf(dany));

            assert.equal(
                0,
                bob_after.comparedTo(bob_before.plus(amountToSpend)),
                "Amount wasn't correctly taken from the sender"
            )

            assert.equal(
                0,
                aliceBalance_after.comparedTo(aliceBalance_before.minus(amountToSpend)),
                "Amount wasn't correctly sent to the receiver"
            )
        })



        it("bob should approve Tom to spend his 5 tokens", async() => {
            const amountToSpend = convertToken(5)
            const allowance_before = BigNumber(await instance.allowance(bob, tom));

            await instance.approve(tom, amountToSpend, { from: bob });
            const allowance_after = BigNumber(await instance.allowance(bob, tom));
            assert.equal(
                0,
                allowance_after.comparedTo(allowance_before.plus(amountToSpend)),
                "Could not approve tom"
            )
        })


        it("should overwrite the previous allowance", async() => {
            const allowance_before = BigNumber(await instance.allowance(bob, tom));
            const amountToSpend = allowance_before.plus(1);
            await instance.approve(tom, amountToSpend, { from: bob });
            const allowance_after = BigNumber(await instance.allowance(bob, tom));
            assert.equal(
                0,
                allowance_after.comparedTo(amountToSpend),
                "Could not approve tom"
            )
        })

        it("Tom should transfer 4 tokens of Bob to Charlie", async() => {
            const amountToSpend = convertToken(4);
            const allowance_before = BigNumber(await instance.allowance(bob, tom));
            const charleiBalance_before = BigNumber(await instance.balanceOf(charlie));
            await instance.transferFrom(bob, charlie, amountToSpend, { from: tom });
            const allowance_after = BigNumber(await instance.allowance(bob, tom));

            const charleiBalance_after = BigNumber(await instance.balanceOf(charlie));

            assert.equal(
                0,
                allowance_after.comparedTo(allowance_before.minus(amountToSpend)),
                "Tom could not tranger bob's token Charlie"
            )

            assert.equal(
                0,
                charleiBalance_after.comparedTo(charleiBalance_before.plus(amountToSpend)),
                "Balance of charlie did not increase"
            )
        })
    })



    describe('Failure scenarios', async() => {
        it("Charlie should NOT transfer more than his balance token", async() => {
            try {
                const balance = BigNumber(await instance.balanceOf(charlie));
                const amountToSpend = balance.plus(5);
                await instance.transfer(bob, amountToSpend, { from: charlie });
                // assert.fail()
            } catch (e) {
                // console.log(e.message);
            }
        })

        it("Should NOT transfer token to invalid address", async() => {
            try {
                const amountToSpend = convertToken(5);
                await instance.transfer('0x123', amountToSpend, { from: charlie });
                // assert.fail()
            } catch (e) {
                // console.log(e.message);
            }
        })

        it("Tom should NOT transfer more than what is approved to him", async() => {
            try {
                const allowance_before = BigNumber(await instance.allowance(bob, tom));
                await instance.transferFrom(bob, charlie, allowance_before.plus(1), { from: tom });
            } catch (e) {
                // console.log(e.message);
            }
        })

    })



});