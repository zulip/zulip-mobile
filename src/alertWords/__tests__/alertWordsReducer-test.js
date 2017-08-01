import deepFreeze from 'deep-freeze';

import alertWordsReducer from '../alertWordsReducer';
import { INIT_ALERT_WORDS } from '../../actionConstants';

describe('alertWordsReducer', () => {
  describe('INIT_ALERT_WORDS', () => {
    test('add new alert words', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: INIT_ALERT_WORDS,
        alertWords: ['word', '@mobile-core', 'alert'],
      });

      const expectedState = ['word', '@mobile-core', 'alert'];

      const actualState = alertWordsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('update alert words list', () => {
      const initialState = deepFreeze(['word', '@mobile-core', 'alert']);

      const action = deepFreeze({
        type: INIT_ALERT_WORDS,
        alertWords: ['word', '@mobile-core', 'new alert'],
      });

      const expectedState = ['word', '@mobile-core', 'new alert'];

      const actualState = alertWordsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
