import deepFreeze from 'deep-freeze';

import unreadPmsReducers from '../unreadPmsReducers';
import {
  REALM_INIT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../../actionConstants';
import { NULL_ARRAY } from '../../nullObjects';

describe('unreadPmsReducers', () => {
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
      });

      const expectedState = [];

      const actualState = unreadPmsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('REALM_INIT', () => {
    test('received data from "unread_msgs.pms" key replaces the current state ', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: REALM_INIT,
        data: {
          unread_msgs: {
            streams: [{}, {}],
            huddles: [{}, {}, {}],
            pms: [
              {
                sender_id: 1,
                unread_message_ids: [1, 2, 4, 5],
              },
            ],
            mentions: [1, 2, 3],
          },
        },
      });

      const expectedState = [
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 4, 5],
        },
      ];

      const actualState = unreadPmsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('if message id already exists, do not mutate state', () => {
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 2,
        },
      });

      const actualState = unreadPmsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message is sent by self, do not mutate state', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 2,
          type: 'private',
          sender_id: 1,
          sender_email: 'me@example.com',
          display_recipient: [{ email: 'john@example.com' }, { email: 'me@example.com' }],
        },
        ownEmail: 'me@example.com',
      });

      const actualState = unreadPmsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message is not private, return original state', () => {
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 4,
          type: 'stream',
          sender_id: 1,
        },
      });

      const actualState = unreadPmsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message id does not exist, append to state', () => {
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 4,
          type: 'private',
          sender_id: 1,
          display_recipient: [{ email: 'john@example.com' }, { email: 'me@example.com' }],
        },
      });

      const expectedState = [
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3, 4],
        },
      ];

      const actualState = unreadPmsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if sender id does not exist, append to state as new sender', () => {
      const initialState = deepFreeze([
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 4,
          type: 'private',
          sender_id: 2,
          display_recipient: [{ email: 'john@example.com' }, { email: 'me@example.com' }],
        },
      });

      const expectedState = [
        {
          sender_id: 1,
          unread_message_ids: [1, 2, 3],
        },
        {
          sender_id: 2,
          unread_message_ids: [4],
        },
      ];

      const actualState = unreadPmsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_MESSAGE_FLAGS', () => {
    test('when operation is "add" but flag is not "read" do not mutate state', () => {
      const initialState = deepFreeze([]);

      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1, 2, 3],
        flag: 'star',
        operation: 'add',
      };

      const actualState = unreadPmsReducers(initialState, action);

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
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [6, 7],
        flag: 'read',
        operation: 'add',
      });

      const actualState = unreadPmsReducers(initialState, action);

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
        type: EVENT_UPDATE_MESSAGE_FLAGS,
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

      const actualState = unreadPmsReducers(initialState, action);

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
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1, 2],
        flag: 'read',
        operation: 'remove',
      });

      const actualState = unreadPmsReducers(initialState, action);

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
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [],
        flag: 'read',
        operation: 'add',
        all: true,
      });

      const actualState = unreadPmsReducers(initialState, action);

      expect(actualState).toBe(NULL_ARRAY);
    });
  });
});
