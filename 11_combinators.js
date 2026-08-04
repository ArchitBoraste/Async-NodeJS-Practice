import {
  findCar, findDealer, findOffers, findInsurance,
  findOffersSlow, findOffersBroken, formatINR,
} from './09_fake_db.js';

const start = process.hrtime.bigint();
const timeEllapsed = () => {
  const ms = Number(process.hrtime.bigint() - start) / 1_000_000;
  return `${ms.toFixed(0).padStart(4, ' ')}ms`;
};

//1. Promise.all ==> all or nothing, rejects on the first failure
//we use this when we need all data and partial data is useless
function demoAll(){
    console.log('Fetch 3 cars concurrently')
    const t0 = process.hrtime.bigint()
    return Promise.all([findCar(101), findCar(202), findCar(303)])
    .then((cars)=>{
        const took = Number(process.hrtime.bigint() - t0)/1_000_000
        console.log(`${cars.length} cars in ${took.toFixed(0)}ms`)//took is the time fetch all 3 cars, not the sum of time to fetch each car
        cars.forEach((car)=>console.log(`${car.model.padEnd(18)} ${formatINR(car.pricePaise)}`))
    })

    //in console the cars will be displayed in the order they were called
}

//2. Promise.allSettled
//doesnt crash on failure. Say we are fetching 3 promises concurrently and one fails....this will still wait for every task to finish
//and return the result of all all promises with status of 'fulfilled' or 'rejected'
function demoAllSettled(){
    console.log('Promise.allSettled: one promise will fail')
    return Promise.allSettled([
        findOffers(7),
        findOffersBroken(),
        findOffers(9)
    ]).then((results)=>{

        results.forEach((result, index)=>{
        // Each entry: { status: 'fulfilled', value } | { status: 'rejected', reason }

            //for first iteration 'findOffers(7)' result will look like:
            //{ status: 'fulfilled', value: [ { bank: 'HDFC...' }, { bank: 'ICICI...' } ] }

            //for second iteration 'findOffersBroken()' result will look like:
            //{ status: 'rejected', reason: Error: TIMEDOUT: finance provider unreachable }

            //and index simply means the index of the promise in the array we passed to Promise.allSettled
            //index 0->findOffers(7), index 1->findOffersBroken(), index 2->findOffers(9)

            if(result.status === 'fulfilled'){
                console.log(`provider ${index}: ${result.value.length} offer`);
            } else {
                console.log(`provider ${index}: failed ${result.reason.message}`)
                //note that we dont need to do result.reason.error.message
                //error already has a builtin message prop
                //const myError = new Error('TIMEDOUT');
                //console.log(myError.message); -->Prints: "TIMEDOUT"
            }

        })

        const good = results.filter((result)=>result.status === 'fulfilled').flatMap((result)=>result.value)
        //.filter would return array of fulfilled results 
        //say for example we get:
        // [
        //     { status: 'fulfilled', value: [ { bank: 'HDFC' }, { bank: 'ICICI' } ] }, // Dealer 7's offers
        //     { status: 'fulfilled', value: [ { bank: 'Axis' } ] }                     // Dealer 9's offers
        // ]....ignoring the ratepct and tenureMonths for this ex

        //.map((result)=>result.value) would return:
        // [
        //  [ { bank: 'HDFC' }, { bank: 'ICICI' } ],
        //  [ { bank: 'Axis' } ]
        // ]

        // .flatMap will return: 
        // [
        //     { bank: 'HDFC' }, 
        //     { bank: 'ICICI' }, 
        //     { bank: 'Axis' }
        // ]

        console.log(` returned ${good.length} offers despite a dead provider.`);
        console.log(' With Promise.all, the whole response would have been lost.\n');

    })
} 

//3.Promise.race
//first to settle wins no matter success or failure

function timeout(ms, label) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
  );
}

function demoRace() {
  console.log('Promise.race: enforce a 1s SLA');

  return Promise.race([
    findOffersSlow(7),                        // takes 3000ms
    timeout(1000, 'finance provider'),        // rejects at 1000ms
  ])
    .then((offers) => console.log(`  got ${offers.length} offers`))
    .catch((err) => {
      console.log(`   ${err.message}`);
      console.log('     → NOTE: the slow request is NOT cancelled. It still');
      console.log('       runs to completion in the background. Promises have');
      console.log('       no cancellation — use AbortSignal for that.\n');
    });
}

//4.Promise.any
//the first promise to resolve wins and the rest are ignored. (It gnores the rejected promises)
function demoAny(){
    console.log('Promise.race: first promise to resolve wins')

    return Promise.any([
        findOffersBroken(),     // fails fast
        findOffersSlow(7),      // slow but works
        findOffers(7),          // fast and works ← should win
    ])

    .then((offers)=>{
        console.log(`first successful response had: ${offers.length} offers`)
    })
}

//4.Sequential vs Parallel execution
function demoSequentialvsParallel(){
    console.log('Sequential vs Parallel execution')

    //SEQUENTIAL
    const t0 = process.hrtime.bigint()
    const sequential = findCar(101)
    .then((car)=>{
        return findDealer(car.dealerId).then(dealer=>({car, dealer})) //pass car alongside dealer in the promise
                                                                      //for JavaScript to understand that it is a object we use ()
                                                                      //else it will treat it like a function block
    })
    //dealer was going to be returned/go to next .then
    //.then(dealer => someValue); by this instead of dealer someValue will be returned 

    .then((data)=>{
        return findOffers(data.dealer.id).then(offers => ({...data, offers}))
    })
    .then((data)=>{
        return findInsurance(data.car.id).then((insurance)=>({
            car: data.car, 
            dealer: data.dealer, 
            offers: data.offers, 
            insurance: insurance//we didnt use spread operator to put insurance inside data object so no need for data.insurance
        }))
    })
    .then(()=> Number(process.hrtime.bigint() - t0)/1_000_000)

    //Easier way to write the sequence was:
    // const seq = findCar(101)
    // .then((car)=> 
    //     findDealer(car.dealerId).then((dealer)=>
    //         findOffers(dealer.id).then((offers)=>
    //             findInsurance(car.id).then((insurance)=> ({car, dealer, offers, insurance}))
    //         )
    //     )
    // )


    //PARALLEL
    const t1 = process.hrtime.bigint()

    const parallel = findCar(101)
    .then((car)=>
        findDealer(car.dealerId).then((dealer)=>
            Promise.all([findOffers(dealer.id) , findInsurance(car.id)])
                .then(([offers, insurance]) => ({car, dealer, offers, insurance}))
        )
    )
    .then(() => Number(process.hrtime.bigint() - t1) / 1_000_000);


    return Promise.all([sequential, parallel]).then(([seqMs, parMs])=>{
        console.log(`  sequential : ${seqMs.toFixed(0).padStart(4)}ms  (car → dealer → offers → insurance)`);
        console.log(`  parallel   : ${parMs.toFixed(0).padStart(4)}ms  (car → dealer → [offers ‖ insurance])`);
        console.log(`  saved      : ${(seqMs - parMs).toFixed(0)}ms — roughly one provider call.\n`);
  
    })
}

demoAll()
  .then(demoAllSettled)
  .then(demoRace)
  .then(demoAny)
  .then(demoSequentialvsParallel)
  .then(() => console.log(`done at ${timeEllapsed()}`));