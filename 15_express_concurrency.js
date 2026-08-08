import express from 'express';
import { findCar, findDealer, findOffers } from './09_fake_db.js';

const app = express()

const start = process.hrtime.bigint()
const time = () => `${(Number(process.hrtime.bigint() - start) / 1_000_000).toFixed(0).padStart(5)}ms`

//Make 2 requests interleave here for example:
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

app.get('/test',(req,res)=>{
    console.log('running 2 routes for "/trace/:carId" simultaneously')
    Promise.all([
        fetch('http://localhost:4900/trace/101'),
        fetch('http://localhost:4900/trace/202')
    ])
    res.send()
})

app.listen(4900, ()=>{
    console.log('Listening on port : http://localhost:4900')
})