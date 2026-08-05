import { findCar, findDealer, findOffers, findOffersBroken } from './09_fake_db.js';

const sleep = (ms) => new Promise((resolve)=>{setTimeout(resolve, ms)})

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
process.on('unhandledRejection', (reason)=>{
    console.log(`unhandled rejection: ${reason.message} --> kills process `)
})


//3. nesting .then instead of chaining
async function pitfall3(){
    console.log("Nesting instead of chaining")

    await findCar(101)
        .then((car) =>{
            return findOffers(car.dealerId).then((offers)=>{
                return findCar(202).then((car2)=> {
                    console.log("Inner rejections will escape the outer catch")
                })
            })
        })

    //we would have to had write multiple catches like this
    await findCar(101)
        .then((car)=>{
            return findOffers(car.dealerId).then((offers)=>{
                return findCar(202).then((car2)=>{
                    console.log("3 levels deep")
                }).catch((err)=>{console.log(`Faied to get car 202: ${err.message}`)})
            }).catch((err)=>{console.log(`failed to get offers: ${err.message}`)})
        }).catch((err)=>{console.log(`failed to get car 202: ${err.message}`)})
    
    //better way is to simply chain rather than nest
    let car, offers, car2 //we initialised them so when their chain ends we can still access them
    await findCar(101)
    .then((c)=>{
        car=c
        return findOffers(car.dealerId)
    })
    .then((o)=>{
        offers=o
        return findCar(202)
    })
    .then((c2)=>{
        car2=c2
        console.log("here is a flat chain so no need of multiple catch error")
    })
    .catch((err)=>`error caight : ${err}`)
}

//calling a promise inside a promise
function pitfall4() {
  console.log('--- Pitfall 4: needless new Promise ---');

  //Pointless, and it silently DROPS errors: if findCar rejects, nothing calls reject, so this promise hangs forever.
  function badGetCar(id) {
    return new Promise((resolve) => {
      findCar(id).then((car) => resolve(car));
    });
  }

  //It's already a promise. Just return it.
  function goodGetCar(id) {
    return findCar(id);
  }

//   console.log("\ntrying to execute badGetCar")
//   badGetCar(111)

  console.log('  badGetCar(999) will hang forever — reject is never called');
  console.log('  goodGetCar just returns the promise it already had');
  console.log('  only use `new Promise` to wrap a NON-promise API.\n');

  return goodGetCar(101).then((c) => console.log(`  sanity check: ${c.model}`));
}


await pitfall1();
await pitfall2();
await pitfall3();
await pitfall4();