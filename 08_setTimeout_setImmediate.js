//If setTimeout(..., 0) means "run immediately", and setImmediate also means "run immediately", which one actually runs first?

import {readFile} from 'node:fs'

//const start = Date.now()
const start = process.hrtime.bigint();

//const timeEllapsed = () => `+${String(Date.now() - start).padStart(3, " ")}ms`
const timeEllapsed = () => {
  const ms = Number(process.hrtime.bigint() - start) / 1_000_000;
  return `+${ms.toFixed(3).padStart(8, ' ')}ms`;
};

console.log(`1) ${timeEllapsed()}`)
setTimeout(()=>{console.log(`timeout (event loop:timers) -> ${timeEllapsed()}`)},0)
setImmediate(()=>{console.log(`immediate (event loop: check) -> ${timeEllapsed()}`)})
//this time any one can win, its just by chance. Rune this file multi times and you will see that sometimes timeout first other
//times immediate

readFile('./package.json', ()=>{
    console.log(`2) inside i/o callback -> ${timeEllapsed()}`)
    setTimeout(()=>{console.log(`timeout (timers) -> ${timeEllapsed()}`)},0)
    setImmediate(()=>{console.log(`immediate (event loop: check) -> ${timeEllapsed()}`)})
})
//here the setImmediate will win as 'check' comes immediately after 'poll' in event loop. Check readme for event loop table

