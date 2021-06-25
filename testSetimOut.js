const { vesting } =  require("./config")
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

now  :  7:28
start:  7:30
cliff:  7:32 -----  7:32 - 7:28 = 4 min = 4 * 60 = 240 000 
wait :  7:34 -----  7:34 - 7:28 = 6 - 1 min = 


    // execute in cliff period
    let delay = expectedCliffTime * 1000 - (new Date().getTime())
    console.log(delay)
    itShouldTryToReleaseFundsAfter(delay).then(r => {
        console.log(r)
    }).catch(e => {
        console.log(e)
    })

    delay = expectedWaitTime  * 1000 - (new Date().getTime())
    console.log(delay)
    itShouldTryToReleaseFundsAfter(delay).then(r => {
        console.log(r)
    })
