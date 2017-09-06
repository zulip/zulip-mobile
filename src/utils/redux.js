/* @flow */
import type { Action, GlobalState, Reducer } from '../types';
import { BATCH_ACTIONS } from '../actionConstants';
import timing from './timing';

// Thanks to https://twitter.com/dan_abramov/status/656074974533459968?lang=en
export const enableBatching = (reducer: Reducer) => (state: GlobalState, action: Action) => {
  switch (action.type) {
    case BATCH_ACTIONS:
      return action.actions.reduce(reducer, state);
    default:
      return reducer(state, action);
  }
};

export const logSlowReducers = (reducers: Object): Object => {
  Object.keys(reducers).forEach(name => {
    const originalReducer = reducers[name];
    reducers[name] = (state, action) => {
      const start = Date.now();
      const result = originalReducer(state, action);
      const end = Date.now();
      if (end - start >= 16) {
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
