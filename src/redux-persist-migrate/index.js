import { REHYDRATE } from 'redux-persist/constants'

const processKey = (key) => {
  let int = parseInt(key)
  if (isNaN(int)) throw new Error('redux-persist-migrate: migrations must be keyed with integer values')
  return int
}

export default function createMigration (manifest, versionSelector, versionSetter) {
  if (typeof versionSelector === 'string') {
    let reducerKey = versionSelector
    versionSelector = (state) => state && state[reducerKey] && state[reducerKey].version
    versionSetter = (state, version) => {
      if (['undefined', 'object'].indexOf(typeof state[reducerKey]) === -1) {
        console.error('redux-persist-migrate: state for versionSetter key must be an object or undefined')
        return state
      }
      state[reducerKey] = state[reducerKey] || {}
      state[reducerKey].version = version
      return state
    }
  }

  const versionKeys = Object.keys(manifest).map(processKey).sort((a, b) => a - b)
  let currentVersion = versionKeys[versionKeys.length - 1]
  if (!currentVersion && currentVersion !== 0) currentVersion = -1

  const migrationDispatch = (next) => (action) => {
    if (action.type === REHYDRATE) {
      const incomingState = action.payload
      let incomingVersion = parseInt(versionSelector(incomingState))
      if (isNaN(incomingVersion)) incomingVersion = null

      if (incomingVersion !== currentVersion) {
        const migratedState = migrate(incomingState, incomingVersion)
        action.payload = migratedState
      }
    }
    return next(action)
  }

  const migrate = (state, version) => {
    versionKeys
      .filter((v) => v > version || version === null)
      .forEach((v) => { state = manifest[v](state) })

    state = versionSetter(state, currentVersion)
    return state
  }

  return (next) => (reducer, initialState, enhancer) => {
    var store = next(reducer, initialState, enhancer)
    return {
      ...store,
      dispatch: migrationDispatch(store.dispatch)
    }
  }
}
