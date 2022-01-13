/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import fetchingReducer from '../fetchingReducer';
import {
  HOME_NARROW,
  HOME_NARROW_STR,
  streamNarrow,
  keyFromNarrow,
  SEARCH_NARROW,
} from '../../utils/narrow';
import { MESSAGE_FETCH_START, MESSAGE_FETCH_ERROR } from '../../actionConstants';
import { DEFAULT_FETCHING } from '../fetchingSelectors';

describe('fetchingReducer', () => {
  describe('MESSAGE_FETCH_START', () => {
    test('if messages are fetched before or after the corresponding flag is set', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: { older: false, newer: false },
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_START,
        narrow: HOME_NARROW,
        numBefore: 10,
        numAfter: 10,
      });

      const expectedState = {
        [HOME_NARROW_STR]: { older: true, newer: true },
      };

      const newState = fetchingReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if key for narrow does not exist, it is created and corresponding flags are set', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: { older: false, newer: false },
      });

      const narrow = streamNarrow(eg.stream.stream_id);
      const action = deepFreeze({
        type: MESSAGE_FETCH_START,
        narrow,
        numBefore: 10,
        numAfter: 0,
      });

      const expectedState = {
        [HOME_NARROW_STR]: { older: false, newer: false },
        [keyFromNarrow(narrow)]: { older: true, newer: false },
      };

      const newState = fetchingReducer(initialState, action);

      expect(newState).toEqual(expectedState);
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

      const newState = fetchingReducer(initialState, action);

      expect(newState).toEqual(initialState);
    });
  });

  describe('MESSAGE_FETCH_ERROR', () => {
    test('reverses the effect of MESSAGE_FETCH_START as much as possible', () => {
      // As of the addition of this test, that means setting
      // DEFAULT_FETCHING as the key.
      const initialState = deepFreeze({});

      const messageFetchStartAction = deepFreeze({
        ...eg.action.message_fetch_start,
        narrow: HOME_NARROW,
      });

      const state1 = fetchingReducer(initialState, messageFetchStartAction);

      const messageFetchErrorAction = deepFreeze({
        type: MESSAGE_FETCH_ERROR,
        narrow: HOME_NARROW,
        error: new Error(),
      });

      const finalState = fetchingReducer(state1, messageFetchErrorAction);

      const expectedState = {
        [HOME_NARROW_STR]: DEFAULT_FETCHING,
      };

      expect(finalState).toEqual(expectedState);
    });
  });

  describe('MESSAGE_FETCH_COMPLETE', () => {
    test('sets corresponding fetching flags to false, if messages are received before or after', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: { older: true, newer: true },
      });

      const action = {
        ...eg.action.message_fetch_complete,
        narrow: HOME_NARROW,
        numBefore: 10,
        numAfter: 0,
      };

      const expectedState = {
        [HOME_NARROW_STR]: { older: false, newer: true },
      };

      const newState = fetchingReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  test('if fetched messages are from a search narrow, ignore them', () => {
    const initialState = deepFreeze({
      [HOME_NARROW_STR]: { older: true, newer: true },
    });

    const action = deepFreeze({
      ...eg.action.message_fetch_complete,
      narrow: SEARCH_NARROW('some query'),
    });

    const newState = fetchingReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });
});
