//we are using type : commonjs so expect for nextTick to be be given utmost priority after synchronous tasks

//goal of this lab is to show that queues drain exhaustively: When Node starts processing a queue, it will not move on until 
//that queue is entirely empty—even if new items are added while it is processing.

//timers run one by one, before node moves from one timer to the next node pauses to check the nextTick and microtasks queue

console.log("A  sync start")
//A and B will run first as they are synchronous

setTimeout(() => {
  console.log('E   timer 1');
  Promise.resolve().then(() => {console.log('F   micro    — from timer 1')});
  process.nextTick(() => {console.log('F0  nextTick — from timer 1')});
}, 0);

setTimeout(() => {
  console.log('G   timer 2');
  Promise.resolve().then(() => {console.log('H   micro    — from timer 2')});
}, 0);

Promise.resolve().then(()=>{
    console.log('D  promise 1')
    process.nextTick(()=>{
        console.log("D2 nextTick -> shecduled inside a promice")
    })
    Promise.resolve().then(()=>{console.log("D3 promise - nested")})
})
//synchromous:D promise 1 will execute first as it is an asynchronous task
//queue drains exhaustively...we can see that here. First we enter a micro taskqueue so node will first finish the microtasks first ie
//D3 will be printed next
//then at last D2 nextTick (even though netTick has vip treatment in common js, microtask queue was entered so we will finish that 
//first)

process.nextTick(()=>{
    console.log('C  nextTick 1')
    console.log("C  nextTick- nested -")
})


console.log("B  sync ends")