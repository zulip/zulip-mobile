import deepFreeze from 'deep-freeze';

import alertWordsReducer from '../alertWordsReducer';
import { REGISTER_COMPLETE, EVENT_ALERT_WORDS } from '../../actionConstants';

describe('alertWordsReducer', () => {
  describe('REGISTER_COMPLETE', () => {
    test('when `alert_words` data is provided init state with it', () => {
      const initialState = deepFreeze([]);
      const action = deepFreeze({
        type: REGISTER_COMPLETE,
        data: {
          alert_words: ['word', '@mobile-core', 'alert'],
        },
      });
      const expectedState = ['word', '@mobile-core', 'alert'];

      const actualState = alertWordsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    // TODO(#5102): Delete; see comment on implementation.
    test('when no `alert_words` data is given reset state', () => {
      const initialState = deepFreeze(['word']);
      const action = deepFreeze({
        type: REGISTER_COMPLETE,
        data: {},
      });
      const expectedState = [];

      const actualState = alertWordsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_ALERT_WORDS', () => {
    test('on first call adds new data', () => {
      const initialState = deepFreeze([]);
      const action = deepFreeze({
        type: EVENT_ALERT_WORDS,
        alert_words: ['word', '@mobile-core', 'alert'],
      });
      const expectedState = ['word', '@mobile-core', 'alert'];

      const actualState = alertWordsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('subsequent calls replace existing data', () => {
      const initialState = deepFreeze(['word', '@mobile-core', 'alert']);
      const action = deepFreeze({
        type: EVENT_ALERT_WORDS,
        alert_words: ['word', '@mobile-core', 'new alert'],
      });
      const expectedState = ['word', '@mobile-core', 'new alert'];

      const actualState = alertWordsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
