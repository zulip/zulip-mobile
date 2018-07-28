import deepFreeze from 'deep-freeze';

import { getCaughtUpForActiveNarrow } from '../caughtUpSelectors';
import { HOME_NARROW, HOME_NARROW_STR } from '../../utils/narrow';

describe('getCaughtUpForActiveNarrow', () => {
  test('if a key with current narrow exists return it', () => {
    const state = deepFreeze({
      caughtUp: {
        [HOME_NARROW_STR]: { older: false, newer: true },
      },
    });

    const caughtUp = getCaughtUpForActiveNarrow(HOME_NARROW)(state);

    expect(caughtUp).toEqual({ older: false, newer: true });
  });

  test('when caught up key does not exist return default values of false', () => {
    const state = deepFreeze({
      caughtUp: {},
    });

    const caughtUp = getCaughtUpForActiveNarrow(HOME_NARROW)(state);

    expect(caughtUp).toEqual({ older: false, newer: false });
  });
});
