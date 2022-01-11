/* @flow strict-local */
import type { Dispatch, StoreEnhancer } from 'redux';

import { REHYDRATE } from '../actionConstants';
import type { Action, GlobalState as State } from '../types';
import * as logging from '../utils/logging';

const processKey = key => {
  const int = parseInt(key, 10);
  if (Number.isNaN(int)) {
    throw new Error('redux-persist-migrate: migrations must be keyed with integer values');
  }
  return int;
};

/* eslint-disable no-use-before-define */

type PartialState = $ReadOnly<$Rest<State, { ... }>>;

export default function createMigration(
  manifest: {| [string]: (PartialState) => PartialState |},
  reducerKey: string,
): StoreEnhancer<State, Action, Dispatch<Action>> {
  const migratePayload = createMigrationFunction(manifest, reducerKey);

  const migrationDispatch = next => (action: Action) => {
    if (action.type === REHYDRATE) {
      /* $FlowIgnore[incompatible-type]
         this really is a lie -- and kind of central to migration */
      const incomingState: State = action.payload;
      return next({ ...action, payload: migratePayload(incomingState) });
    }
    return next(action);
  };

  return next => (reducer, initialState) => {
    const store = next(reducer, initialState);
    return {
      ...store,
      dispatch: migrationDispatch(store.dispatch),
    };
  };
}

/** Exported only for tests. */
export function createMigrationFunction(
  manifest: {| [string]: (PartialState) => PartialState |},
  reducerKey: string,
): PartialState => PartialState {
  const versionSelector = state => state && state[reducerKey] && state[reducerKey].version;
  const versionSetter = (state, version) => {
    if (['undefined', 'object'].indexOf(typeof state[reducerKey]) === -1) {
      logging.error(
        'redux-persist-migrate: state for versionSetter key must be an object or undefined',
        { version, reducerKey, 'actual-state': state[reducerKey] },
      );
      return state;
    }
    return { ...state, [reducerKey]: { ...state[reducerKey], version } };
  };

  const versionKeys = Object.keys(manifest)
    .map(processKey)
    .sort((a, b) => a - b);
  let currentVersion = versionKeys[versionKeys.length - 1];
  if (!currentVersion && currentVersion !== 0) {
    currentVersion = -1;
  }

  const migrate = (state, version) => {
    let newState = state;
    versionKeys
      .filter(v => v > version || version === null)
      .forEach(v => {
        newState = manifest[v.toString()](newState);
      });

    newState = versionSetter(newState, currentVersion);
    return newState;
  };

  return function migratePayload(incomingState: PartialState): PartialState {
    const incomingVersion = parseInt(versionSelector(incomingState), 10);
    if (Number.isNaN(incomingVersion)) {
      // first launch after install, so incoming state is empty object
      // migration not required, just update version
      const payload = versionSetter(incomingState, currentVersion);
      return payload;
    }

    if (incomingVersion !== currentVersion) {
      const migratedState = migrate(incomingState, incomingVersion);
      return migratedState;
    }

    return incomingState;
  };
}
