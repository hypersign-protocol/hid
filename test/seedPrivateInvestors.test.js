const HIDVesting = artifacts.require("HIDVesting");
const HID = artifacts.require("HID");
const config = require("../config");
const BigNumber = require("bignumber.js");

const { vesting } = config;

function convertToken(amount) {
  amount = amount * Math.pow(10, config.DECIMALS);
  return BigNumber(amount.toString());
}

contract("HIDVesting", (accounts) => {
  const admin = accounts[0];
  const PERCENTAGE_MULTIPLIER = 100; // to handle float types.
  const MILLIONS = 1000000;
  const MILLISECONDS = 1000;
  const seedAndPrivateInvestorAccount = accounts[1];

  console.log(seedAndPrivateInvestorAccount);
  console.log({
    hid: HID.address,
    hidVesting: HIDVesting.address,
  });

  const initalTokenBalance = vesting.seedAndPrivate.totalAmountToBeVested;
  const expectedNumberOfIntervals =
    (100 * PERCENTAGE_MULTIPLIER) / vesting.seedAndPrivate.payOutPercentage;
  const totalStartCliffAndWaitTime =
    vesting.seedAndPrivate.startTime + vesting.seedAndPrivate.cliffDuration;
  const expectedCliffTime =
    vesting.seedAndPrivate.startTime + vesting.seedAndPrivate.cliffDuration; // in secods
  
  const vestingContractAddress = HIDVesting.address;

  let instance;
  let tokenInstance;

  beforeEach(async () => {
    instance = await HIDVesting.deployed();
    tokenInstance = await HID.deployed();
  });

  function getDateFromEpoch(seconds) {
    let d;
    if (seconds === "now") {
      d = new Date();
    } else {
      d = new Date(seconds * 1000);
    }

    return (
      d.getMonth() +
      "/" +
      d.getDate() +
      "/" +
      d.getFullYear() +
      " " +
      d.getHours() +
      ":" +
      d.getMinutes() +
      ":" +
      d.getSeconds() +
      ":" +
      d.getMilliseconds()
    );
  }

  function itShouldVerifyVestingSchedule(i) {
    describe(`vesting schedule for round ${i + 1}`, async () => {
      const unlockPercentage =
        (i + 1) * vesting.seedAndPrivate.payOutPercentage;
      const unlockTime =
        totalStartCliffAndWaitTime + i * vesting.seedAndPrivate.payOutInterval;
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
      });

      it(`Should be able to unlock tokens ${unlockTokens}`, async () => {
        const result = BigNumber(await instance.getVestedAmount(i));
        assert.equal(0, unlockTokens.comparedTo(result));
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
        // console.log({
        //   spInvestorBalance_before,
        //   spInvestorBalance_after,
        // });
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
    
    describe("Verifying contract parameter", async () => {
      it(`intial token should be ${
        initalTokenBalance / MILLIONS
      }`, async () => {
        const initalTokens = convertToken(
          vesting.seedAndPrivate.totalAmountToBeVested
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
          getDateFromEpoch(vesting.seedAndPrivate.startTime) +
          " properly",
        async () => {
          assert.equal(
            vesting.seedAndPrivate.startTime,
            await instance.start()
          );
        }
      );

      it(`should be able to set clifftime ${getDateFromEpoch(
        expectedCliffTime
      )} properly`, async () => {
        assert.equal(expectedCliffTime, await instance.cliff());
      });

      it(
        "should be able to set benefiricay properly " +
          vesting.seedAndPrivate.beneficiary +
          "  properly",
        async () => {
          assert.equal(
            vesting.seedAndPrivate.beneficiary,
            await instance.beneficiary()
          );
        }
      );
    });

    // verify all vesting schedules;  unlocktime and unlockpercentage
    describe("Verifying vesting schedules", async () => {
      for (i = 0; i < expectedNumberOfIntervals; i++) {
        itShouldVerifyVestingSchedule(i);
      }
    });

    describe("Fund releaes", async () => {
      let delayInterval =
        (vesting.seedAndPrivate.cliffDuration - 60) * MILLISECONDS;

      delay(delayInterval);

      it("beneficiary should NOT be able to release fund during cliff ", async () => {
        console.log(getDateFromEpoch("now"));
        try {
          await releaseFunds();
        } catch (e) {
          console.log(e);
        }
      });

      // for (i = 0; i < expectedNumberOfIntervals; i++) {
      //   describe(`Release funs for round ${i + 1}`, async () => {
      //     delayInterval = vesting.seedAndPrivate.payOutInterval * MILLISECONDS;
      //     delay(delayInterval);

      //     it(`beneficiary should be able to release at time`, async () => {
      //       console.log(getDateFromEpoch("now"));
      //       const result = await releaseFunds(i);
      //       console.log(result);
      //       assert.equal(
      //         1,
      //         result.spInvestorBalance_after.comparedTo(
      //           result.spInvestorBalance_before
      //         ), //Ref: https://mikemcl.github.io/bignumber.js/#cmp
      //         "Amount could not tranfered to beneficiary"
      //       );
      //     });
      //   });
      // }
      // return;

      describe(`Release funds for round 1`, async () => {
        delayInterval = vesting.seedAndPrivate.payOutInterval  * MILLISECONDS;
        delay(delayInterval);
        it("beneficiary should be able to release fund for round 1", async () => {
          const result = await releaseFunds(i);
          assert.equal(
                    1,
                    result.spInvestorBalance_after.comparedTo(
                      result.spInvestorBalance_before
                    ), //Ref: https://mikemcl.github.io/bignumber.js/#cmp
                    "Amount could not tranfered to beneficiary"
              );
        })
      })
      describe(`Release funds for round 2`, async () => {
        delayInterval = vesting.seedAndPrivate.payOutInterval  * MILLISECONDS;
        delay(delayInterval);
        it("beneficiary should be able to release fund for round 2", async () => {
          const result = await releaseFunds(i);
          assert.equal(
                    1,
                    result.spInvestorBalance_after.comparedTo(
                      result.spInvestorBalance_before
                    ), //Ref: https://mikemcl.github.io/bignumber.js/#cmp
                    "Amount could not tranfered to beneficiary"
              );
        })

        it("beneficiary should NOT be able to release fund for round 2 since we already withdrawn", async () => {
          try{
            const result = await releaseFunds(i);
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
      });

      describe(`Release funds for round 3`, async () => {
        delayInterval = vesting.seedAndPrivate.payOutInterval  * MILLISECONDS;
        delay(delayInterval);
        it("beneficiary should be able to release fund for round 3", async () => {
          const result = await releaseFunds(i);
          assert.equal(
                    1,
                    result.spInvestorBalance_after.comparedTo(
                      result.spInvestorBalance_before
                    ), //Ref: https://mikemcl.github.io/bignumber.js/#cmp
                    "Amount could not tranfered to beneficiary"
              );
        })
      })

      
    });
  });
});
