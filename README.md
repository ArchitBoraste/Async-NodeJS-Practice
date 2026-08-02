# Node.js Event Loop Architecture (08_setTimeout_setImmediate.js)



Understanding how Node.js manages asynchronous non-blocking operations is essential for building scalable backends. 

The Event Loop processes tasks through **six distinct phases** in a specific sequence during each iteration (tick). Below is the phase-by-phase execution breakdown:

## Event Loop Phases

| Order | Phase | What it does |
| :---: | :--- | :--- |
| **1** | **Timers** | Executes callbacks scheduled by `setTimeout` and `setInterval`. |
| **2** | **Pending Callbacks** | Executes I/O callbacks deferred to the next loop iteration (mostly internal OS-level errors like TCP port conflicts). |
| **3** | **Idle, Prepare** | Only used internally by Node.js. Developers don't interact with this. |
| **4** | **Poll** | The most important phase. Retrieves new I/O events (database queries returning, files finishing reading, network requests arriving). If the queue is empty, the loop will pause here and wait for new events to arrive. |
| **5** | **Check** | Executes callbacks specifically scheduled by `setImmediate`. |
| **6** | **Close Callbacks** | Executes cleanup code, like `socket.on('close', ...)`. |


### Nullish Coalescing Operator (`??`)

The `??` operator returns the right-hand value **only if** the left-hand value is `null` or `undefined`.

```javascript
return offersByDealer[dealerId] ?? [];
```

* **Valid Key (e.g., `dealerId = 7`):** `offersByDealer[7]` exists -> returns the array of offers.
* **Missing Key (e.g., `dealerId = 999`):** `offersByDealer[999]` is `undefined` -> falls back to `[]`.

#### Why use it?
It acts as a safety net. By returning an empty array `[]` instead of `undefined`, it prevents frontend runtime crashes when calling array methods like `.map()` or `.length`.