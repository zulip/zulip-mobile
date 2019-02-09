import deepFreeze from 'deep-freeze';

import { getFetchingForNarrow, getIsFetching } from '../fetchingSelectors';
import { HOME_NARROW, HOME_NARROW_STR } from '../../utils/narrow';

describe('getFetchingForNarrow', () => {
  test('if no narrow information exists in state, return a null fetching object', () => {
    const state = deepFreeze({
      fetching: {},
    });
    const expectedResult = { older: false, newer: false };

    const actualResult = getFetchingForNarrow(HOME_NARROW)(state);

    expect(actualResult).toEqual(expectedResult);
  });

  test('if an entry matching current narrow exists, it is returned', () => {
    const state = deepFreeze({
      fetching: {
        [HOME_NARROW_STR]: { older: true, newer: true },
      },
    });
    const expectedResult = { older: true, newer: true };

    const actualResult = getFetchingForNarrow(HOME_NARROW)(state);

    expect(actualResult).toEqual(expectedResult);
  });
});

describe('getIsFetching', () => {
  test('when no initial fetching required and fetching is empty returns false', () => {
    const state = deepFreeze({
      fetching: {},
    });

    const result = getIsFetching(HOME_NARROW)(state);

    expect(result).toEqual(false);
  });

  test('if fetching older for current narrow returns true', () => {
    const state = deepFreeze({
      fetching: {
        [HOME_NARROW_STR]: { older: true, newer: false },
      },
    });

    const result = getIsFetching(HOME_NARROW)(state);

    expect(result).toEqual(true);
  });

  test('if fetching newer for current narrow returns true', () => {
    const state = deepFreeze({
      fetching: {
        [HOME_NARROW_STR]: { older: false, newer: true },
      },
    });

    const result = getIsFetching(HOME_NARROW)(state);

    expect(result).toEqual(true);
  });
});
