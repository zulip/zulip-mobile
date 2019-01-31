import deepFreeze from 'deep-freeze';

import flagsReducers from '../flagsReducers';
import {
  MESSAGE_FETCH_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  ACCOUNT_SWITCH,
} from '../../actionConstants';
import { NULL_OBJECT } from '../../nullObjects';

describe('flagsReducers', () => {
  describe('MESSAGE_FETCH_COMPLETE', () => {
    test('flags from all messages are extracted and stored by id', () => {
      const initialState = NULL_OBJECT;

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        messages: [{ id: 1 }, { id: 2, flags: [] }, { id: 3, flags: ['read'] }],
      });

      const expectedState = {
        read: {
          3: true,
        },
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when flags for messages already exist in state, do not change state', () => {
      const initialState = deepFreeze({
        read: {
          1: true,
        },
        starred: {
          1: true,
        },
      });

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        messages: [{ id: 1, flags: ['read', 'starred'] }],
      });

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });
  });

  test('flags are added or replace existing flags', () => {
    const initialState = deepFreeze({
      read: {
        3: true,
      },
    });

    const action = deepFreeze({
      type: MESSAGE_FETCH_COMPLETE,
      messages: [{ id: 1, flags: ['read'] }, { id: 2, flags: [] }],
    });

    const expectedState = {
      read: {
        1: true,
        3: true,
      },
    };

    const actualState = flagsReducers(initialState, action);

    expect(actualState).toEqual(expectedState);
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('when no flags key is passed, do not fail, do nothing', () => {
      const initialState = NULL_OBJECT;

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: { id: 2 },
      });

      const expectedState = {};

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('adds to store flags from new message', () => {
      const initialState = NULL_OBJECT;

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: { id: 2, flags: ['read'] },
      });

      const expectedState = {
        read: {
          2: true,
        },
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_MESSAGE_FLAGS', () => {
    test('when operation is "add", adds flag to an empty state', () => {
      const initialState = NULL_OBJECT;

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'starred',
        operation: 'add',
      });

      const expectedState = {
        starred: {
          1: true,
        },
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if flag already exists, do not duplicate', () => {
      const initialState = deepFreeze({
        starred: {
          1: true,
        },
      });

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'starred',
        operation: 'add',
      });

      const expectedState = {
        starred: {
          1: true,
        },
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if other flags exist, adds new one to the list', () => {
      const initialState = deepFreeze({
        starred: {
          1: true,
        },
      });

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'read',
        operation: 'add',
      });

      const expectedState = {
        starred: {
          1: true,
        },
        read: {
          1: true,
        },
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('adds flags for multiple messages', () => {
      const initialState = deepFreeze({
        read: {
          1: true,
        },
        starred: {
          2: true,
        },
      });

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1, 2, 3],
        flag: 'starred',
        operation: 'add',
      });

      const expectedState = {
        read: {
          1: true,
        },
        starred: {
          1: true,
          2: true,
          3: true,
        },
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when operation is "remove" removes a flag from message', () => {
      const initialState = deepFreeze({
        read: {
          1: true,
        },
      });

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'read',
        operation: 'remove',
      });

      const expectedState = {
        read: {},
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if flag does not exist, do nothing', () => {
      const initialState = NULL_OBJECT;

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'read',
        operation: 'remove',
      });

      const expectedState = {
        read: {},
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('removes flags from multiple messages', () => {
      const initialState = deepFreeze({
        read: {
          1: true,
          3: true,
        },
        starred: {
          1: true,
          3: true,
        },
      });

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1, 2, 3, 4],
        flag: 'starred',
        operation: 'remove',
      });

      const expectedState = {
        read: {
          1: true,
          3: true,
        },
        starred: {},
      };

      const actualState = flagsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when "all" is true all messages become read', () => {
      const initialState = deepFreeze({
        read: {
          1: true,
          3: true,
        },
      });

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [],
        flag: 'read',
        operation: 'add',
        all: true,
        allMessages: {
          1: {},
          2: {},
          3: {},
          4: {},
          5: {},
        },
      });

      const expectedReadState = {
        1: true,
        2: true,
        3: true,
        4: true,
        5: true,
      };

      const actualState = flagsReducers(initialState, action);
      expect(actualState.read).toEqual(expectedReadState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets to initial state', () => {
      const prevState = deepFreeze({
        read: { 1: true },
        starred: { 1: true },
        collapsed: { 1: true },
        mentions: { 1: true },
        wildcard_mentions: { 1: true },
        summarize_in_home: { 1: true },
        summarize_in_stream: { 1: true },
        force_expand: { 1: true },
        force_collapse: { 1: true },
        has_alert_word: { 1: true },
        historical: { 1: true },
        is_me_message: { 1: true },
      });

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = {
        read: {},
        starred: {},
        collapsed: {},
        mentions: {},
        wildcard_mentions: {},
        summarize_in_home: {},
        summarize_in_stream: {},
        force_expand: {},
        force_collapse: {},
        has_alert_word: {},
        historical: {},
        is_me_message: {},
      };

      const actualState = flagsReducers(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
