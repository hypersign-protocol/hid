const HIDVesting = artifacts.require("HIDLiquidityProvision");
const HID = artifacts.require("HID");
const config = require("../config");
const BigNumber = require("bignumber.js");

const { vesting } = config;
const {getDateFromEpoch, convertToken} = require("../utils");


contract("HIDLiquidityProvision", (accounts) => {
  const admin = accounts[0];
  const PERCENTAGE_MULTIPLIER = 100; // to handle float types.
  const MILLIONS = 1000000;
  const MILLISECONDS = 1000;
  const seedAndPrivateInvestorAccount = accounts[4];

  console.log({
    hid: HID.address,
    hidVesting: HIDVesting.address,
  });

  const initalTokenBalance = vesting.liquidityProvision.totalAmountToBeVested;
  const expectedNumberOfIntervals =
    (100 * PERCENTAGE_MULTIPLIER) / vesting.liquidityProvision.payOutPercentage;
  const totalStartCliffAndWaitTime =
    vesting.liquidityProvision.startTime + vesting.liquidityProvision.cliffDuration;
  const expectedCliffTime =
    vesting.liquidityProvision.startTime + vesting.liquidityProvision.cliffDuration; // in secods
  
  const vestingContractAddress = HIDVesting.address;

  

  let instance;
  let tokenInstance;

  beforeEach(async () => {
    instance = await HIDVesting.deployed();
    tokenInstance = await HID.deployed();

  });

  function itShouldVerifyVestingSchedule(i) {
    describe(`vesting schedule for round ${i + 1}`, async () => {
      const unlockPercentage =
        (i + 1) * vesting.liquidityProvision.payOutPercentage;
      const unlockTime =
        totalStartCliffAndWaitTime + i * vesting.liquidityProvision.payOutInterval;
      const unlockTokens = convertToken(
        (initalTokenBalance * unlockPercentage) / (100 * PERCENTAGE_MULTIPLIER)
      );

      it(`Should be able to unlock at ${getDateFromEpoch(
        unlockTime
      )}`, async () => {
        const result = await instance.getVestingSchedule(i);
        assert.equal(result[0], unlockTime);

      });

      it(`Should be able to unlock tokens percentage ${unlockPercentage}`, async () => {
        const result = await instance.getVestingSchedule(i);
        assert.equal(result[1], unlockPercentage);
        //done();
      });

      it(`Should be able to unlock tokens ${unlockTokens}`, async () => {
        const result = BigNumber(await instance.getVestedAmount(i));
        assert.equal(0, unlockTokens.comparedTo(result));
        //done();
      });

    });
  }

  function delay(interval) {
    return it(`should delay for ${interval} milliseconds`, (done) => {
      setTimeout(() => done(), interval);
    }).timeout(interval + 100); // The extra 100ms should guarantee the test will not fail due to exceeded timeout
  }

  async function releaseFunds() {
    return new Promise(async (resolve, reject) => {
      try {
        const spInvestorBalance_before = BigNumber(
          await tokenInstance.balanceOf(seedAndPrivateInvestorAccount)
        );
        await instance.release({
          from: seedAndPrivateInvestorAccount,
        });
        const spInvestorBalance_after = BigNumber(
          await tokenInstance.balanceOf(seedAndPrivateInvestorAccount)
        );
        resolve({
          spInvestorBalance_before,
          spInvestorBalance_after,
        });
      } catch (e) {
        reject(e.message);
      }
    });
  }

  describe("Vesting for seed & private investors", async () => {
    /**
     * Token Economy for seed & private investors
     * --------------------------------------------------------------------------------
     * seed    : 10% at TGE, cliff for 1 month, then 10% for 9 months
     * private : 15% at TGE, cliff for 1 month, then 10% for 8 months, last month is 5%
     * --------------------------------------------------------------------------------
     * Cliff Duration = 1 months
     * Payout Percentage = 10%
     * Payout Interval = 1 months
     * Beneficiary Addr = seedInvestor
     * Initial tokes = 5,100,000 HID
     */
    
    describe("Test constructor parameters", async () => {
      it(`intial token should be ${
        initalTokenBalance / MILLIONS
      }`, async () => {
        const initalTokens = convertToken(
          vesting.liquidityProvision.totalAmountToBeVested
        );

        // first transfer HID to vesting contract
        await tokenInstance.transfer(vestingContractAddress, initalTokens, {
          from: admin,
        });

        contractBalance = BigNumber(await instance.getBalance());

        assert.equal(0, initalTokens.comparedTo(contractBalance));
      });

      it(`there should be ${expectedNumberOfIntervals} interval in which tokens should be unlocked`, async () => {
        const result = await instance.getCurrentVestingDetails();
        assert.equal(result[0], expectedNumberOfIntervals);
      });

      it(
        "should be able to set startTime " +
          getDateFromEpoch(vesting.liquidityProvision.startTime) +
          " properly",
        async () => {
          assert.equal(
            vesting.liquidityProvision.startTime,
            await instance.getStart()
          );
        }
      );

      it(`should be able to set clifftime ${getDateFromEpoch(
        expectedCliffTime
      )} properly`, async () => {
        assert.equal(expectedCliffTime, await instance.getCliff());
      });

      it(
        "should be able to set benefiricay properly " +
          vesting.liquidityProvision.beneficiary +
          "  properly",
        async () => {
          assert.equal(
            vesting.liquidityProvision.beneficiary,
            await instance.getBeneficiary()
          );
        }
      );
    });
    

    // verify all vesting schedules;  unlocktime and unlockpercentage
    describe("Test vesting schedules", async () => {
      for (i = 0; i < expectedNumberOfIntervals; i++) {
        itShouldVerifyVestingSchedule(i);
      }
    });

    return;

    describe("Test fund release process", async () => {
      const unlockTime = expectedCliffTime + vesting.liquidityProvision.payOutInterval;
      
      const iminDelay = 60;
      describe("Release funds during cliff @ " + getDateFromEpoch(expectedCliffTime), async () =>{
        let delayInterval = (vesting.liquidityProvision.cliffDuration - iminDelay) * MILLISECONDS;
        // console.log(delayInterval)
        delay(delayInterval);
        it("beneficiary should NOT be able to release fund during cliff ", async () => {
          try {
            console.log(`Funds for cliff @ ${getDateFromEpoch("now")}`);
            await releaseFunds();
          } catch (e) {
            console.log(e);
          }
        });
  
      })

      describe("Release funds for round 1 @" + getDateFromEpoch(expectedCliffTime), () => {
        delay(iminDelay * MILLISECONDS);
        it("beneficiary should be able to release fund for round  1", async () => {
          console.log(`Funds for round 1 released @ ${getDateFromEpoch("now")}`);
          const result = await releaseFunds();
          assert.equal(
                    1,
                    result.spInvestorBalance_after.comparedTo(
                      result.spInvestorBalance_before
                    ), //Ref: https://mikemcl.github.io/bignumber.js/#cmp
                    "Amount could not tranfered to beneficiary"
              );
          
        })

        it("beneficiary should NOT be able to release fund for round 1", async () => {
          try{
            console.log(getDateFromEpoch("now"));
            const result = await releaseFunds();
            assert.equal(
                      1,
                      result.spInvestorBalance_after.comparedTo(
                        result.spInvestorBalance_before
                      ), //Ref: https://mikemcl.github.io/bignumber.js/#cmp
                      "Amount could not tranfered to beneficiary"
                );
          }catch(e){
            console.log(e)
          }
        })

        it("beneficiary should NOT be able to release fund for round 1", async () => {
          try{
            console.log(getDateFromEpoch("now"));
            const result = await releaseFunds();
            assert.equal(
                      1,
                      result.spInvestorBalance_after.comparedTo(
                        result.spInvestorBalance_before
                      ), //Ref: https://mikemcl.github.io/bignumber.js/#cmp
                      "Amount could not tranfered to beneficiary"
                );

          }catch(e){
            console.log(e)
          }
        })
      })      
      

      

      // return;
      // Releasing rest of funds  
      for (i = 1; i < expectedNumberOfIntervals; i++) {
        const unlockTime = expectedCliffTime + i * vesting.liquidityProvision.payOutInterval;
      
        describe(`Release funs for round ${i + 1}: @ ${getDateFromEpoch(unlockTime)}`, async () => {
          let delayInterval = vesting.liquidityProvision.payOutInterval  * MILLISECONDS;
          delay(delayInterval);

          it(`beneficiary should be able to release at time`, async () => {
            console.log(`Funds for round ${i} released @ ${getDateFromEpoch("now")}`);
            const result = await releaseFunds();
            console.log(result);
            assert.equal(
              1,
              result.spInvestorBalance_after.comparedTo(
                result.spInvestorBalance_before
              ), //Ref: https://mikemcl.github.io/bignumber.js/#cmp
              "Amount could not tranfered to beneficiary"
            );
            
          });
        });
      }
    });
  });
});
