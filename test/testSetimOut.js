const { vesting } =  require("../config")
const { seedAndPrivate } = vesting;


// start =  now + 10s
// cliff = start + 
// wait = cliff + duration
const expectedCliffTime = seedAndPrivate.startTime + seedAndPrivate.cliffDuration; // in secods

const expectedWaitTime = expectedCliffTime + seedAndPrivate.waitDuration; // in secods
console.log({
    start: seedAndPrivate.startTime,
    cliff: expectedCliffTime,
    wait: expectedWaitTime
})

async function itShouldTryToReleaseFundsAfter(after){
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try{
                resolve("Executed after " + after)
            }catch(e){
                reject(e.message);
            }

        }, after)
    })
}

// execute in cliff period
const t = Math.ceil((new Date().getTime() + 10000) / 1000)
let delay = expectedCliffTime * 1000 - (new Date().getTime())
itShouldTryToReleaseFundsAfter(delay).then(r => {
    console.log(r)
    delay = (expectedWaitTime  - expectedCliffTime) * 1000
    itShouldTryToReleaseFundsAfter(delay).then(r => {
        console.log(r)
    })
}).catch(e => {
    console.log(e)
})
