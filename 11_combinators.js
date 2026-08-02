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
