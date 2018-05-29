/* @flow */
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import createActionBuffer from 'redux-action-buffer';
import { createReactNavigationReduxMiddleware } from 'react-navigation-redux-helpers';

import config from '../config';
import { REHYDRATE } from '../actionConstants';

const reactNavigationMiddleware = createReactNavigationReduxMiddleware('root', state => state.nav);

const middleware = [reactNavigationMiddleware, thunk, createActionBuffer(REHYDRATE)];

if (config.enableReduxLogging) {
  middleware.push(
    createLogger({
      duration: true,
      // predicate: (getState, action) => action.type === 'MESSAGE_FETCH_COMPLETE',
    }),
  );
}

export default middleware;
