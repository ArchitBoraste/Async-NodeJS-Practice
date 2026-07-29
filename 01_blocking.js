//aim-> to show that synchronous work hold js thread for itself, hence not even a sceduled timer 
//can run

const start = Date.now()

const timeEllapsed = () => `+${String(Date.now() - start).padStart(4,' ')}ms`
//tells time elapsed since program started running

const heartBeat = setInterval(()=>{
    console.log(`   + heartbeat        ${timeEllapsed()}`);
},100)
//whenever node free, every 100 millisecond it will this

function block(duration){
    const finishedAt = Date.now() + duration
    while(Date.now()<finishedAt){
        //func not doing anything just blocking the thread
    }
}


console.log(`1) start ${timeEllapsed()}`)

//now we shall set timer which will execute 400 ms after program starts, and will call
//block with 1000ms as the duration
setTimeout(()=>{
    console.log(`2) Blocking started at ${timeEllapsed()}`)
    block(3000)
    console.log(`3) Blocking ended at ${timeEllapsed()}`)
},400)

//stop the program after 2000 ms 
//clearInterval stops a interval else setInterval will keep going on and node.js program wont 
//stop, unless done by ctrl c
setTimeout(()=>{
    clearInterval(heartBeat)
    console.log(`4) end ${timeEllapsed()}`)
},2000)

//EDIT-1 changed block duration to 3000 to see what happens 