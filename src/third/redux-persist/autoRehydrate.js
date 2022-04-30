/* @flow strict-local */
import type { StoreEnhancer, Reducer } from 'redux';
import invariant from 'invariant';

import * as logging from '../../utils/logging';
import { REHYDRATE } from './constants';
import isStatePlainEnough from './utils/isStatePlainEnough';

export default function autoRehydrate<S: { ... }, A: { +type: string, ... }, D>(
  config: {|
    log?: boolean,
    stateReconciler?: empty,
  |} = Object.freeze({}),
): StoreEnhancer<S, A, D> {
  const stateReconciler = config.stateReconciler || defaultStateReconciler;

  // The StoreEnhancer API has an overload that's hard to represent with
  // Flow.
  return next => (reducer: Reducer<S, A>, initialState: $FlowFixMe, enhancer?: $FlowFixMe) => {
    const store = next(liftReducer(reducer), initialState, enhancer);
    return {
      ...store,
      replaceReducer: reducer => store.replaceReducer(liftReducer(reducer)),
    };
  };

  function liftReducer(reducer: Reducer<S, A>): Reducer<S, A> {
    let rehydrated = false;
    const preRehydrateActions = [];
    return (state: S | void, action: A): S => {
      if (action.type !== REHYDRATE) {
        if (config.log === true && !rehydrated) {
          // store pre-rehydrate actions for debugging
          preRehydrateActions.push(action);
        }
        return reducer(state, action);
      } else {
        // This is the REHYDRATE action, not the initial action. The state
        // will only ever be undefined before the initial action.
        invariant(state, 'expected non-void state');

        if (config.log === true && !rehydrated) {
          logPreRehydrate(preRehydrateActions);
        }
        rehydrated = true;

        // If type is REHYDRATE, action will have a payload
        const inboundState = (action: $FlowFixMe).payload;
        const reducedState = reducer(state, action);

        return stateReconciler(state, inboundState, reducedState, config.log === true);
      }
    };
  }
}

function logPreRehydrate<A: { +type: string, ... }>(preRehydrateActions: $ReadOnlyArray<A>) {
  const concernedActions = preRehydrateActions.slice(1);
  if (concernedActions.length > 0) {
    logging.warn(
      `
      redux-persist/autoRehydrate: ${concernedActions.length} actions were fired before rehydration completed. This can be a symptom of a race
      condition where the rehydrate action may overwrite the previously affected state. Consider running these actions
      after rehydration.
    `,
      { concernedActionTypes: concernedActions.map(a => a.type) },
    );
  }
}

function defaultStateReconciler<S: { ... }>(
  state: S,
  inboundState: S,
  reducedState: S,
  log: boolean,
): S {
  const newState = { ...reducedState };

  Object.keys(inboundState).forEach(key => {
    // if initialState does not have key, skip auto rehydration
    /* $FlowIgnore[method-unbinding]: This is the standard way to call
       `hasOwnProperty`. See discussion:
         https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/Flow.20158.20errors/near/1375563
    */
    if (!Object.prototype.hasOwnProperty.call(state, key)) {
      return;
    }

    // if initial state is an object but inbound state is null/undefined, skip
    if (typeof state[key] === 'object' && !inboundState[key]) {
      if (log) {
        logging.warn(
          'redux-persist/autoRehydrate: sub state for a key is falsy but initial state is an object, skipping autoRehydrate.',
          { key },
        );
      }
      return;
    }

    // if reducer modifies substate, skip auto rehydration
    if (state[key] !== reducedState[key]) {
      if (log) {
        logging.warn(
          'redux-persist/autoRehydrate: sub state for a key modified, skipping autoRehydrate.',
          { key },
        );
      }
      newState[key] = reducedState[key];
      return;
    }

    // otherwise take the inboundState
    if (isStatePlainEnough(inboundState[key]) && isStatePlainEnough(state[key])) {
      // shallow merge
      newState[key] = { ...state[key], ...inboundState[key] };
    } else {
      // hard set
      newState[key] = inboundState[key];
    }
  });
  return newState;
}
