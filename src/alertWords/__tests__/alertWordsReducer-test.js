/* @flow strict-local */

import deepFreeze from 'deep-freeze';

import alertWordsReducer from '../alertWordsReducer';
import { EVENT_ALERT_WORDS } from '../../actionConstants';
import * as eg from '../../__tests__/lib/exampleData';

describe('alertWordsReducer', () => {
  describe('RESET_ACCOUNT_DATA', () => {
    const initialState = eg.baseReduxState.alertWords;
    const action1 = eg.mkActionRegisterComplete({ alert_words: ['word', '@mobile-core', 'alert'] });
    const prevState = alertWordsReducer(initialState, action1);
    expect(prevState).not.toEqual(initialState);

    expect(alertWordsReducer(prevState, eg.action.reset_account_data)).toEqual(initialState);
  });

  describe('REGISTER_COMPLETE', () => {
    test('when `alert_words` data is provided init state with it', () => {
      const prevState = deepFreeze([]);
      expect(
        alertWordsReducer(
          prevState,
          eg.mkActionRegisterComplete({ alert_words: ['word', '@mobile-core', 'alert'] }),
        ),
      ).toEqual(['word', '@mobile-core', 'alert']);
    });
  });

  describe('EVENT_ALERT_WORDS', () => {
    test('on first call adds new data', () => {
      const prevState = deepFreeze([]);
      expect(
        alertWordsReducer(
          prevState,
          deepFreeze({ type: EVENT_ALERT_WORDS, alert_words: ['word', '@mobile-core', 'alert'] }),
        ),
      ).toEqual(['word', '@mobile-core', 'alert']);
    });

    test('subsequent calls replace existing data', () => {
      const prevState = deepFreeze(['word', '@mobile-core', 'alert']);
      expect(
        alertWordsReducer(
          prevState,
          deepFreeze({
            type: EVENT_ALERT_WORDS,
            alert_words: ['word', '@mobile-core', 'new alert'],
          }),
        ),
      ).toEqual(['word', '@mobile-core', 'new alert']);
    });
  });
});
