import {
  ACCOUNT_SWITCH,
} from '../../constants';
import appReducers from '../appReducers';

describe('appReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('reissues initial fetch', () => {
      const prevState = {};
      const action = {
        type: ACCOUNT_SWITCH,
      };

      const newState = appReducers(prevState, action);

      expect(newState.needsInitialFetch).toBe(true);
    });
  });
});
