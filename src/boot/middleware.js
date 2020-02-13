/* @flow strict-local */
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import createActionBuffer from 'redux-action-buffer';
import { createReactNavigationReduxMiddleware } from 'react-navigation-redux-helpers';

import config from '../config';
import { REHYDRATE } from '../actionConstants';
import { getNav } from '../selectors';

const reactNavigationMiddleware = createReactNavigationReduxMiddleware('root', getNav);

const middleware = [reactNavigationMiddleware, createActionBuffer(REHYDRATE), thunkMiddleware];

if (config.enableReduxLogging) {
  middleware.push(
    createLogger({
      duration: true,
      // See docs/howto/debugging.md.
      // diff: true,
      // predicate: (getState, action) => action.type === 'MESSAGE_FETCH_COMPLETE',
    }),
  );
}

export default middleware;
