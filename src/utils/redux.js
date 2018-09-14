/* @flow */
import isEqual from 'lodash.isequal';

import config from '../config';
import timing from './timing';
import type { GlobalState } from '../types';

export const logSlowReducers = (reducers: Object): Object => {
  Object.keys(reducers).forEach((name: string) => {
    const originalReducer = reducers[name];
    reducers[name] = (state, action) => {
      const startMs = Date.now();
      const result = originalReducer(state, action);
      const endMs = Date.now();
      if (endMs - startMs >= config.slowReducersThreshold) {
        timing.add({
          text: `${action.type} @ ${name}`,
          startMs,
          endMs,
        });
      }
      return result;
    };
  });
  return reducers;
};

export const isNavTransitionGoingOn = (cur: GlobalState, prev: GlobalState): boolean =>
  cur.nav.isTransitioning || prev.nav.isTransitioning;

export const isStateGoingBack = (cur: GlobalState, prev: GlobalState): boolean =>
  cur.nav.routes.length < prev.nav.routes.length || isEqual(cur, prev);

export const connectPreserveOnBackOption = (disableNavTransitionEffect?: boolean) => ({
  areStatesEqual: (cur: GlobalState, prev: GlobalState) =>
    isStateGoingBack(cur, prev)
    || (!disableNavTransitionEffect && isNavTransitionGoingOn(cur, prev)),
});
