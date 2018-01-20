/* @flow */
import config from '../config';
import timing from './timing';

export const logSlowReducers = (reducers: Object): Object => {
  Object.keys(reducers).forEach((name: string) => {
    const originalReducer = reducers[name];
    reducers[name] = (state, action) => {
      const start = Date.now();
      const result = originalReducer(state, action);
      const end = Date.now();
      if (end - start >= config.slowReducersThreshold) {
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
