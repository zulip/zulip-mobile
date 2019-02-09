import deepFreeze from 'deep-freeze';

import { getCaughtUpForNarrow } from '../caughtUpSelectors';
import { HOME_NARROW, HOME_NARROW_STR } from '../../utils/narrow';

describe('getCaughtUpForNarrow', () => {
  test('if a key with current narrow exists return it', () => {
    const state = deepFreeze({
      caughtUp: {
        [HOME_NARROW_STR]: { older: false, newer: true },
      },
    });

    const caughtUp = getCaughtUpForNarrow(state, HOME_NARROW);

    expect(caughtUp).toEqual({ older: false, newer: true });
  });

  test('when caught up key does not exist return default values of false', () => {
    const state = deepFreeze({
      caughtUp: {},
    });

    const caughtUp = getCaughtUpForNarrow(state, HOME_NARROW);

    expect(caughtUp).toEqual({ older: false, newer: false });
  });
});
