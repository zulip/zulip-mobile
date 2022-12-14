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

    // TODO(#5102): Delete; see comment on implementation.
    test('when no `alert_words` data is given reset state', () => {
      const prevState = deepFreeze(['word']);
      const actualState = alertWordsReducer(
        prevState,
        eg.mkActionRegisterComplete({
          // Hmm, we should need a Flow suppression here. This property is
          // marked required in InitialData, and this explicit undefined is
          // meant to defy that; see TODO(#5102) above.
          // mkActionRegisterComplete is designed to accept input with this or
          // any property *omitted*… and I think, as a side effect of handling
          // that, Flow mistakenly accepts an explicit undefined here, so it
          // doesn't catch the resulting malformed InitialData.
          alert_words: undefined,
        }),
      );

      expect(actualState).toEqual([]);
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
