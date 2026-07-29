console.log('A sync  --top of script')
//synchronous code is the highest priority hence A, B will be executed at the start instantly

process.nextTick(()=>(console.log('C nextTick -process.nextTick')))
//once main files are finished executing, call stack is empty. Node looks for the next task
//before checking standard event loop it first checks node only queue called nextTick queue


Promise.resolve().then(() => console.log('D   microtask  — promise.then'));
queueMicrotask(() => console.log('E   microtask    — queueMicrotask'));
//both belong to micro task queue. This queue belongs to the V8 JavaScript engine and handles Promises.
//Because Promise.then and queueMicrotask belong to the exact same queue, they are treated as equals. 
//They run in FIFO (First In, First Out) order. Since Promise.resolve().then was written higher up in the file than queueMicrotask, 
//D prints first, followed immediately by E.

setTimeout(() => console.log('F   timer    — setTimeout(…, 0)'), 0);
//Timers phase is part of the actual Event Loop (a "macrotask"), which means it sits entirely below nextTick and Microtasks in priority.

console.log('B sync  --bottom of script')



//If we use "type":"module" ie Ecma Script rather than "type":"commonjs" -> then the order will be A,B,D,E,C,F
//So now the order is A,B,D,E,C,F

//But if we force it to run as commonjs by making it "06_ordering_basics.cjs" then A,B,C,D,E,F
