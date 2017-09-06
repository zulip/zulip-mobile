/* @flow */
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import perfLogger from 'redux-perf-middleware';
import { REHYDRATE } from 'redux-persist/constants';
import createActionBuffer from 'redux-action-buffer';

import config from './config';

const middleware = [thunk, createActionBuffer(REHYDRATE)];

if (config.enableReduxLogging) {
  middleware.push(
    createLogger({
      duration: true,
      // predicate: (getState, action) => action.type === 'MESSAGE_FETCH_SUCCESS',
    }),
  );
}

if (config.enableReduxPerfLogging) {
  middleware.push(perfLogger);
}

export default middleware;
