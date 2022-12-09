/* @flow strict-local */

import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import flagsReducer from '../flagsReducer';
import { EVENT_UPDATE_MESSAGE_FLAGS } from '../../actionConstants';

describe('flagsReducer', () => {
  describe('MESSAGE_FETCH_COMPLETE', () => {
    test('flags from all messages are extracted and stored by id', () => {
      const message1 = eg.streamMessage();
      const message2 = eg.streamMessage({ flags: [] });
      const message3 = eg.streamMessage({ flags: ['read'] });

      const prevState = eg.plusReduxState.flags;

      expect(
        flagsReducer(
          prevState,
          deepFreeze({
            ...eg.action.message_fetch_complete,
            messages: [message1, message2, message3],
          }),
        ),
      ).toEqual({ ...prevState, read: { [message3.id]: true } });
    });

    test('when flags for messages already exist in state, do not change state', () => {
      const message = eg.streamMessage({ flags: ['read', 'starred'] });

      const prevState = {
        ...eg.plusReduxState.flags,
        read: { [message.id]: true },
        starred: { [message.id]: true },
      };

      expect(
        flagsReducer(
          prevState,
          deepFreeze({ ...eg.action.message_fetch_complete, messages: [message] }),
        ),
      ).toBe(prevState);
    });
  });

  test('flags are added or replace existing flags', () => {
    const message1 = eg.streamMessage({ flags: ['read'] });
    const message2 = eg.streamMessage({ flags: [] });
    const message3 = eg.streamMessage();

    const prevState = deepFreeze({ ...eg.plusReduxState.flags, read: { [message3.id]: true } });

    expect(
      flagsReducer(
        prevState,
        deepFreeze({ ...eg.action.message_fetch_complete, messages: [message1, message2] }),
      ),
    ).toEqual({ ...prevState, read: { [message1.id]: true, [message3.id]: true } });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('adds to store flags from new message', () => {
      const message = eg.streamMessage({ flags: ['read'] });

      const prevState = eg.plusReduxState.flags;

      expect(flagsReducer(prevState, eg.mkActionEventNewMessage(message))).toEqual({
        ...prevState,
        read: { [message.id]: true },
      });
    });
  });

  describe('EVENT_UPDATE_MESSAGE_FLAGS', () => {
    test('when operation is "add", adds flag to an empty state', () => {
      const message = eg.streamMessage();

      const prevState = eg.plusReduxState.flags;

      expect(
        flagsReducer(
          prevState,
          deepFreeze({
            id: 1,
            type: EVENT_UPDATE_MESSAGE_FLAGS,
            all: false,
            allMessages: eg.makeMessagesState([message]),
            messages: [message.id],
            flag: 'starred',
            op: 'add',
          }),
        ),
      ).toEqual({ ...prevState, starred: { [message.id]: true } });
    });

    test('if flag already exists, do not duplicate', () => {
      const message = eg.streamMessage();

      const prevState = deepFreeze({ ...eg.plusReduxState.flags, starred: { [message.id]: true } });

      expect(
        flagsReducer(
          prevState,
          deepFreeze({
            id: 1,
            type: EVENT_UPDATE_MESSAGE_FLAGS,
            all: false,
            allMessages: eg.makeMessagesState([message]),
            messages: [message.id],
            flag: 'starred',
            op: 'add',
          }),
        ),
      ).toEqual({ ...prevState, starred: { [message.id]: true } });
    });

    test('if other flags exist, adds new one to the list', () => {
      const message = eg.streamMessage();

      const prevState = deepFreeze({ ...eg.plusReduxState.flags, starred: { [message.id]: true } });

      expect(
        flagsReducer(
          prevState,
          deepFreeze({
            id: 1,
            type: EVENT_UPDATE_MESSAGE_FLAGS,
            all: false,
            allMessages: eg.makeMessagesState([message]),
            messages: [message.id],
            flag: 'read',
            op: 'add',
          }),
        ),
      ).toEqual({ ...prevState, starred: { [message.id]: true }, read: { [message.id]: true } });
    });

    test('adds flags for multiple messages', () => {
      const message1 = eg.streamMessage();
      const message2 = eg.streamMessage();
      const message3 = eg.streamMessage();

      const prevState = deepFreeze({
        ...eg.plusReduxState.flags,
        read: { [message1.id]: true },
        starred: { [message2.id]: true },
      });

      expect(
        flagsReducer(
          prevState,
          deepFreeze({
            id: 1,
            type: EVENT_UPDATE_MESSAGE_FLAGS,
            all: false,
            allMessages: eg.makeMessagesState([message1, message2, message3]),
            messages: [message1.id, message2.id, message3.id],
            flag: 'starred',
            op: 'add',
          }),
        ),
      ).toEqual({
        ...prevState,
        read: { [message1.id]: true },
        starred: { [message1.id]: true, [message2.id]: true, [message3.id]: true },
      });
    });

    test('when operation is "remove" removes a flag from message', () => {
      const message = eg.streamMessage();

      const prevState = deepFreeze({ ...eg.plusReduxState.flags, read: { [message.id]: true } });

      expect(
        flagsReducer(
          prevState,
          deepFreeze({
            id: 1,
            type: EVENT_UPDATE_MESSAGE_FLAGS,
            all: false,
            allMessages: eg.makeMessagesState([message]),
            messages: [message.id],
            flag: 'read',
            op: 'remove',
          }),
        ),
      ).toEqual({ ...prevState, read: {} });
    });

    test('if flag does not exist, do nothing', () => {
      const message = eg.streamMessage();

      const prevState = eg.plusReduxState.flags;

      expect(
        flagsReducer(
          prevState,
          deepFreeze({
            id: 1,
            type: EVENT_UPDATE_MESSAGE_FLAGS,
            all: false,
            allMessages: eg.makeMessagesState([message]),
            messages: [message.id],
            flag: 'read',
            op: 'remove',
          }),
        ),
      ).toEqual({ ...prevState, read: {} });
    });

    test('removes flags from multiple messages', () => {
      const message1 = eg.streamMessage();
      const message2 = eg.streamMessage();
      const message3 = eg.streamMessage();
      const message4 = eg.streamMessage();

      const prevState = deepFreeze({
        ...eg.plusReduxState.flags,
        read: { [message1.id]: true, [message3.id]: true },
        starred: { [message1.id]: true, [message3.id]: true },
      });

      expect(
        flagsReducer(
          prevState,
          deepFreeze({
            id: 1,
            type: EVENT_UPDATE_MESSAGE_FLAGS,
            all: false,
            allMessages: eg.makeMessagesState([message1, message2, message3, message4]),
            messages: [message1.id, message2.id, message3.id, message4.id],
            flag: 'starred',
            op: 'remove',
          }),
        ),
      ).toEqual({ ...prevState, read: { [message1.id]: true, [message3.id]: true }, starred: {} });
    });

    test('when all=true, flag=read, and op=add, all messages become read; other flags untouched', () => {
      const m1 = eg.streamMessage();
      const m2 = eg.streamMessage();
      const m3 = eg.streamMessage();
      const m4 = eg.streamMessage();
      const m5 = eg.streamMessage();

      const prevState = deepFreeze({
        ...eg.plusReduxState.flags,
        starred: { [m1.id]: true, [m4.id]: true },
        read: { [m1.id]: true, [m3.id]: true },
      });

      expect(
        flagsReducer(
          prevState,
          deepFreeze({
            id: 1,
            type: EVENT_UPDATE_MESSAGE_FLAGS,
            all: true,
            allMessages: eg.makeMessagesState([m1, m2, m3, m4, m5]),
            messages: [],
            flag: 'read',
            op: 'add',
          }),
        ),
      ).toEqual({
        ...prevState,
        read: { [m1.id]: true, [m2.id]: true, [m3.id]: true, [m4.id]: true, [m5.id]: true },
      });
    });
  });

  describe('RESET_ACCOUNT_DATA', () => {
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

      expect(flagsReducer(prevState, eg.action.reset_account_data)).toEqual(
        eg.baseReduxState.flags,
      );
    });
  });
});
