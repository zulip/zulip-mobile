/* @flow */
import isEqual from 'lodash.isequal';

import config from '../config';
import timing from './timing';
import type { GlobalState } from '../types';

export const logSlowReducers = (reducers: Object): Object => {
  Object.keys(reducers).forEach((name: string) => {
    const originalReducer = reducers[name];
    reducers[name] = (state, action) => {
      const start = Date.now();
      const result = originalReducer(state, action);
      const end = Date.now();
      if (end - start >= config.slowReducersThreshold) {
        timing.add({
          text: `${action.type} @ ${name}`,
          start,
          end,
        });
      }
      return result;
    };
  });
  return reducers;
};

export const isStateGoingBack = (cur: GlobalState, prev: GlobalState): boolean =>
  cur.nav.routes.length < prev.nav.routes.length
  || cur.nav.isTransitioning
  || prev.nav.isTransitioning
  || isEqual(cur, prev);

export const connectPreserveOnBackOption = { areStatesEqual: isStateGoingBack };
