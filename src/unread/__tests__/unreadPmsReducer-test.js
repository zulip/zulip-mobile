/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import unreadPmsReducer from '../unreadPmsReducer';
import { ACCOUNT_SWITCH, EVENT_UPDATE_MESSAGE_FLAGS } from '../../actionConstants';
import { NULL_ARRAY } from '../../nullObjects';
import * as eg from '../../__tests__/lib/exampleData';

describe('unreadPmsReducer', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
        index: 1,
      });

      const expectedState = [];

      const actualState = unreadPmsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('REALM_INIT', () => {
    test('received data from "unread_msgs.pms" key replaces the current state ', () => {
      const initialState = deepFreeze([]);

      const message1 = eg.pmMessage({ id: 1, sender_id: 1 });
      const message2 = eg.pmMessage({ id: 2, sender_id: 1 });
      const message3 = eg.pmMessage({ id: 3, sender_id: 1 });
      const message4 = eg.pmMessage({ id: 4, sender_id: 1 });
      const message5 = eg.pmMessage({ id: 5, sender_id: 1 });

      const action = deepFreeze({
        ...eg.action.realm_init,
        data: {
          ...eg.action.realm_init.data,
          unread_msgs: {
            ...eg.action.realm_init.data.unread_msgs,
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
        },
      });

      const expectedState = [
        {
          sender_id: message1.sender_id,
          unread_message_ids: [message1.id, message2.id, message4.id, message5.id],
        },
      ];

      const actualState = unreadPmsReducer(initialState, action);

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

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        message: message1,
      });

      const actualState = unreadPmsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message is not private, return original state', () => {
      const message4 = eg.streamMessage({ id: 4 });
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        message: message4,
      });

      const actualState = unreadPmsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message is sent by self, do not mutate state', () => {
      const initialState = deepFreeze([]);
      const message1 = eg.pmMessage({
        sender: eg.selfUser,
        recipients: [eg.otherUser, eg.selfUser],
      });

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        message: message1,
        ownUser: eg.selfUser,
      });

      const actualState = unreadPmsReducer(initialState, action);

      expect(actualState).toBe(initialState);
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

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        message: message4,
      });

      const expectedState = [
        {
          sender_id: message4.sender_id,
          unread_message_ids: [message1.id, message2.id, message3.id, message4.id],
        },
      ];

      const actualState = unreadPmsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if sender id does not exist, append to state as new sender', () => {
      const message4 = eg.pmMessage({ id: 4, sender_id: 2 });
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        message: message4,
      });

      const expectedState = [
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3],
        },
        {
          sender_id: message4.sender_id,
          unread_message_ids: [message4.id],
        },
      ];

      const actualState = unreadPmsReducer(initialState, action);

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
        allMessages: {},
        messages: [1, 2, 3],
        flag: 'star',
        operation: 'add',
      };

      const actualState = unreadPmsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if id does not exist do not mutate state', () => {
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3, 4, 5],
        },
        {
          sender_id: 2,
          unread_message_ids: [4, 5],
        },
      ]);

      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: false,
        allMessages: {},
        messages: [6, 7],
        flag: 'read',
        operation: 'add',
      });

      const actualState = unreadPmsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if ids are in state remove them', () => {
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3],
        },
        {
          sender_id: 2,
          unread_message_ids: [4, 5],
        },
      ]);

      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: false,
        allMessages: {},
        messages: [3, 4, 5, 6],
        flag: 'read',
        operation: 'add',
      });

      const expectedState = [
        {
          sender_id: 1,
          unread_message_ids: [1, 2],
        },
      ];

      const actualState = unreadPmsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when operation is "remove" do nothing', () => {
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3, 4, 5],
        },
      ]);

      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: false,
        allMessages: {},
        messages: [1, 2],
        flag: 'read',
        operation: 'remove',
      });

      const actualState = unreadPmsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('when "all" is true reset state', () => {
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3, 4, 5],
        },
      ]);

      const action = deepFreeze({
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: true,
        allMessages: {},
        messages: [],
        flag: 'read',
        operation: 'add',
      });

      const actualState = unreadPmsReducer(initialState, action);

      expect(actualState).toBe(NULL_ARRAY);
    });
  });
});
