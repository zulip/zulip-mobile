/* @flow */
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { REHYDRATE } from 'redux-persist/constants';
import createActionBuffer from 'redux-action-buffer';

const middleware = [thunk, createActionBuffer(REHYDRATE)];

// Only enable remote debugging! It really slows down the iOS JSC
// Checking for btoa() is not available in JSC
const enableLogging = process.env.NODE_ENV === 'development' && !!global.btoa;

if (enableLogging) {
  middleware.push(createLogger());
}

export default middleware;
