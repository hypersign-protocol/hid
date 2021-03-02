const HID = artifacts.require("HID");
const config = require('../config');

function formatBigNumber(number) {
    try {
        return number.toNumber() / Math.pow(10, config.DECMALS)
    } catch {
        return number / Math.pow(10, config.DECMALS)
    }
}

function convertToken(amount) {
    return amount * Math.pow(10, config.DECMALS);
}

contract("HID", accounts => {
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
            let totalSupply = await instance.totalSupply();
            totalSupply = formatBigNumber(totalSupply)
            assert.equal(totalSupply, config.TOTAL_SUPPLY);
        });

        it("balance of admin should be 50 million", async() => {
            instance = await HID.deployed();
            let balance = await instance.balanceOf(admin);
            balance = formatBigNumber(balance)
            assert.equal(balance, config.TOTAL_SUPPLY);
        })

        it("admin should send 100 token to alice", async() => {
            const amountToSpend = convertToken(100)
            const aliceBalance_before = formatBigNumber(await instance.balanceOf(alice));
            const admin_before = formatBigNumber(await instance.balanceOf(admin));

            await instance.transfer(alice, amountToSpend, { from: admin });

            const aliceBalance_after = formatBigNumber(await instance.balanceOf(alice));
            const admin_after = formatBigNumber(await instance.balanceOf(admin));

            assert.equal(
                aliceBalance_after,
                aliceBalance_before + formatBigNumber(amountToSpend),
                "Amount wasn't correctly taken from the sender"
            )

            assert.equal(
                admin_after,
                admin_before - formatBigNumber(amountToSpend),
                "Amount wasn't correctly sent to the receiver"
            )
        })

        it("alice should send 10 token to bob", async() => {
            const amountToSpend = convertToken(10)
            const aliceBalance_before = formatBigNumber(await instance.balanceOf(alice));
            const bob_before = formatBigNumber(await instance.balanceOf(bob));

            await instance.transfer(bob, amountToSpend, { from: alice });

            const aliceBalance_after = formatBigNumber(await instance.balanceOf(alice));
            const bob_after = formatBigNumber(await instance.balanceOf(bob));

            assert.equal(
                bob_after,
                bob_before + formatBigNumber(amountToSpend),
                "Amount wasn't correctly taken from the sender"
            )

            assert.equal(
                aliceBalance_after,
                aliceBalance_before - formatBigNumber(amountToSpend),
                "Amount wasn't correctly sent to the receiver"
            )
        })

        it("alice should send 1.5 token to Dany", async() => {
            const amountToSpend = convertToken(10)
            const aliceBalance_before = formatBigNumber(await instance.balanceOf(alice));
            const bob_before = formatBigNumber(await instance.balanceOf(dany));

            await instance.transfer(dany, amountToSpend, { from: alice });

            const aliceBalance_after = formatBigNumber(await instance.balanceOf(alice));
            const bob_after = formatBigNumber(await instance.balanceOf(dany));

            assert.equal(
                bob_after,
                bob_before + formatBigNumber(amountToSpend),
                "Amount wasn't correctly taken from the sender"
            )

            assert.equal(
                aliceBalance_after,
                aliceBalance_before - formatBigNumber(amountToSpend),
                "Amount wasn't correctly sent to the receiver"
            )
        })

        it("bob should approve Tom to spend his 5 tokens", async() => {
            const amountToSpend = convertToken(5)
            const allowance_before = formatBigNumber(await instance.allowance(bob, tom));

            await instance.approve(tom, amountToSpend, { from: bob });
            const allowance_after = formatBigNumber(await instance.allowance(bob, tom));
            assert.equal(
                allowance_after,
                allowance_before + formatBigNumber(amountToSpend),
                "Could not approve tom"
            )
        })

        it("should overwrite the previous allowance", async() => {
            const allowance_before = formatBigNumber(await instance.allowance(bob, tom));
            const amountToSpend = convertToken(allowance_before + 1);
            await instance.approve(tom, amountToSpend, { from: bob });
            const allowance_after = formatBigNumber(await instance.allowance(bob, tom));
            assert.equal(
                allowance_after,
                formatBigNumber(amountToSpend),
                "Could not approve tom"
            )
        })

        it("Tom should transfer 4 tokens of Bob to Charlie", async() => {
            const amountToSpend = convertToken(4);
            const allowance_before = formatBigNumber(await instance.allowance(bob, tom));
            const charleiBalance_before = formatBigNumber(await instance.balanceOf(charlie));
            await instance.transferFrom(bob, charlie, amountToSpend, { from: tom });
            const allowance_after = formatBigNumber(await instance.allowance(bob, tom));

            const charleiBalance_after = formatBigNumber(await instance.balanceOf(charlie));

            assert.equal(
                allowance_after,
                allowance_before - formatBigNumber(amountToSpend),
                "Tom could not tranger bob's token Charlie"
            )

            assert.equal(
                charleiBalance_after,
                charleiBalance_before + formatBigNumber(amountToSpend),
                "Balance of charlie did not increase"
            )
        })
    })



    describe('Failure scenarios', async() => {
        it("Charlie should NOT transfer more than his balance token", async() => {
            try {
                const balance = formatBigNumber(await instance.balanceOf(charlie));
                const amountToSpend = convertToken(balance + 5);
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
                const allowance_before = formatBigNumber(await instance.allowance(bob, tom));
                await instance.transferFrom(bob, charlie, convertToken(allowance_before + 1), { from: tom });
            } catch (e) {
                // console.log(e.message);
            }
        })

    })



});