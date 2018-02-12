import deepFreeze from 'deep-freeze';

import { getCaughtUpForActiveNarrow } from '../caughtUpSelectors';
import { navStateWithNarrow } from '../../utils/testHelpers';
import { homeNarrow, homeNarrowStr } from '../../utils/narrow';

describe('getCaughtUpForActiveNarrow', () => {
  test('if a key with current narrow exists return it', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(homeNarrow),
      caughtUp: {
        [homeNarrowStr]: { older: false, newer: true },
      },
    });

    const caughtUp = getCaughtUpForActiveNarrow(state);

    expect(caughtUp).toEqual({ older: false, newer: true });
  });

  test('when caught up key does not exist return default values of false', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(homeNarrow),
      caughtUp: {},
    });

    const caughtUp = getCaughtUpForActiveNarrow(state);

    expect(caughtUp).toEqual({ older: false, newer: false });
  });
});
