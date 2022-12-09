import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import flagsReducer from '../flagsReducer';
import {
  MESSAGE_FETCH_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  ACCOUNT_SWITCH,
} from '../../actionConstants';
import { NULL_OBJECT } from '../../nullObjects';

describe('flagsReducer', () => {
  describe('MESSAGE_FETCH_COMPLETE', () => {
    test('flags from all messages are extracted and stored by id', () => {
      const prevState = NULL_OBJECT;

      const action = deepFreeze({
        type: MESSAGE_FETCH_COMPLETE,
        messages: [{ id: 1 }, { id: 2, flags: [] }, { id: 3, flags: ['read'] }],
      });

      const expectedState = {
        read: {
          3: true,
        },
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when flags for messages already exist in state, do not change state', () => {
      const prevState = deepFreeze({
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

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toBe(prevState);
    });
  });

  test('flags are added or replace existing flags', () => {
    const prevState = deepFreeze({
      read: {
        3: true,
      },
    });

    const action = deepFreeze({
      type: MESSAGE_FETCH_COMPLETE,
      // prettier-ignore
      messages: [{ id: 1, flags: ['read'] }, { id: 2, flags: [] }],
    });

    const expectedState = {
      read: {
        1: true,
        3: true,
      },
    };

    const actualState = flagsReducer(prevState, action);

    expect(actualState).toEqual(expectedState);
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('adds to store flags from new message', () => {
      const prevState = NULL_OBJECT;

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: { id: 2, flags: ['read'] },
      });

      const expectedState = {
        read: {
          2: true,
        },
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_MESSAGE_FLAGS', () => {
    test('when operation is "add", adds flag to an empty state', () => {
      const prevState = NULL_OBJECT;

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'starred',
        op: 'add',
      });

      const expectedState = {
        starred: {
          1: true,
        },
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if flag already exists, do not duplicate', () => {
      const prevState = deepFreeze({
        starred: {
          1: true,
        },
      });

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'starred',
        op: 'add',
      });

      const expectedState = {
        starred: {
          1: true,
        },
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if other flags exist, adds new one to the list', () => {
      const prevState = deepFreeze({
        starred: {
          1: true,
        },
      });

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'read',
        op: 'add',
      });

      const expectedState = {
        starred: {
          1: true,
        },
        read: {
          1: true,
        },
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('adds flags for multiple messages', () => {
      const prevState = deepFreeze({
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
        op: 'add',
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

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when operation is "remove" removes a flag from message', () => {
      const prevState = deepFreeze({
        read: {
          1: true,
        },
      });

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'read',
        op: 'remove',
      });

      const expectedState = {
        read: {},
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if flag does not exist, do nothing', () => {
      const prevState = NULL_OBJECT;

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'read',
        op: 'remove',
      });

      const expectedState = {
        read: {},
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('removes flags from multiple messages', () => {
      const prevState = deepFreeze({
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
        op: 'remove',
      });

      const expectedState = {
        read: {
          1: true,
          3: true,
        },
        starred: {},
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when all=true, flag=read, and op=add, all messages become read; other flags untouched', () => {
      const message1 = eg.streamMessage();
      const message2 = eg.streamMessage();
      const message3 = eg.streamMessage();
      const message4 = eg.streamMessage();
      const message5 = eg.streamMessage();

      const prevState = deepFreeze({
        ...eg.plusReduxState.flags,
        starred: {
          [message1.id]: true,
          [message4.id]: true,
        },
        read: {
          [message1.id]: true,
          [message3.id]: true,
        },
      });

      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: true,
        allMessages: eg.makeMessagesState([message1, message2, message3, message4, message5]),
        messages: [],
        flag: 'read',
        op: 'add',
      });

      const expectedState = {
        ...prevState,
        read: {
          [message1.id]: true,
          [message2.id]: true,
          [message3.id]: true,
          [message4.id]: true,
          [message5.id]: true,
        },
      };

      const actualState = flagsReducer(prevState, action);
      expect(actualState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets to initial state', () => {
      const prevState = deepFreeze({
        read: { 1: true },
        starred: { 1: true },
        collapsed: { 1: true },
        mentioned: { 1: true },
        wildcard_mentioned: { 1: true },
        has_alert_word: { 1: true },
        historical: { 1: true },
      });

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = {
        read: {},
        starred: {},
        collapsed: {},
        mentioned: {},
        wildcard_mentioned: {},
        has_alert_word: {},
        historical: {},
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
