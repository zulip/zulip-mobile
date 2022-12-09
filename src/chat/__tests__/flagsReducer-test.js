/* @flow strict-local */

import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import flagsReducer from '../flagsReducer';
import { EVENT_UPDATE_MESSAGE_FLAGS, ACCOUNT_SWITCH } from '../../actionConstants';

describe('flagsReducer', () => {
  describe('MESSAGE_FETCH_COMPLETE', () => {
    test('flags from all messages are extracted and stored by id', () => {
      const message1 = eg.streamMessage();
      const message2 = eg.streamMessage({ flags: [] });
      const message3 = eg.streamMessage({ flags: ['read'] });

      const prevState = eg.plusReduxState.flags;

      const action = deepFreeze({
        ...eg.action.message_fetch_complete,
        messages: [message1, message2, message3],
      });

      const expectedState = {
        ...prevState,
        read: {
          [message3.id]: true,
        },
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when flags for messages already exist in state, do not change state', () => {
      const message = eg.streamMessage({ flags: ['read', 'starred'] });

      const prevState = {
        ...eg.plusReduxState.flags,
        read: {
          [message.id]: true,
        },
        starred: {
          [message.id]: true,
        },
      };

      const action = deepFreeze({
        ...eg.action.message_fetch_complete,
        messages: [message],
      });

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toBe(prevState);
    });
  });

  test('flags are added or replace existing flags', () => {
    const message1 = eg.streamMessage({ flags: ['read'] });
    const message2 = eg.streamMessage({ flags: [] });
    const message3 = eg.streamMessage();

    const prevState = deepFreeze({
      ...eg.plusReduxState.flags,
      read: {
        [message3.id]: true,
      },
    });

    const action = deepFreeze({
      ...eg.action.message_fetch_complete,
      messages: [message1, message2],
    });

    const expectedState = {
      ...prevState,
      read: {
        [message1.id]: true,
        [message3.id]: true,
      },
    };

    const actualState = flagsReducer(prevState, action);

    expect(actualState).toEqual(expectedState);
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('adds to store flags from new message', () => {
      const message = eg.streamMessage({ flags: ['read'] });

      const prevState = eg.plusReduxState.flags;

      const action = eg.mkActionEventNewMessage(message);

      const expectedState = {
        ...prevState,
        read: {
          [message.id]: true,
        },
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_MESSAGE_FLAGS', () => {
    test('when operation is "add", adds flag to an empty state', () => {
      const message = eg.streamMessage();

      const prevState = eg.plusReduxState.flags;

      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: false,
        allMessages: eg.makeMessagesState([message]),
        messages: [message.id],
        flag: 'starred',
        op: 'add',
      });

      const expectedState = {
        ...prevState,
        starred: {
          [message.id]: true,
        },
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if flag already exists, do not duplicate', () => {
      const message = eg.streamMessage();

      const prevState = deepFreeze({
        ...eg.plusReduxState.flags,
        starred: {
          [message.id]: true,
        },
      });

      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: false,
        allMessages: eg.makeMessagesState([message]),
        messages: [message.id],
        flag: 'starred',
        op: 'add',
      });

      const expectedState = {
        ...prevState,
        starred: {
          [message.id]: true,
        },
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if other flags exist, adds new one to the list', () => {
      const message = eg.streamMessage();

      const prevState = deepFreeze({
        ...eg.plusReduxState.flags,
        starred: {
          [message.id]: true,
        },
      });

      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: false,
        allMessages: eg.makeMessagesState([message]),
        messages: [message.id],
        flag: 'read',
        op: 'add',
      });

      const expectedState = {
        ...prevState,
        starred: {
          [message.id]: true,
        },
        read: {
          [message.id]: true,
        },
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('adds flags for multiple messages', () => {
      const message1 = eg.streamMessage();
      const message2 = eg.streamMessage();
      const message3 = eg.streamMessage();

      const prevState = deepFreeze({
        ...eg.plusReduxState.flags,
        read: {
          [message1.id]: true,
        },
        starred: {
          [message2.id]: true,
        },
      });

      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: false,
        allMessages: eg.makeMessagesState([message1, message2, message3]),
        messages: [message1.id, message2.id, message3.id],
        flag: 'starred',
        op: 'add',
      });

      const expectedState = {
        ...prevState,
        read: {
          [message1.id]: true,
        },
        starred: {
          [message1.id]: true,
          [message2.id]: true,
          [message3.id]: true,
        },
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when operation is "remove" removes a flag from message', () => {
      const message = eg.streamMessage();

      const prevState = deepFreeze({
        ...eg.plusReduxState.flags,
        read: {
          [message.id]: true,
        },
      });

      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: false,
        allMessages: eg.makeMessagesState([message]),
        messages: [message.id],
        flag: 'read',
        op: 'remove',
      });

      const expectedState = {
        ...prevState,
        read: {},
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if flag does not exist, do nothing', () => {
      const message = eg.streamMessage();

      const prevState = eg.plusReduxState.flags;

      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: false,
        allMessages: eg.makeMessagesState([message]),
        messages: [message.id],
        flag: 'read',
        op: 'remove',
      });

      const expectedState = {
        ...prevState,
        read: {},
      };

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('removes flags from multiple messages', () => {
      const message1 = eg.streamMessage();
      const message2 = eg.streamMessage();
      const message3 = eg.streamMessage();
      const message4 = eg.streamMessage();

      const prevState = deepFreeze({
        ...eg.plusReduxState.flags,
        read: {
          [message1.id]: true,
          [message3.id]: true,
        },
        starred: {
          [message1.id]: true,
          [message3.id]: true,
        },
      });

      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: false,
        allMessages: eg.makeMessagesState([message1, message2, message3, message4]),
        messages: [message1.id, message2.id, message3.id, message4.id],
        flag: 'starred',
        op: 'remove',
      });

      const expectedState = {
        ...prevState,
        read: {
          [message1.id]: true,
          [message3.id]: true,
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
      const message = eg.streamMessage();

      const prevState = deepFreeze({
        read: { [message.id]: true },
        starred: { [message.id]: true },
        collapsed: { [message.id]: true },
        mentioned: { [message.id]: true },
        wildcard_mentioned: { [message.id]: true },
        has_alert_word: { [message.id]: true },
        historical: { [message.id]: true },
      });

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
        index: 2,
      });

      const expectedState = eg.baseReduxState.flags;

      const actualState = flagsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
