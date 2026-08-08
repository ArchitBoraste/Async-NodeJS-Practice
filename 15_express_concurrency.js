import express from 'express';
import { findCar, findDealer, findOffers } from './09_fake_db.js';

const app = express()

const start = process.hrtime.bigint()
const time = () => `${(Number(process.hrtime.bigint() - start) / 1_000_000).toFixed(0).padStart(5)}ms`

//1. Make 2 requests interleave here for example:
//run http://localhost:4900/trace/101 and http://localhost:4900/trace/202 at the same time
app.get('/trace/:carId', async (req, res)=>{
    const {carId} = req.params

    //note on object destructuring:
    
    // What req.params actually looks like behind the scenes:
    // {
    //   carId: "101"
    // }

    // const carId = req.params; 
    // console.log(carId); // Prints: { carId: '101' }

    //const { carId } = req.params; 
    //console.log(carId); --> Prints: '101'

    // This is just a modern shortcut for writing the old way:
    // const carId = req.params.carId;

    console.log(`${time()} [${carId}] handler START`)
    const car = await findCar(carId)
    console.log(`${time()} Found car ${carId}`)

    const dealer = await findDealer(car.dealerId)
    console.log(`${time()} found delaer for ${carId}`)

    const offers = await findOffers(dealer.id)
    console.log(`${time()} found offers, ${carId} handler STOP`)

    res.json({car, dealer, offers})
})

app.get('/test1',(req,res)=>{
    console.log('running 2 routes for "/trace/:carId" simultaneously')
    Promise.all([
        fetch('http://localhost:4900/trace/101'),
        fetch('http://localhost:4900/trace/202')
    ])
    res.send()
})


//2. Bug -> current dealer declared outside route
let currentDealer = null
//This variable is declared outside the route handler. In Node.js, this means it lives in the "Module Scope." There is only one 
//currentDealer bucket for the entire server. Every single user who connects to the app is sharing this exact same bucket.
//Hence this can easily get overwritten

//ex-> A wants 101, B wants 202...and want corresponding car dealers
//A finishes the the lookup for dealer first then 'currentDealer' bucjet is filled with A's dealer
//B comes later and as A and b share same 'currentDealer' bucket B over-writes the bucket with its dealers info...wiping out A's

app.get('/bug/:carId', async (req,res)=>{
    const {carId} = req.params 
    const car = await findCar(carId)
    currentDealer = await findDealer(car.dealerId)
    const offers = await findOffers(currentDealer.id)

    console.log(`${carId} -> ${currentDealer.name}`)
    res.json({
        car:car.model,
        dealer:currentDealer.name,
        offers
    })
})

app.get('/test2',(req,res)=>{
    Promise.all([
        fetch('http://localhost:4900/bug/101'),
        fetch('http://localhost:4900/bug/202')
    ]).then(()=>{console.log("Ran bug code")})

    res.send()
})

//3. 2 ka bug fix (keep things in function scope and not module scope)
//dont declare car/dealer/offers in module scope else all users will have one bucket they are referring to and will just overwrite
//previous data 
app.get('/correct/:carId', async (req, res)=>{
    const {carId} = req.params
    const car = await findCar(carId)
    const dealer = await findDealer(car.dealerId)
    const offers = await findOffers(dealer.id)

     console.log(`${carId} -> ${dealer.name}`)
    res.json({
        car:car.model,
        dealer:dealer.name,
        offers
    })
})
app.get('/test3', (req,res)=>{
     Promise.all([
        fetch('http://localhost:4900/correct/101'),
        fetch('http://localhost:4900/correct/202')
    ]).then(()=>{console.log("Ran bug code")})

    res.send()
})
app.listen(4900, ()=>{
    console.log('Listening on port : http://localhost:4900')
})