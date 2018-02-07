/* @flow */
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { REHYDRATE } from 'redux-persist/constants';
import createActionBuffer from 'redux-action-buffer';
import { createReactNavigationReduxMiddleware } from 'react-navigation-redux-helpers';
import config from '../config';

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
