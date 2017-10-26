import deepFreeze from 'deep-freeze';

import caughtUpReducers from '../caughtUpReducers';
import { MESSAGE_FETCH_START, MESSAGE_FETCH_COMPLETE } from '../../actionConstants';
import { homeNarrow, homeNarrowStr } from '../../utils/narrow';

describe('caughtUpReducers', () => {
  describe('MESSAGE_FETCH_START', () => {
    test('when fetch starts caught up does not change', () => {
      const initialState = deepFreeze({
        [homeNarrowStr]: {
          older: true,
          newer: true,
        },
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_START,
        narrow: homeNarrow,
      });

      const newState = caughtUpReducers(initialState, action);

      expect(newState).toBe(initialState);
    });
  });

  describe('MESSAGE_FETCH_COMPLETE', () => {
    test('if messages received are less than requested then we are caught up', () => {
      const initialState = deepFreeze({
        [homeNarrowStr]: {
          older: false,
          newer: false,
        },
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        narrow: [],
        anchor: 1,
        messages: [{ id: 1 }, { id: 2 }, { id: 3 }],
        numBefore: 5,
        numAfter: 5,
      });

      const expectedState = {
        [homeNarrowStr]: {
          older: true,
          newer: true,
        },
      };

      const newState = caughtUpReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  test('if messages received are requested amount we consider it not yet caught up', () => {
    const initialState = deepFreeze({
      [homeNarrowStr]: {
        older: false,
        newer: false,
      },
    });

    const action = deepFreeze({
      type: MESSAGE_FETCH_COMPLETE,
      narrow: [],
      anchor: 3,
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      numBefore: 2,
      numAfter: 2,
    });

    const expectedState = {
      [homeNarrowStr]: {
        older: false,
        newer: false,
      },
    };

    const newState = caughtUpReducers(initialState, action);

    expect(newState).toEqual(expectedState);
  });

  test('new results do not reset previous state', () => {
    const initialState = deepFreeze({
      [homeNarrowStr]: {
        older: true,
        newer: true,
      },
    });

    const action = deepFreeze({
      type: MESSAGE_FETCH_COMPLETE,
      narrow: [],
      anchor: 3,
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      numBefore: 2,
      numAfter: 2,
    });

    const expectedState = {
      [homeNarrowStr]: {
        older: true,
        newer: true,
      },
    };

    const newState = caughtUpReducers(initialState, action);

    expect(newState).toEqual(expectedState);
  });
});
