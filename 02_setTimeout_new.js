import { setTimeout } from 'node:timers/promises';

//we are importing a new version of setTimeout, rather than the standard global one we used
//in prev code

//The differences =>

// 1. What it Returns (Promises vs Callbacks)

// +++Standard Global setTimeout+++: Takes a callback function as its first argument and returns a
// timer object. You cannot use await with it.

// +++node:timers/promises setTimeout+++: Returns a Promise that resolves after the timer finishes.
// This is what allows you to use await.

// 2. Argument Order
// Standard: setTimeout(callback, delay)
// Promise version: setTimeout(delay, value), we dont pass callback func to it

await setTimeout(1000)//not passing any value, 1sec passed

const result = await setTimeout(1000, 'More 1 second has passed')

console.log(result)//will be printed after approx 2 sec

//with the standard setTimeout we would have (for the same result)->
// setTimeout(()=>{
//     console.log("More 1 second has passed")
// },2000)