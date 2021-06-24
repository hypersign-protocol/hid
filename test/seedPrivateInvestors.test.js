const HIDVesting = artifacts.require("HIDVesting");
const HID = artifacts.require("HID");
const config = require('../config');
const BigNumber = require('bignumber.js');

const { vesting } = config;


function convertToken(amount) {
    amount = amount * Math.pow(10, config.DECIMALS)
    return BigNumber(amount.toString());
}

function getDateFromEpoch(epoch){
    let date = new Date(epoch * 1000);
    return `${epoch} :: ${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}



contract("HIDVesting", accounts => {
    const admin = accounts[0];    
    const PERCENTAGE_MULTIPLIER = 100; // to handle float types.
    const MILLIONS = 1000000;
    const MILLISECONDS = 1000;
    const seedAndPrivateInvestorAccount = accounts[1];
    
    const initalTokenBalance = vesting.seedAndPrivate.totalAmountToBeVested;
    const expectedNumberOfIntervals = (100 * PERCENTAGE_MULTIPLIER) / vesting.seedAndPrivate.payOutPercentage;
    const totalStartCliffAndWaitTime = vesting.seedAndPrivate.startTime + vesting.seedAndPrivate.cliffDuration + vesting.seedAndPrivate.waitDuration;
    const expectedCliffTime = vesting.seedAndPrivate.startTime + vesting.seedAndPrivate.cliffDuration; // in secods
    const expectedWaitTime = expectedCliffTime + vesting.seedAndPrivate.waitDuration; // in secods
    
    const vestingContractAddress = HIDVesting.address;
    
    let instance;
    let tokenInstance;

    beforeEach(async() => {
        instance = await HIDVesting.deployed();
        tokenInstance = await HID.deployed();
    })

    function  itShouldVerifyVestingSchedule(i){
        describe(`vesting schedule for round ${i + 1}`, async () => {
            const unlockPercentage = ((i + 1) * vesting.seedAndPrivate.payOutPercentage);
            const unlockTime = totalStartCliffAndWaitTime + (i * vesting.seedAndPrivate.payOutInterval);
            const unlockTokens = convertToken((initalTokenBalance * unlockPercentage) / (100 * PERCENTAGE_MULTIPLIER));
            
            it(`Should be able to unlock at ${unlockTime}`, async () => {
                const result = await instance.getBenificiaryVestingSchedules(seedAndPrivateInvestorAccount, i);
                assert.equal(result[0], unlockTime);
            });
    
            it(`Should be able to unlock tokens percentage ${unlockPercentage}`, async () => {
                const result = await instance.getBenificiaryVestingSchedules(seedAndPrivateInvestorAccount, i);
                assert.equal(result[1], unlockPercentage);
            });
    
            it(`Should be able to unlock tokens ${unlockTokens}`, async () => {
                const result = BigNumber(await instance.getVestedAmount(seedAndPrivateInvestorAccount, i));    
                assert.equal(0, unlockTokens.comparedTo(result));
            });
        })
        
    }

    async function itShouldTryToReleaseFundsAfter(after){
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try{
                    const spInvestorBalance_before = BigNumber(await tokenInstance.balanceOf(seedAndPrivateInvestorAccount));
                    await instance.release(seedAndPrivateInvestorAccount, {from : seedAndPrivateInvestorAccount});
                    const spInvestorBalance_after = BigNumber(await tokenInstance.balanceOf(seedAndPrivateInvestorAccount));
                    console.log({
                        spInvestorBalance_before,
                        spInvestorBalance_after
                    })
                    resolve({
                        spInvestorBalance_before,
                        spInvestorBalance_after
                    })
                }catch(e){
                    reject(e.message);
                }

            }, after)
        })
    }

    describe("Vesting for seed & private investors", async() => {
        /**
         * Token Economy for seed & private investors
         * --------------------------------------------------------------------------------
         * seed    : 10% at TGE, cliff for 1 month, then 10% for 9 months
         * private : 15% at TGE, cliff for 1 month, then 10% for 8 months, last month is 5%
         * --------------------------------------------------------------------------------
         * Cliff Duration = 1 months
         * Waiting Duration = 0 months
         * Payout Percentage = 10%
         * Payout Interval = 1 months
         * Beneficiary Addr = seedInvestor
         * Initial tokes = 5,100,000 HID
         */

         

        it(`intial token should be ${initalTokenBalance / MILLIONS}`, async () => {
            const initalTokens = convertToken(vesting.seedAndPrivate.totalAmountToBeVested);
            
            // first transfer HID to vesting contract
            await tokenInstance.transfer(vestingContractAddress, initalTokens, { from: admin });
            
            contractBalance = BigNumber(await instance.getBalance());

            assert.equal(0, initalTokens.comparedTo(contractBalance));
        });        

        it(`there should be ${expectedNumberOfIntervals} interval in which tokens should be unlocked`, async () => {
            const result = await instance.getBeneVestingDetails(seedAndPrivateInvestorAccount);            
            assert.equal(result[0], expectedNumberOfIntervals);
        });

        it("should be able to set startTime " + vesting.seedAndPrivate.startTime + " properly", async () => {
            assert.equal(vesting.seedAndPrivate.startTime, await instance.start());
        })

        it(`should be able to set clifftime ${expectedCliffTime} properly` , async () => {
            assert.equal(expectedCliffTime, await instance.cliff());
        })

        it("should be able to set waitTime " +expectedWaitTime+ "  properly", async () => {
            assert.equal(expectedWaitTime, await instance.waitTime());
        })

        // verify all vesting schedules;  unlocktime and unlockpercentage
        describe("Verifying vesting schedules", async ()=>{
            for(i = 0; i < expectedNumberOfIntervals; i++){
                // const i = 0
                itShouldVerifyVestingSchedule(i)   
            }
        });
        
        describe("Fund releaes", async () => {      
            
            it("beneficiary should NOT be able to release fund during cliff", () => {

                const de = (new Date()).getTime() - ((expectedCliffTime - vesting.seedAndPrivate.startTime) * MILLISECONDS);
                try{
                    itShouldTryToReleaseFundsAfter(withinCliffPeriod)
                }catch()
                setTimeout(() => {
                    try{
                        itShouldTryToReleaseFunds();
                    }catch(e){}
                }, withinCliffPeriod)
            })

            it("beneficiary should NOT be able to release fund during waitTime", () => {

                const waitTimePeriod = (expectedWaitTime - vesting.seedAndPrivate.cliffDuration) * MILLISECONDS;
                setTimeout(() => {
                    try{
                        itShouldTryToReleaseFunds();
                    }catch(e){}
                }, waitTimePeriod)
            })

            it("beneficiary should be able to release fund after waitTime: for slot 1", () => {

                const afterWaitTime =  (expectedWaitTime + (0 * vesting.seedAndPrivate.payOutInterval)) * MILLISECONDS;
                setTimeout(() => {
                        itShouldTryToReleaseFunds();
                }, afterWaitTime)
            })

            it("beneficiary should be able to release fund after waitTime: for slot 2", () => {

                const afterWaitTime =  (expectedWaitTime + (1 * vesting.seedAndPrivate.payOutInterval)) * MILLISECONDS;
                setTimeout(() => {
                        itShouldTryToReleaseFunds();
                }, afterWaitTime)
            })



            return;
            it("beneficiary should be able to release fund on or after waittime", async () => {

                // amountToSpend = 
                // { from: admin }
                const spInvestorBalance_before = await tokenInstance.balanceOf(seedAndPrivateInvestorAccount);

                await instance.release(seedAndPrivateInvestorAccount, {from : seedAndPrivateInvestorAccount});

                const spInvestorBalance_after = await tokenInstance.balanceOf(seedAndPrivateInvestorAccount);
                
                console.log({
                    spInvestorBalance_before,
                    spInvestorBalance_after
                })
                // asert.equal(spInvestorBalance_after, spInvestorBalance_before + )
                // assert.equal(
                //     0,
                //     spInvestorBalance_after.comparedTo(aliceBalance_before.plus(amountToSpend)), // comparedTo return 0 if two bignumbers are same; Ref: https://mikemcl.github.io/bignumber.js/#cmp
                //     "Amount wasn't correctly taken from the sender"
                // )
            })
        })

    })
});