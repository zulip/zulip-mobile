import * as logging from '../../utils/logging';

import { REHYDRATE } from './constants';
import isStatePlainEnough from './utils/isStatePlainEnough';

export default function autoRehydrate(config = {}) {
  const stateReconciler = config.stateReconciler || defaultStateReconciler;

  return (next) => (reducer, initialState, enhancer) => {
    const store = next(liftReducer(reducer), initialState, enhancer);
    return {
      ...store,
      replaceReducer: (reducer) => store.replaceReducer(liftReducer(reducer))
    };
  };

  function liftReducer(reducer) {
    let rehydrated = false;
    const preRehydrateActions = [];
    return (state, action) => {
      if (action.type !== REHYDRATE) {
        if (config.log && !rehydrated) {
          // store pre-rehydrate actions for debugging
          preRehydrateActions.push(action);
        }
        return reducer(state, action);
      } else {
        if (config.log && !rehydrated) {
          logPreRehydrate(preRehydrateActions);
        }
        rehydrated = true;

        const inboundState = action.payload;
        const reducedState = reducer(state, action);

        return stateReconciler(state, inboundState, reducedState, config.log);
      }
    };
  }
}

function logPreRehydrate(preRehydrateActions) {
  const concernedActions = preRehydrateActions.slice(1);
  if (concernedActions.length > 0) {
    logging.warn(`
      redux-persist/autoRehydrate: ${concernedActions.length} actions were fired before rehydration completed. This can be a symptom of a race
      condition where the rehydrate action may overwrite the previously affected state. Consider running these actions
      after rehydration.
    `, { concernedActionTypes: concernedActions.map(a => a.type) });
  }
}

function defaultStateReconciler(state, inboundState, reducedState, log) {
  const newState = { ...reducedState };

  Object.keys(inboundState).forEach((key) => {
    // if initialState does not have key, skip auto rehydration
    if (!Object.prototype.hasOwnProperty.call(state, key)) {
      return;
    }

    // if initial state is an object but inbound state is null/undefined, skip
    if (typeof state[key] === 'object' && !inboundState[key]) {
      if (log) {
        logging.warn('redux-persist/autoRehydrate: sub state for a key is falsy but initial state is an object, skipping autoRehydrate.', { key });
      }
      return;
    }

    // if reducer modifies substate, skip auto rehydration
    if (state[key] !== reducedState[key]) {
      if (log) {
        logging.warn('redux-persist/autoRehydrate: sub state for a key modified, skipping autoRehydrate.', { key });
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
