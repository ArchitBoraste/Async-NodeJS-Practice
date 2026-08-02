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
}

