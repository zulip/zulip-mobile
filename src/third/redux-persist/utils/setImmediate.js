/* @flow strict-local */

const hasNativeSupport =
  typeof global !== 'undefined' && typeof global.setImmediate !== 'undefined';
const setImmediate: (() => mixed, ms?: number) => TimeoutID = hasNativeSupport
  ? (fn, ms) => global.setImmediate(fn, ms)
  : (fn, ms) => setTimeout(fn, ms);

export default setImmediate;
