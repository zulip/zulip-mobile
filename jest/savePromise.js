// For facebook/jest#10221. Before Jest's setup files have run, take
// note of what the natural value of `global.Promise` is, so we can
// restore it in restorePromise.js.
global.originalPromise = Promise;
