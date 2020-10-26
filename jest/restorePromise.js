// For facebook/jest#10221. After savePromise.js and Jest's setup
// files have run, restore the natural value of `global.Promise`.
global.Promise = global.originalPromise;
