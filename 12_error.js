import { findCar, findDealer, findOffers, findOffersBroken } from './09_fake_db.js';

const sleep = (ms) => new Promise((resolve)=>{resolve, ms})

//1. forgetting return inside .then
async function pitfall1(){
    console.log('\n Missing Return \n')

    await findCar(101)
    .then((car)=> {
        findOffers(car.dealerId) //we did not put "return findOffers(...)" Javascript will fire the request but as no "return" it will
                                  //not waut for the result and just move ahead. Also the resulting data will be thrown away
    }) 
    .then((offers)=>console.log(`offers is ${offers}`)) 
    
    await findCar(101)
    .then((car)=>{
        return findOffers(car.dealerId)
    })
    .then((offers)=> {console.log(`offers is ${offers}`)})
}


//2.Unhandled Rejection
async function pitfall2(){
    console.log("\nUnhandled Rejection\n")

    findOffersBroken()
    //nobody is handling the rejection from this and since v15+ of node this will terminate the process

    await sleep(200)

    findOffersBroken().catch((err)=>{console.log(`error is ${err.message}`)})
    //handled the error through attatching the .catch ... We could have also use try catch block
    
    
    await sleep(200)
}
process.on('unhandledRejection')

