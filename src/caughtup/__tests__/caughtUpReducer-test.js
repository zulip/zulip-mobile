/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import caughtUpReducer from '../caughtUpReducer';
import { MESSAGE_FETCH_ERROR } from '../../actionConstants';
import { HOME_NARROW, HOME_NARROW_STR, SEARCH_NARROW } from '../../utils/narrow';

describe('caughtUpReducer', () => {
  describe('MESSAGE_FETCH_START', () => {
    test('when fetch starts caught up does not change', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: {
          older: true,
          newer: true,
        },
      });

      const action = deepFreeze({
        ...eg.action.message_fetch_start,
        narrow: HOME_NARROW,
      });

      const newState = caughtUpReducer(initialState, action);

      expect(newState).toBe(initialState);
    });

    test('if fetching for a search narrow, ignore', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: {
          older: false,
          newer: false,
        },
      });

      const action = deepFreeze({
        ...eg.action.message_fetch_start,
        narrow: SEARCH_NARROW('some query'),
      });

      const newState = caughtUpReducer(initialState, action);

      expect(newState).toEqual(initialState);
    });
  });

  describe('MESSAGE_FETCH_ERROR', () => {
    test('reverses the effect of MESSAGE_FETCH_START as much as possible', () => {
      // As of the addition of this test, it's fully possible:
      // MESSAGE_FETCH_START applies the identity function to the
      // state (i.e., it doesn't do anything to it). Reversing that
      // effect is also done with the identity function.
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: {
          older: true,
          newer: true,
        },
      });

      const messageFetchStartAction = deepFreeze({
        ...eg.action.message_fetch_start,
        narrow: HOME_NARROW,
      });

      const state1 = caughtUpReducer(initialState, messageFetchStartAction);

      const messageFetchErrorAction = deepFreeze({
        type: MESSAGE_FETCH_ERROR,
        narrow: HOME_NARROW,
        error: new Error(),
      });

      const finalState = caughtUpReducer(state1, messageFetchErrorAction);

      expect(finalState).toEqual(initialState);
    });
  });

  describe('MESSAGE_FETCH_COMPLETE', () => {
    test('apply `foundNewest` and `foundOldest` when true', () => {
      const initialState = deepFreeze({});

      const action = deepFreeze({
        ...eg.action.message_fetch_complete,
        foundNewest: true,
        foundOldest: true,
      });

      const expectedState = {
        [HOME_NARROW_STR]: {
          older: true,
          newer: true,
        },
      };

      const newState = caughtUpReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if fetched messages are from a search narrow, ignore them', () => {
      const initialState = deepFreeze({});

      const action = deepFreeze({
        ...eg.action.message_fetch_complete,
        narrow: SEARCH_NARROW('some query'),
        foundOldest: true,
        foundNewest: true,
      });

      const newState = caughtUpReducer(initialState, action);

      expect(newState).toEqual(initialState);
    });
  });

  test('new false results do not reset previous true state', () => {
    const initialState = deepFreeze({
      [HOME_NARROW_STR]: {
        older: true,
        newer: true,
      },
    });

    const action = deepFreeze({
      ...eg.action.message_fetch_complete,
      foundOldest: false,
      foundNewest: false,
    });

    const expectedState = {
      [HOME_NARROW_STR]: {
        older: true,
        newer: true,
      },
    };

    const newState = caughtUpReducer(initialState, action);

    expect(newState).toEqual(expectedState);
  });
});
