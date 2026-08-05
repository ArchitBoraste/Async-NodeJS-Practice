import { findCar, findDealer, findOffers, findInsurance, formatINR } from './09_fake_db.js';

const start = process.hrtime.bigint()
const timeEllapsed = () => {
    const ms = Number(process.hrtime.bigint() - start) / 1_000_000
    return `${ms.toFixed(0).padStart(4," ")}ms`
}

async function getCarQuote(carId){
    const car = await findCar(101)
    console.log(`car: ${car.model} --> ${timeEllapsed}`)

    const dealer = await findDealer(car.dealerId)
    console.log(`dealer: ${dealer.name} --> ${timeEllapsed}`)

    const [offers, insurance] = await Promise.all([
        findOffers(dealer.id),
        findInsurance(car.id)
    ])
    console.log(`${offers.length} offers and also insurance found -->${timeEllapsed}`)

    return {car, dealer, offers, insurance}
}


const quote = await getCarQuote(101);

console.log(`\n✅ QUOTE READY                   ${timeEllapsed()}`);
console.log(`   ${quote.car.model} (${quote.car.year}) — ${formatINR(quote.car.pricePaise)}`);
console.log(`   Dealer: ${quote.dealer.name}, ${quote.dealer.city} (${quote.dealer.rating})`);
quote.offers.forEach((o) => console.log(`   Finance: ${o.bank} @ ${o.ratePct}% / ${o.tenureMonths}mo`));
console.log(`   Insurance: ${quote.insurance.provider} — ${formatINR(quote.insurance.annualPremiumPaise)}/yr`);

console.log("\n\nTrying to get quote for carId 999")
try{
    await getCarQuote(999)
}
catch(err){
    console.log(`error: ${err.message}`)
}
finally{
    console.log(`finally blocks runs no matter what -->${timeEllapsed}`)
}

