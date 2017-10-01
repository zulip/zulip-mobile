/* @flow */
import timing from './timing';

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
