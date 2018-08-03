/* @flow */
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createReactNavigationReduxMiddleware } from 'react-navigation-redux-helpers';

import config from '../config';
import { getNav } from '../directSelectors';

const reactNavigationMiddleware = createReactNavigationReduxMiddleware('root', getNav);

const middleware = [reactNavigationMiddleware, thunk];

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
