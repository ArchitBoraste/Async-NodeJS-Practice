import { readFile } from 'node:fs/promises';
//now we are using the async way of reading files

const start = Date.now()
const timeEllapsed = () => `+${String(Date.now()-start).padStart(5,' ')}ms`

const heartbeat= setInterval(()=>{
    console.log(`   + heartbeat        ${timeEllapsed()}`);
},100)

console.log(`[1] script start      ${timeEllapsed()}`)

await new Promise((r)=>setTimeout(r, 400))
//When we create a new Promise, you are wrapping an asynchronous task. The Promise takes a 
//callback function with two arguments: resolve (often abbreviated as r) and reject

//The first argument of setTimeout is the function to run when the time is up.
//The second argument is the delay (400 milliseconds).

//Because we placed await in front of the Promise, Node.js will pause the execution of this specific script right on this line.

//long form equivalent 
// await new Promise(function(resolve, reject) {
//   setTimeout(function() {
//     resolve(); // This tells the Promise it is finished
//   }, 400);
// });

console.log(`2] ASYNC I/O starts  ${timeEllapsed()}`);

for (let i = 0; i < 50_000; i++) {
  // Each await hands control back to the event loop, so the heartbeat gets a turn between every single file read.
  //and because of await we cant move further in the script
  await readFile('./package.json', 'utf8');
}

console.log(`[3] ASYNC I/O ends    ${timeEllapsed()}`);

clearInterval(heartbeat);
console.log(`[4] done              ${timeEllapsed()}`);

