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
