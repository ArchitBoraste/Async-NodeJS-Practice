//similar as the 01_blocking.js but this time we are not doing an artificial busy wait like 
//the block func

import {readFileSync} from 'node:fs'

const start = Date.now()
const timeEllapsed = () =>`+${String(Date.now() - start).padStart(5,' ')}ms`

const heartbeat = setInterval(()=>{
    console.log(`   +heartbeat        ${timeEllapsed()}`)
},100)

console.log(`1] script start      ${timeEllapsed()}`)

setTimeout(()=>{
    console.log(`2] SYNC I/O starts   ${timeEllapsed()}`)

    for(let i=0;i<50_000;i++){
        readFileSync('./package.json', 'utf-8')
    }

    console.log(`3] SYNC I/O ends     ${timeEllapsed()}`);
},400)

setTimeout(()=>{
    clearInterval(heartbeat)
    console.log(`4]done    ${timeEllapsed()}`)
},6000)