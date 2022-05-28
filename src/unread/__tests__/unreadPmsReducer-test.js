/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import unreadPmsReducer from '../unreadPmsReducer';
import { ACCOUNT_SWITCH, EVENT_UPDATE_MESSAGE_FLAGS } from '../../actionConstants';
import { NULL_ARRAY } from '../../nullObjects';
import * as eg from '../../__tests__/lib/exampleData';
import { makeUserId } from '../../api/idTypes';

describe('unreadPmsReducer', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze([
        {
          sender_id: makeUserId(1),
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
        index: 1,
      });

      const expectedState = [];

      const actualState = unreadPmsReducer(initialState, action, eg.plusReduxState);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('REGISTER_COMPLETE', () => {
    test('received data from "unread_msgs.pms" key replaces the current state ', () => {
      const initialState = deepFreeze([]);

      const message1 = eg.pmMessage({ id: 1, sender_id: 1 });
      const message2 = eg.pmMessage({ id: 2, sender_id: 1 });
      const message3 = eg.pmMessage({ id: 3, sender_id: 1 });
      const message4 = eg.pmMessage({ id: 4, sender_id: 1 });
      const message5 = eg.pmMessage({ id: 5, sender_id: 1 });

      const action = eg.mkActionRegisterComplete({
        unread_msgs: {
          streams: [],
          huddles: [],
          pms: [
            {
              sender_id: message1.sender_id,
              unread_message_ids: [message1.id, message2.id, message4.id, message5.id],
            },
          ],
          mentions: [message1.id, message2.id, message3.id],
        },
      });

      const expectedState = [
        {
          sender_id: message1.sender_id,
          unread_message_ids: [message1.id, message2.id, message4.id, message5.id],
        },
      ];

      const actualState = unreadPmsReducer(initialState, action, eg.plusReduxState);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('if message id already exists, do not mutate state', () => {
      const message1 = eg.pmMessage({ sender_id: 1 });
      const initialState = deepFreeze([
        {
          sender_id: message1.sender_id,
          unread_message_ids: [message1.id],
        },
      ]);

      const action = eg.mkActionEventNewMessage(message1);

      const actualState = unreadPmsReducer(initialState, action, eg.plusReduxState);

      expect(actualState).toBe(initialState);
    });

    test('if message is not private, return original state', () => {
      const message4 = eg.streamMessage({ id: 4 });
      const initialState = deepFreeze([
        {
          sender_id: makeUserId(1),
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = eg.mkActionEventNewMessage(message4);

      const actualState = unreadPmsReducer(initialState, action, eg.plusReduxState);

      expect(actualState).toBe(initialState);
    });

    test('if message is marked read, do not mutate state', () => {
      const initialState = deepFreeze([]);
      const message1 = eg.pmMessage({
        sender: eg.otherUser,
        recipients: [eg.otherUser, eg.selfUser],
        flags: ['read'],
      });

      const action = eg.mkActionEventNewMessage(message1);

      const actualState = unreadPmsReducer(initialState, action, eg.plusReduxState);

      expect(actualState).toBe(initialState);
    });

    test('if message is marked unread in self-PM, append to state', () => {
      const initialState = deepFreeze([]);
      const message1 = eg.pmMessage({
        sender: eg.selfUser,
        recipients: [eg.selfUser],
      });

      const action = eg.mkActionEventNewMessage(message1);

      const expectedState = [
        {
          sender_id: eg.selfUser.user_id,
          unread_message_ids: [message1.id],
        },
      ];

      const actualState = unreadPmsReducer(initialState, action, eg.plusReduxState);

      expect(actualState).toEqual(expectedState);
    });

    test('if message id does not exist, append to state', () => {
      const message1 = eg.pmMessage({ id: 1, sender_id: 1 });
      const message2 = eg.pmMessage({ id: 2, sender_id: 1 });
      const message3 = eg.pmMessage({ id: 3, sender_id: 1 });
      const message4 = eg.pmMessage({ id: 4, sender_id: 1 });

      const initialState = deepFreeze([
        {
          sender_id: message4.sender_id,
          unread_message_ids: [message1.id, message2.id, message3.id],
        },
      ]);

      const action = eg.mkActionEventNewMessage(message4);

      const expectedState = [
        {
          sender_id: message4.sender_id,
          unread_message_ids: [message1.id, message2.id, message3.id, message4.id],
        },
      ];

      const actualState = unreadPmsReducer(initialState, action, eg.plusReduxState);

      expect(actualState).toEqual(expectedState);
    });

    test('if sender id does not exist, append to state as new sender', () => {
      const message4 = eg.pmMessage({ id: 4, sender_id: 2 });
      const initialState = deepFreeze([
        {
          sender_id: makeUserId(1),
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = eg.mkActionEventNewMessage(message4);

      const expectedState = [
        {
          sender_id: makeUserId(1),
          unread_message_ids: [1, 2, 3],
        },
        {
          sender_id: message4.sender_id,
          unread_message_ids: [message4.id],
        },
      ];

      const actualState = unreadPmsReducer(initialState, action, eg.plusReduxState);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_MESSAGE_FLAGS', () => {
    test('when operation is "add" but flag is not "read" do not mutate state', () => {
      const initialState = deepFreeze([]);

      const action = {
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: false,
        allMessages: eg.makeMessagesState([]),
        messages: [1, 2, 3],
        flag: 'star',
        op: 'add',
      };

      const actualState = unreadPmsReducer(initialState, action, eg.plusReduxState);

      expect(actualState).toBe(initialState);
    });

    test('if id does not exist do not mutate state', () => {
      const initialState = deepFreeze([
        {
          sender_id: makeUserId(1),
          unread_message_ids: [1, 2, 3, 4, 5],
        },
        {
          sender_id: makeUserId(2),
          unread_message_ids: [4, 5],
        },
      ]);

      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: false,
        allMessages: eg.makeMessagesState([]),
        messages: [6, 7],
        flag: 'read',
        op: 'add',
      });

      const actualState = unreadPmsReducer(initialState, action, eg.plusReduxState);

      expect(actualState).toBe(initialState);
    });

    test('if ids are in state remove them', () => {
      const initialState = deepFreeze([
        {
          sender_id: makeUserId(1),
          unread_message_ids: [1, 2, 3],
        },
        {
          sender_id: makeUserId(2),
          unread_message_ids: [4, 5],
        },
      ]);

      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: false,
        allMessages: eg.makeMessagesState([]),
        messages: [3, 4, 5, 6],
        flag: 'read',
        op: 'add',
      });

      const expectedState = [
        {
          sender_id: 1,
          unread_message_ids: [1, 2],
        },
      ];

      const actualState = unreadPmsReducer(initialState, action, eg.plusReduxState);

      expect(actualState).toEqual(expectedState);
    });

    test('when operation is "remove" do nothing', () => {
      const initialState = deepFreeze([
        {
          sender_id: makeUserId(1),
          unread_message_ids: [1, 2, 3, 4, 5],
        },
      ]);

      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: false,
        allMessages: eg.makeMessagesState([]),
        messages: [1, 2],
        flag: 'read',
        op: 'remove',
      });

      const actualState = unreadPmsReducer(initialState, action, eg.plusReduxState);

      expect(actualState).toBe(initialState);
    });

    test('when "all" is true reset state', () => {
      const initialState = deepFreeze([
        {
          sender_id: makeUserId(1),
          unread_message_ids: [1, 2, 3, 4, 5],
        },
      ]);

      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: true,
        allMessages: eg.makeMessagesState([]),
        messages: [],
        flag: 'read',
        op: 'add',
      });

      const actualState = unreadPmsReducer(initialState, action, eg.plusReduxState);

      expect(actualState).toBe(NULL_ARRAY);
    });
  });
});
