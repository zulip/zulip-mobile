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

const isStateGoingBack = (cur: GlobalState, prev: GlobalState): boolean =>
  cur.nav.routes.length < prev.nav.routes.length
  || cur.nav.isTransitioning
  || prev.nav.isTransitioning
  || isEqual(cur, prev);

/**
 * DEPRECATED.  Don't add uses, and remove existing ones.
 *
 * Meant to be passed as the fourth argument, `options`, to Redux `connect`.
 * This is a hack that stops Redux from causing a component to re-render in
 * certain cases while we're performing a navigation.
 *
 * Some components look at `state.nav` (through various selectors) to decide
 * things like the color of the top nav bar, or whether to show a
 * back-button at the start of the top nav bar.  When such a component is in
 * view and then the user navigates somewhere, that nav state changes to
 * something completely irrelevant to this component, but the component is
 * still visible -- for the 300ms of the transition, and perhaps longer on a
 * slow device -- so it gets re-rendered, now with the bogus data.
 *
 * This was meant as a hack to fix that.  But
 *  * it doesn't completely work; see e.g. #2797
 *  * it causes bugs of its own; see e.g. #2808
 *  * it involves telling Redux a dirty lie; our `isStateGoingBack` is
 *    neither transitive nor symmetric, making it nothing like a real notion
 *    of equality.  This is basically the root cause of the bugs it causes.
 *
 * Instead, components that render within a screen (i.e. virtually all of
 * them) should get nav-related information through props, so that they
 * stick with their own screen's data while we transition to a new one.  We
 * applied this strategy successfully in #2746/#2748 to fix several issues;
 * just need to apply it to the few cases of this pattern that remain.
 */
export const connectPreserveOnBackOption = { areStatesEqual: isStateGoingBack };
