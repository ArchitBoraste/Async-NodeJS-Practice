import { findCar, findOffers, findInsurance, findOffersBroken } from './09_fake_db.js'

const time = async (label, fn) => {
    const start = process.hrtime.bigint()
    await fn()
    const timeTaken = Number(process.hrtime.bigint() - start)/1_000_000
    console.log(`${label.padEnd(32)} --> ${timeTaken.toFixed(0).padStart(4)}ms`)
}
//will calculate the time required for function: "fn()" to complete and display it....

//1. Sequential vs Parallel
console.log("\nSequential vs Parallel")

await time('Sequential' , async () =>{
    const offers=await findOffers(7)
    const Insurance=await findInsurance(101)
})

await time('Parallel', async ()=>{
    const [offers, insurance] = await Promise.all([
        findOffers(7),
        findInsurance(101)
    ])
})


//2.Loops -> sequential (for...of + await(serial)) vs parallel(map + promis.all)
console.log("\nLoops")
const ids = [101, 202, 303]
let out1, out2

await time("for...of + await(serial)", async () => {
    out1 = []
    for(let id of ids){
        out1.push(await findCar(101))
    }
})

await time("map + promise.all", async()=>{
    out2 = await Promise.all(ids.map((id) => findCar(id)))
})

// console.log('\nOutput 1 (Serial):', out1)
// console.log('\nOutput 2 (Parallel):', out2)


//3. forEach not built for promises, hence not to be used with async
//better to use map function
const collected = [];
ids.forEach(async (id) => { collected.push(await findCar(id)); });
console.log(`\nforEach got ${collected.length} items (expected 3)`);

const cars = await Promise.all(ids.map((id)=>findCar(id)))
console.log(`map got ${cars.length} (expected 3) \n\n`)


//4.all vs allSettled
Promise.all([findOffers(7), findOffersBroken(), findOffers(9)])
.catch((err)=>{console.log(`promise.all failed all becos of 1: ${err.message}`)})

const off = await Promise.allSettled([findOffers(7), findOffersBroken(), findOffers(9)])
const good = off.filter((r)=>{return r.status === 'fulfilled'}).flatMap((r)=>r.value)
console.log(`Promise.allSettled returns status and value, good status offers filtered out =>`, good)



//Unhandled rejected promises crash the server->(since node 15)...this one unhandledRejection can cause all the the users data to go
findOffersBroken()
process.on('unhandledRejection', (r)=>{return console.log("Fatal error")})
