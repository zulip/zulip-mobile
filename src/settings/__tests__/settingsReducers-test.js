import { SETTINGS_CHANGE } from '../../actionConstants';
import settingsReducers from '../settingsReducers';

describe('settingsReducers', () => {
  describe('SETTINGS_CHANGE', () => {
    test('sets a key if it does not exist', () => {
      const prevState = {};
      const action = {
        type: SETTINGS_CHANGE,
        key: 'key',
        value: 123,
      };
      const expectedState = {
        key: 123,
      };

      const actualState = settingsReducers(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('changes value of an existing key', () => {
      const prevState = {
        key: 123,
      };
      const action = {
        type: SETTINGS_CHANGE,
        key: 'key',
        value: 456,
      };
      const expectedState = {
        key: 456,
      };

      const actualState = settingsReducers(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
