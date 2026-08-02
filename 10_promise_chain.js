import { findCar, findDealer, findOffers, findInsurance, formatINR } from './09_fake_db.js';

const start = process.hrtime.bigint()//returns current time in nanoseconds
const timeEllapsed = () => {
    const ms = Number(process.hrtime.bigint() - start)/1_000_000
    return `+${ms.toFixed(0).padStart(4,' ')}ms`
}
//toFixed(0) means number will round to 0 decimal places ie nearest integer

function getCarQuote(carId){
    let car, dealer

    return findCar(carId)//findCar will return a promise which return a car object. This object is accessed in .then
    .then((foundCar)=>{
        car = foundCar
        console.log(`car found ${car.model.padEnd(18)} ${timeEllapsed()}`)

        return findDealer(car.dealerId)
    })//now we are returning a dealer which we will access in next  .then

    .then((foundDealer)=>{
        dealer = foundDealer;
        console.log(`dealer: ${dealer.name.padEnd(15)} ${timeEllapsed()}`);
        return findOffers(dealer.id);
    })

    .then((offers)=>{
        console.log(`${offers.length} finance offer(s)        ${timeEllapsed()}`)
        return findInsurance(car.id).then((insurance) => ({ 
            car: car, 
            dealer: dealer, 
            offers: offers, 
            insurance: insurance }));
    })

    // car: car, 
    // dealer: dealer, 
    // offers: offers, 
    // insurance: insurance
    //this is the final object we are returning from promise chain of carquote

    //it looks like: (in .then(q) something like this will be returned)
    // {
    //   car: { id: 101, model: 'City', ... },
    //   dealer: { id: 7, name: 'Apex Honda', ... },
    //   offers: [ { bank: 'HDFC Bank', ... } ],
    //   insurance: { provider: 'ICICI Lombard', ... }
    // }

    .catch((err) => {
      console.error(`   chain failed: ${err.message}`);
      throw err
    })

}

console.log('car 101, this should succeed')
getCarQuote(101)
    .then((q) => {
        console.log(`\n  QUOTE READY                   ${timeEllapsed()}`);
        console.log(`   ${q.car.model} (${q.car.year}) — ${formatINR(q.car.pricePaise)}`);
        console.log(`   Dealer: ${q.dealer.name}, ${q.dealer.city} (★ ${q.dealer.rating})`);
        q.offers.forEach((o) => console.log(`   Finance: ${o.bank} @ ${o.ratePct}% / ${o.tenureMonths}mo`));
        console.log(`   Insurance: ${q.insurance.provider} — ${formatINR(q.insurance.annualPremiumPaise)}/yr`);
    })

    //now error path
    .then(()=>{
        console.log('car 999, this should fail')
        return getCarQuote(999)
    })

    .catch((err) => {//to catch the error which will be thrown by getCarQuote(999)
        console.log(`error : "${err.message}"`);
        console.log(' no try/catch needed, no crash, no uncaughtException.');
    })
    .finally(() => {
    console.log(`finally: cleanup runs either way    ${timeEllapsed()}`);
    });


