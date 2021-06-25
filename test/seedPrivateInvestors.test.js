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
    hidVesting: HIDVesting.address
  })

  const initalTokenBalance = vesting.seedAndPrivate.totalAmountToBeVested;
  const expectedNumberOfIntervals =
    (100 * PERCENTAGE_MULTIPLIER) / vesting.seedAndPrivate.payOutPercentage;
  const totalStartCliffAndWaitTime =
    vesting.seedAndPrivate.startTime +
    vesting.seedAndPrivate.cliffDuration +
    vesting.seedAndPrivate.waitDuration;
  const expectedCliffTime =
    vesting.seedAndPrivate.startTime + vesting.seedAndPrivate.cliffDuration; // in secods
  const expectedWaitTime =
    expectedCliffTime + vesting.seedAndPrivate.waitDuration; // in secods

  const vestingContractAddress = HIDVesting.address;

  let instance;
  let tokenInstance;

//   return; 
  beforeEach(async () => {
    instance = await HIDVesting.deployed();
    tokenInstance = await HID.deployed();
  });

  // async function getVestingDetails(){
  //   const res = await instance.getCurrentVestingDetails(seedAndPrivateInvestorAccount);
  //   const totalUnlockedAmount = res[1];
  //   const lastUnlockedTime = res[2];
  //   return {
  //     totalUnlockedAmount: BigNumber(totalUnlockedAmount),
  //     lastUnlockedTime: BigNumber(lastUnlockedTime)
  //   }
  // }

  function getDateFromEpoch(seconds) {
    let d;
    if(seconds === "now"){
      d = new Date();
    }else{
      d = new Date(seconds * 1000);
    }
    
    return d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.getHours()+ ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds();
  }
  

  // function getDateFromEpoch(seconds) {
  //   let d;
  //   if(seconds === "now"){
  //     d = new Date(Math.ceil((new Date().getTime()) / MILLISECONDS));
  //   }else{
  //     d = new Date(seconds * 1000);
  //   }
    
  //   return d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.getHours()+ ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds();
  // }
  function itShouldVerifyVestingSchedule(i) {
    describe(`vesting schedule for round ${i + 1}`, async () => {
      const unlockPercentage =
        (i + 1) * vesting.seedAndPrivate.payOutPercentage;
      const unlockTime =
        totalStartCliffAndWaitTime + i * vesting.seedAndPrivate.payOutInterval;
      const unlockTokens = convertToken(
        (initalTokenBalance * unlockPercentage) / (100 * PERCENTAGE_MULTIPLIER)
      );

      it(`Should be able to unlock at ${getDateFromEpoch(unlockTime)}`, async () => {
        const result = await instance.getVestingSchedule(
          i
        );
        assert.equal(result[0], unlockTime);
      });

      it(`Should be able to unlock tokens percentage ${unlockPercentage}`, async () => {
        const result = await instance.getVestingSchedule(
          i
        );
        assert.equal(result[1], unlockPercentage);
      });

      it(`Should be able to unlock tokens ${unlockTokens}`, async () => {
        const result = BigNumber(
          await instance.getVestedAmount(i)
        );
        assert.equal(0, unlockTokens.comparedTo(result));
      });
    });
  }

  function itShouldBeAbleToReleaseFund(i){
    describe(`Release funs for round ${i + 1}`, async () => {
      delayInterval = vesting.seedAndPrivate.payOutInterval * MILLISECONDS;    
      delay(delayInterval);

      it(`beneficiary should be able to release at time`, async () => {
        console.log(getDateFromEpoch("now"))
        const result = await releaseFunds();
        console.log(result);
        // const res = await getVestingDetails();
        // console.log(res)
        assert.equal(
            1,
            result.spInvestorBalance_after.comparedTo(result.spInvestorBalance_before), // comparedTo return 0 if two bignumbers are same; Ref: https://mikemcl.github.io/bignumber.js/#cmp
            "Amount could not tranfered to beneficiary"
        )
      });

    })
  } 

  function delay(interval) {
    return it(`should delay for ${interval} milliseconds`, (done) => {
      setTimeout(() => done(), interval);
    }).timeout(interval + 100); // The extra 100ms should guarantee the test will not fail due to exceeded timeout
  }

  async function releaseFunds() {
    return new Promise(async (resolve, reject) => {
      try {
        const spInvestorBalance_before = BigNumber(await tokenInstance.balanceOf(seedAndPrivateInvestorAccount));
        await instance.release({
          from: seedAndPrivateInvestorAccount,
        });
        const spInvestorBalance_after = BigNumber(await tokenInstance.balanceOf(seedAndPrivateInvestorAccount));
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

  function delayExecutionBy(interval){
      return new Promise((resolve) => {
          return setTimeout(() => { resolve("Done") },  interval);
      })
  }
  // async function itShouldTryToReleaseFundsAfter(after) {
  //   return new Promise((resolve, reject) => {
  //     setTimeout(async () => {
  //       try {
  //         const spInvestorBalance_before = BigNumber(
  //           await tokenInstance.balanceOf(seedAndPrivateInvestorAccount)
  //         );
  //         await instance.release(seedAndPrivateInvestorAccount, {
  //           from: seedAndPrivateInvestorAccount,
  //         });
  //         const spInvestorBalance_after = BigNumber(
  //           await tokenInstance.balanceOf(seedAndPrivateInvestorAccount)
  //         );
  //         console.log({
  //           spInvestorBalance_before,
  //           spInvestorBalance_after,
  //         });
  //         resolve({
  //           spInvestorBalance_before,
  //           spInvestorBalance_after,
  //         });
  //       } catch (e) {
  //         reject(e.message);
  //       }
  //     }, after);
  //   });
  // }

  describe("Vesting for seed & private investors", async () => {
      
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
    //  delay(1000);
    //  it("should execute after 1 sec ", () => { 
    //      console.log((new Date()).getTime())
    //  })
    //  delay(5000)
    //  it("should execute after 6 sec ", () => { console.log((new Date()).getTime())})
    //  delay(10000)
    //  it("should execute after 16 sec ", () => {console.log((new Date()).getTime())})

    //  return;
     describe("Verifying contract parameter", async () => {
        it(`intial token should be ${initalTokenBalance / MILLIONS}`, async () => {
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
            const result = await instance.getCurrentVestingDetails( 
            );
            assert.equal(result[0], expectedNumberOfIntervals);
          });
      
          it(
            "should be able to set startTime " +
            getDateFromEpoch(vesting.seedAndPrivate.startTime) +
              " properly",
            async () => {
              assert.equal(vesting.seedAndPrivate.startTime, await instance.start());
            }
          );
      
          it(`should be able to set clifftime ${getDateFromEpoch(expectedCliffTime)} properly`, async () => {
            assert.equal(expectedCliffTime, await instance.cliff());
          });
      
          it(
            "should be able to set waitTime " + getDateFromEpoch(expectedWaitTime) + "  properly",
            async () => {
              assert.equal(expectedWaitTime, await instance.waitTime());
            }
          );

          it(
            "should be able to set benefiricay properly " + vesting.seedAndPrivate.beneficiary + "  properly",
            async () => {
              assert.equal(vesting.seedAndPrivate.beneficiary, await instance.beneficiary());
            }
          );
     })

    // verify all vesting schedules;  unlocktime and unlockpercentage
    describe("Verifying vesting schedules", async () => {
        
      for (i = 0; i < expectedNumberOfIntervals; i++) {
        // const i = 0
        itShouldVerifyVestingSchedule(i);
      }
    });

    describe("Fund releaes", async () => {
        
      
        
        let delayInterval = (vesting.seedAndPrivate.cliffDuration - 60) * MILLISECONDS;
        // console.log(delayInterval)
      
      delay(delayInterval);

      it("beneficiary should NOT be able to release fund during cliff " , async () => {
            console.log(getDateFromEpoch("now"))
            try {
            await releaseFunds();
            } catch (e) {
            console.log(e);
            }
      });

      delayInterval = (vesting.seedAndPrivate.waitDuration - 60) * MILLISECONDS;
    //   console.log(delayInterval)
        // (expectedWaitTime - expectedCliffTime) * MILLISECONDS - 60 * MILLISECONDS;

      delay(delayInterval);

      it("beneficiary should NOT be able to release fund during waitTime ", async () => {
        console.log(getDateFromEpoch("now"))
        try {
            await releaseFunds();
        } catch (e) {
          console.log(e);
        }
      });

      for (i = 0; i < expectedNumberOfIntervals; i++) {
        // const i = 0
        itShouldBeAbleToReleaseFund(i);
      }

      // delayInterval = vesting.seedAndPrivate.payOutInterval * MILLISECONDS;    
      // delay(delayInterval);

      // it("beneficiary should be able to release fund after waitTime: for slot 1 ", async () => {
      //   console.log((new Date()).getTime())
      //   const result = await releaseFunds();
      //   console.log(result);
      //   const res = await getVestingDetails();
      //   console.log(res)
      //   assert.equal(
      //       1,
      //       result.spInvestorBalance_after.comparedTo(result.spInvestorBalance_before), // comparedTo return 0 if two bignumbers are same; Ref: https://mikemcl.github.io/bignumber.js/#cmp
      //       "Amount tranfered to beneficiary"
      //   )
      // });

      // delayInterval = (vesting.seedAndPrivate.payOutInterval - 20)  * MILLISECONDS;    
      // delay(delayInterval);

      // it("beneficiary should be able to release fund after waitTime: for slot 2", async () => {
      //   console.log((new Date()).getTime())
      //   const result = await releaseFunds();
      //   console.log(result);
      //   const res = await getVestingDetails();
      //   console.log(res)
      //   assert.equal(
      //       1,
      //       result.spInvestorBalance_after.comparedTo(result.spInvestorBalance_before), // comparedTo return 0 if two bignumbers are same; Ref: https://mikemcl.github.io/bignumber.js/#cmp
      //       "Amount could not tranfered to beneficiary"
      //   )
      // });

      // delayInterval = (3 * vesting.seedAndPrivate.payOutInterval - 20) * MILLISECONDS;    
      // delay(delayInterval);

      // it("beneficiary should be able to release fund after waitTime: for slot 6", async () => {
      //   console.log((new Date()).getTime())
      //   const result = await releaseFunds();
      //   console.log(result);
      //   const res = await getVestingDetails();
      //   console.log(res)
      //   assert.equal(
      //       1,
      //       result.spInvestorBalance_after.comparedTo(result.spInvestorBalance_before), // comparedTo return 0 if two bignumbers are same; Ref: https://mikemcl.github.io/bignumber.js/#cmp
      //       "Amount could not tranfered to beneficiary"
      //   )
      // });

      // delayInterval = (3 * vesting.seedAndPrivate.payOutInterval - 20) * MILLISECONDS;    
      // delay(delayInterval);

      // it("beneficiary should be able to release fund after waitTime: for slot 10", async () => {
      //   console.log((new Date()).getTime())
      //   const result = await releaseFunds();
      //   console.log(result);
      //   const res = await getVestingDetails();
      //   console.log(res)
      //   assert.equal(
      //       1,
      //       result.spInvestorBalance_after.comparedTo(result.spInvestorBalance_before), // comparedTo return 0 if two bignumbers are same; Ref: https://mikemcl.github.io/bignumber.js/#cmp
      //       "Amount could not tranfered to beneficiary"
      //   )
      // });



      return;
      
    });
  });
});
