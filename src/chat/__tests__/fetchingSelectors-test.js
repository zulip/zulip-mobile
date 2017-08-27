import deepFreeze from 'deep-freeze';

import { getFetchingForActiveNarrow } from '../fetchingSelectors';
import { homeNarrow, homeNarrowStr } from '../../utils/narrow';

describe('getFetchingForActiveNarrow', () => {
  test('if no narrow information exists in state, return a null fetching object', () => {
    const state = deepFreeze({
      chat: {
        narrow: homeNarrow,
      },
      fetching: {},
    });
    const expectedResult = { older: false, newer: false };

    const actualResult = getFetchingForActiveNarrow(state);

    expect(actualResult).toEqual(expectedResult);
  });

  test('if an entry matching current narrow exists, it is returned', () => {
    const state = deepFreeze({
      chat: {
        narrow: homeNarrow,
      },
      fetching: {
        [homeNarrowStr]: { older: true, newer: true },
      },
    });
    const expectedResult = { older: true, newer: true };

    const actualResult = getFetchingForActiveNarrow(state);

    expect(actualResult).toEqual(expectedResult);
  });
});
