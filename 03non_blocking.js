import {setTimeout as sleep} from 'node:timers/promises'
//importing the new setTimeout we saw in prev code as 'sleep'

const start = Date.now()
const timeEllapsed = () => `+${String(Date.now() - start).padStart(4, ' ')}ms`

//old setTimeout forced us to use callbacks
//modern setTimeout(sleep here) returns a promise

const heartbeat = setInterval(() => {
  console.log(`   +heartbeat        ${timeEllapsed()}`);
}, 100);

console.log(`[1] script start      ${timeEllapsed()}`);

await sleep(400)
//does not freeze the CPU. Instead, it says: "Start a 400ms timer in the background. In the 
//meantime, pause this script right here, and go do other things."

console.log(`[2] ASYNC work starts ${timeEllapsed()}`);
await sleep(1000); // gives control back to the loop
console.log(`[3] ASYNC work ends   ${timeEllapsed()}`);

await sleep(600);
clearInterval(heartbeat);
console.log(`[4] done              ${timeEllapsed()}`);