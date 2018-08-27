import { REHYDRATE } from './constants';
import isStatePlainEnough from './utils/isStatePlainEnough';
import { logErrorRemotely } from '../../utils/logging';

function defaultStateReconciler(state, inboundState, reducedState, log) {
  const newState = { ...reducedState };

  Object.keys(inboundState).forEach(key => {
    // if initialState does not have key, skip auto rehydration
    if (!Object.prototype.hasOwnProperty.call(state, key)) {
      return;
    }

    // if initial state is an object but inbound state is null/undefined, skip
    if (typeof state[key] === 'object' && !inboundState[key]) {
      if (log) {
        logErrorRemotely(
          new Error(
            `redux-persist/autoRehydrate: sub state for key \`${key}\` is falsy but initial state is an object, skipping autoRehydrate.`,
          ),
        );
      }
      return;
    }

    // if reducer modifies substate, skip auto rehydration
    if (state[key] !== reducedState[key]) {
      if (log) {
        logErrorRemotely(
          new Error(
            `redux-persist/autoRehydrate: sub state for key \`${key}\` modified, skipping autoRehydrate.`,
          ),
        );
      }
      newState[key] = reducedState[key];
      return;
    }

    // otherwise take the inboundState
    if (isStatePlainEnough(inboundState[key]) && isStatePlainEnough(state[key])) {
      newState[key] = { ...state[key], ...inboundState[key] };
      // shallow merge
    } else {
      newState[key] = inboundState[key];
    } // hard set

    if (log) {
      logErrorRemotely(
        new Error(`redux-persist/autoRehydrate: key \`${key}\`, rehydrated to ${newState[key]}`),
      );
    }
  });
  return newState;
}

function logPreRehydrate(preRehydrateActions) {
  const concernedActions = preRehydrateActions.slice(1);
  if (concernedActions.length > 0) {
    logErrorRemotely(
      new Error(
        `redux-persist/autoRehydrate: ${
          concernedActions.length
        } actions were fired before rehydration completed. This can be a symptom of a race
        condition where the rehydrate action may overwrite the previously affected state. Consider running these actions
        after rehydration: ${concernedActions}`,
      ),
    );
  }
}

export default function autoRehydrate(config = {}) {
  const stateReconciler = config.stateReconciler || defaultStateReconciler;

  function liftReducer(reducer) {
    let rehydrated = false;
    const preRehydrateActions = [];
    return (state, action) => {
      if (action.type !== REHYDRATE) {
        if (config.log && !rehydrated) {
          preRehydrateActions.push(action);
        } // store pre-rehydrate actions for debugging
        return reducer(state, action);
      }
      if (config.log && !rehydrated) {
        logPreRehydrate(preRehydrateActions);
      }
      rehydrated = true;

      const inboundState = action.payload;
      const reducedState = reducer(state, action);

      return stateReconciler(state, inboundState, reducedState, config.log);
    };
  }

  return next => (reducer, initialState, enhancer) => {
    const store = next(liftReducer(reducer), initialState, enhancer);
    return {
      ...store,
      replaceReducer: _reducer => store.replaceReducer(liftReducer(_reducer)),
    };
  };
}
