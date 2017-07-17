/* @flow */
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { REHYDRATE } from 'redux-persist/constants';
import createActionBuffer from 'redux-action-buffer';

import config from './config';

const middleware = [thunk, createActionBuffer(REHYDRATE)];

if (config.enableReduxLogging) {
  middleware.push(createLogger({ duration: true }));
}

export default middleware;
