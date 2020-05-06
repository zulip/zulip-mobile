/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import caughtUpReducer from '../caughtUpReducer';
import { MESSAGE_FETCH_START } from '../../actionConstants';
import { LAST_MESSAGE_ANCHOR, FIRST_UNREAD_ANCHOR } from '../../anchor';
import {
  HOME_NARROW,
  HOME_NARROW_STR,
  ALL_PRIVATE_NARROW,
  ALL_PRIVATE_NARROW_STR,
} from '../../utils/narrow';

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
        type: MESSAGE_FETCH_START,
        narrow: HOME_NARROW,
      });

      // $FlowFixMe bogus action object
      const newState = caughtUpReducer(initialState, action);

      expect(newState).toBe(initialState);
    });
  });

  describe('MESSAGE_FETCH_COMPLETE', () => {
    test('if messages received are less than requested then we are caught up', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: {
          older: false,
          newer: false,
        },
      });

      const action = deepFreeze({
        ...eg.action.message_fetch_complete,
        anchor: 1,
        // $FlowFixMe bogus messages in action
        messages: [{ id: 1 }, { id: 2 }, { id: 3 }],
        numBefore: 5,
        numAfter: 5,
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

  test('if messages received are requested amount we consider it not yet caught up', () => {
    const initialState = deepFreeze({
      [HOME_NARROW_STR]: {
        older: false,
        newer: false,
      },
    });

    const action = deepFreeze({
      ...eg.action.message_fetch_complete,
      anchor: 3,
      // $FlowFixMe bogus messages in action
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      numBefore: 2,
      numAfter: 2,
      foundNewest: undefined,
      foundOldest: undefined,
    });

    const expectedState = {
      [HOME_NARROW_STR]: {
        older: false,
        newer: false,
      },
    };

    const newState = caughtUpReducer(initialState, action);

    expect(newState).toEqual(expectedState);
  });

  test('new results do not reset previous state', () => {
    const initialState = deepFreeze({
      [HOME_NARROW_STR]: {
        older: true,
        newer: true,
      },
    });

    const action = deepFreeze({
      ...eg.action.message_fetch_complete,
      anchor: 3,
      // $FlowFixMe bogus messages in action
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      numBefore: 2,
      numAfter: 2,
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

  test('when at first unread and before and after messages are as many as requested not yet caught up', () => {
    const initialState = deepFreeze({});

    const action = deepFreeze({
      ...eg.action.message_fetch_complete,
      anchor: FIRST_UNREAD_ANCHOR,
      messages: [
        { id: 1, flags: ['read'] },
        { id: 2, flags: ['read'] },
        { id: 3, flags: ['read'] },
        { id: 4, flags: [] },
        { id: 5, flags: [] },
        { id: 6, flags: [] },
        { id: 7, flags: [] },
      ],
      numBefore: 3,
      numAfter: 3,
    });

    const expectedState = {
      [HOME_NARROW_STR]: {
        older: false,
        newer: false,
      },
    };

    // $FlowFixMe bogus messages in action
    const newState = caughtUpReducer(initialState, action);

    expect(newState).toEqual(expectedState);
  });

  test('when at first unread and before messages are less than requested older is caught up', () => {
    const initialState = deepFreeze({});

    const action = deepFreeze({
      ...eg.action.message_fetch_complete,
      anchor: FIRST_UNREAD_ANCHOR,
      messages: [
        { id: 1, flags: ['read'] },
        { id: 2, flags: ['read'] },
        { id: 3, flags: [] },
        { id: 4, flags: [] },
        { id: 5, flags: [] },
        { id: 6, flags: [] },
      ],
      numBefore: 3,
      numAfter: 4,
    });

    const expectedState = {
      [HOME_NARROW_STR]: {
        older: true,
        newer: false,
      },
    };

    // $FlowFixMe bogus messages in action
    const newState = caughtUpReducer(initialState, action);

    expect(newState).toEqual(expectedState);
  });

  test('when at first unread and after messages are less than requested newer is caught up', () => {
    const initialState = deepFreeze({});

    const action = deepFreeze({
      ...eg.action.message_fetch_complete,
      anchor: FIRST_UNREAD_ANCHOR,
      messages: [
        { id: 1, flags: ['read'] },
        { id: 2, flags: ['read'] },
        { id: 3, flags: ['read'] },
        { id: 4, flags: [] },
        { id: 5, flags: [] },
        { id: 6, flags: [] },
      ],
      numBefore: 3,
      numAfter: 4,
    });

    const expectedState = {
      [HOME_NARROW_STR]: {
        older: false,
        newer: true,
      },
    };

    // $FlowFixMe bogus messages in action
    const newState = caughtUpReducer(initialState, action);

    expect(newState).toEqual(expectedState);
  });

  test('when at first unread and both before and after messages are less than requested older and newer are caught up', () => {
    const initialState = deepFreeze({});

    const action = deepFreeze({
      ...eg.action.message_fetch_complete,
      anchor: FIRST_UNREAD_ANCHOR,
      messages: [
        { id: 1, flags: ['read'] },
        { id: 2, flags: ['read'] },
        { id: 3, flags: [] },
        { id: 4, flags: [] },
        { id: 5, flags: [] },
      ],
      numBefore: 3,
      numAfter: 4,
    });

    const expectedState = {
      [HOME_NARROW_STR]: {
        older: true,
        newer: true,
      },
    };

    // $FlowFixMe bogus messages in action
    const newState = caughtUpReducer(initialState, action);

    expect(newState).toEqual(expectedState);
  });

  test('if requesting latest messages always newer is caught up', () => {
    const initialState = deepFreeze({});

    const action = deepFreeze({
      ...eg.action.message_fetch_complete,
      narrow: ALL_PRIVATE_NARROW,
      anchor: LAST_MESSAGE_ANCHOR,
      // $FlowFixMe bogus messages in action
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      numBefore: 10,
      numAfter: 0,
    });

    const expectedState = {
      [ALL_PRIVATE_NARROW_STR]: {
        older: true,
        newer: true,
      },
    };

    const newState = caughtUpReducer(initialState, action);

    expect(newState).toEqual(expectedState);
  });

  describe('verify that server has send extra message before calculating adjustment', () => {
    test('no adjustment is required if messages are less than or equal to requested', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: {},
      });

      const action = deepFreeze({
        ...eg.action.message_fetch_complete,
        anchor: 6,
        messages: [
          { id: 1 },
          { id: 2 },
          { id: 3 },
          { id: 4 },
          { id: 5 },
          { id: 6 },
          { id: 7 },
          { id: 8 },
          { id: 9 },
          { id: 10 },
        ],
        numBefore: 5,
        numAfter: 5,
      });

      const expectedState = {
        [HOME_NARROW_STR]: {
          older: false,
          newer: false,
        },
      };

      // $FlowFixMe bogus messages in action
      const newState = caughtUpReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('dynamically determine adjustment whenever required', () => {
      const initialState = deepFreeze({
        [HOME_NARROW_STR]: {},
      });

      const action = deepFreeze({
        ...eg.action.message_fetch_complete,
        anchor: 5,
        messages: [
          { id: 0 },
          { id: 1 },
          { id: 2 },
          { id: 3 },
          { id: 4 },
          { id: 5 },
          { id: 6 },
          { id: 7 },
          { id: 8 },
          { id: 9 },
          { id: 10 },
        ],
        numBefore: 5,
        numAfter: 5,
      });

      const expectedState = {
        [HOME_NARROW_STR]: {
          older: false,
          newer: false,
        },
      };

      // $FlowFixMe bogus messages in action
      const newState = caughtUpReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  test('if `foundNewest` and `foundOldest` are provided use them', () => {
    const initialState = deepFreeze({});

    const action = deepFreeze({
      ...eg.action.message_fetch_complete,
      anchor: 3,
      messages: [],
      numBefore: 2,
      numAfter: 2,
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
});
