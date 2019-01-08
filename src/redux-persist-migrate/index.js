import { REHYDRATE } from 'redux-persist/constants';

import { logErrorRemotely } from '../utils/logging';

const processKey = key => {
  const int = parseInt(key, 10);
  if (Number.isNaN(int)) {
    throw new Error('redux-persist-migrate: migrations must be keyed with integer values');
  }
  return int;
};

export default function createMigration(manifest, versionSelector, versionSetter) {
  if (typeof versionSelector === 'string') {
    const reducerKey = versionSelector;
    versionSelector = state => state && state[reducerKey] && state[reducerKey].version;
    versionSetter = (state, version) => {
      if (['undefined', 'object'].indexOf(typeof state[reducerKey]) === -1) {
        logErrorRemotely(
          new Error(
            'redux-persist-migrate: state for versionSetter key must be an object or undefined',
          ),
        );
        return state;
      }
      state[reducerKey] = state[reducerKey] || {};
      state[reducerKey].version = version;
      return state;
    };
  }

  const versionKeys = Object.keys(manifest)
    .map(processKey)
    .sort((a, b) => a - b);
  let currentVersion = versionKeys[versionKeys.length - 1];
  if (!currentVersion && currentVersion !== 0) {
    currentVersion = -1;
  }

  const migrate = (state, version) => {
    versionKeys.filter(v => v > version || version === null).forEach(v => {
      state = manifest[v](state);
    });

    state = versionSetter(state, currentVersion);
    return state;
  };

  const migrationDispatch = next => action => {
    if (action.type === REHYDRATE) {
      const incomingState = action.payload;
      let incomingVersion = parseInt(versionSelector(incomingState), 10);
      if (Number.isNaN(incomingVersion)) {
        incomingVersion = null;
        // first launch after install, so initial state is empty object
        // migration not required, just update verion
        action.payload = versionSetter(incomingState, currentVersion);
        return next(action);
      }

      if (incomingVersion !== currentVersion) {
        const migratedState = migrate(incomingState, incomingVersion);
        action.payload = migratedState;
      }
    }
    return next(action);
  };

  return next => (reducer, initialState, enhancer) => {
    const store = next(reducer, initialState, enhancer);
    return {
      ...store,
      dispatch: migrationDispatch(store.dispatch),
    };
  };
}
