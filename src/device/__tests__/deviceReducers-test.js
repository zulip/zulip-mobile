import deepFreeze from 'deep-freeze';

import { INIT_SAFE_AREA_INSETS } from '../../actionConstants';
import deviceReducers from '../deviceReducers';

describe('appReducers', () => {
  describe('INIT_SAFE_AREA_INSETS', () => {
    test('Store updated safe area insets', () => {
      const prevState = deepFreeze({
        safeAreaInsets: {
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
        },
      });

      const action = deepFreeze({
        type: INIT_SAFE_AREA_INSETS,
        safeAreaInsets: {
          bottom: 0,
          left: 0,
          right: 0,
          top: 20,
        },
      });

      const expectedState = {
        safeAreaInsets: {
          bottom: 0,
          left: 0,
          right: 0,
          top: 20,
        },
      };
      const newState = deviceReducers(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
