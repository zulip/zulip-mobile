import deepFreeze from 'deep-freeze';

import { getCaughtUpForActiveNarrow } from '../caughtUpSelectors';
import { homeNarrow, homeNarrowStr } from '../../utils/narrow';

describe('getCaughtUpForActiveNarrow', () => {
  test('TODO', () => {
    const state = deepFreeze({
      chat: {
        narrow: homeNarrow,
      },
      caughtUp: {
        [homeNarrowStr]: { older: false, newer: true },
      },
    });

    const caughtUp = getCaughtUpForActiveNarrow(state);

    expect(caughtUp).toEqual({ older: false, newer: true });
  });

  test('TODO2', () => {
    const state = deepFreeze({
      chat: {
        narrow: homeNarrow,
      },
      caughtUp: {},
    });

    const caughtUp = getCaughtUpForActiveNarrow(state);

    expect(caughtUp).toEqual({ older: false, newer: false });
  });
});
