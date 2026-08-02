//2 standard ways developers create promises today:

const cars = {
  101: { id: 101, model: 'Maruti Swift VXI',  year: 2021, pricePaise: 62_50_000_00, dealerId: 7 },
  202: { id: 202, model: 'Hyundai i20 Asta',  year: 2022, pricePaise: 78_90_000_00, dealerId: 9 },
  303: { id: 303, model: 'Tata Nexon XZ+',    year: 2023, pricePaise: 91_20_000_00, dealerId: 7 },
};

const dealers = {
  7: { id: 7, name: 'Pune Motors', city: 'Pune',   rating: 4.4 },
  9: { id: 9, name: 'Deccan Auto', city: 'Pimpri', rating: 4.1 },
};

const offersByDealer = {
  7: [
    { bank: 'HDFC Bank',  ratePct: 9.2, tenureMonths: 60 },
    { bank: 'ICICI Bank', ratePct: 9.6, tenureMonths: 48 },
  ],
  9: [{ bank: 'Axis Bank', ratePct: 10.1, tenureMonths: 60 }],
};

const insuranceByCar = {
  101: { provider: 'ICICI Lombard', annualPremiumPaise: 18_500_00 },
  202: { provider: 'Bajaj Allianz', annualPremiumPaise: 22_400_00 },
  303: { provider: 'HDFC Ergo',     annualPremiumPaise: 26_100_00 },
};

const latency = (min=80 , max=250) => Math.floor(min + Math.random() * (max-min))
//in real world database queries dont finish instantly or in a predictable order. This simultes that


// STYLE 1
//this is the manual way of creating a promise.
//We use this whaen dealing with older call-back based code, (like setTimeout) and we want to "modernize" it by wrapping a Promise 
//around it.

//How it works:
// You return a new Promise().
// The Promise takes an "executor" function with two arguments: resolve and reject.
// Inside the executor, you start your asynchronous task (the setTimeout).
// Failure: If the car doesn't exist in our data, you call reject(). 
// Success: If the car is found, you call resolve(car). This tells the Promise, "I finished successfully, and here is the data."

export function findCar(carId){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            const car = cars[carId]
            if(!car){
                reject(new Error(`Car with id ${carId} not found`))
                return
            }
            resolve(car)
        }, latency())
    })
}


//STYLE 2
//modern way of craeting a promise, 95 percent of times we will use this

//By simply adding the word async in front of the function, JavaScript does a ton of heavy lifting for you:
// Automatic Promise: An async function always returns a Promise automatically. You don't have to write return new Promise(...).
// Success = Return: When you type return dealer;, JavaScript automatically translates that into resolve(dealer).
// Failure = Throw: When you type throw new Error(...), JavaScript automatically translates that into reject(new Error(...)).

const sleep = (ms) => new Promise((r)=>setTimeout(r,ms))
//r-> resolve(first argument is resolve, second is reject==>new Promise(resolve, reject)), sleep is a promise (setTimeout) that will 
//resolve after the latency period

export async function findDealer(dealerId){
    await sleep(latency())
    const dealer = dealers[dealerId]
    if(!dealer){
        throw new Error(`Dealer with id ${dealerId} not found`)
    }
    return dealer
}

export async function findOffers(dealerId) {
  await sleep(latency(150, 400))//in carbazaar this will be call to third party financer hence external API call:- this will be slower
                                //hence increased min, max for the latency                                             
  const offers = offersByDealer[dealerId]
  if (!offers) throw new Error(`No finance partner for dealer ${dealerId}`)
  return offers
}

export async function findInsurance(carId) {
  await sleep(latency(150, 400))
  const quote = insuranceByCar[carId]
  if (!quote) throw new Error(`No insurance quote for car ${carId}`)
  return quote
}


export async function findOffersSlow(dealerId) {
  await sleep(3000);                         
  return offersByDealer[dealerId] ?? [];
}
//simulates slow server/database that is taking 3 sec to respond


export async function findOffersBroken() {
  await sleep(120);
  throw new Error('ETIMEDOUT: finance provider unreachable');
}
//simulates server that is offline or crashed 


export const formatINR = (paise) => `₹${(paise / 100).toLocaleString('en-IN')}`;