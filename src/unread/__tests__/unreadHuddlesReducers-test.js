import deepFreeze from 'deep-freeze';

import unreadHuddlesReducers from '../unreadHuddlesReducers';
import {
  REALM_INIT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../../actionConstants';
import { NULL_ARRAY } from '../../nullObjects';

describe('unreadHuddlesReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze([
        {
          user_ids_string: '0,1,2',
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = [];

      const actualState = unreadHuddlesReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('REALM_INIT', () => {
    test('received data from "unread_msgs.huddles" key replaces the current state ', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: REALM_INIT,
        data: {
          unread_msgs: {
            streams: [{}, {}],
            huddles: [
              {
                user_ids_string: '0,1,2',
                unread_message_ids: [1, 2, 4, 5],
              },
            ],
            pms: [{}, {}],
            mentions: [1, 2, 3],
          },
        },
      });

      const expectedState = [
        {
          user_ids_string: '0,1,2',
          unread_message_ids: [1, 2, 4, 5],
        },
      ];

      const actualState = unreadHuddlesReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('if message id already exists, do not mutate state', () => {
      const initialState = deepFreeze([
        {
          user_ids_string: '1,2,3',
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 2,
        },
      });

      const actualState = unreadHuddlesReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message is not group, return original state', () => {
      const initialState = deepFreeze([
        {
          user_ids_string: '1,2,3',
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 4,
          type: 'stream',
          sender_id: 1,
          display_recipient: [
            { id: 0, email: 'me@example.com' },
            { id: 1, email: 'john@example.com' },
          ],
        },
      });

      const actualState = unreadHuddlesReducers(initialState, action);

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
          display_recipient: [
            { email: 'john@example.com' },
            { email: 'mark@example.com' },
            { email: 'me@example.com' },
          ],
        },
        ownEmail: 'me@example.com',
      });

      const actualState = unreadHuddlesReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message id does not exist, append to state', () => {
      const initialState = deepFreeze([
        {
          user_ids_string: '0,1,2',
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 4,
          type: 'private',
          display_recipient: [
            { id: 0, email: 'me@example.com' },
            { id: 1, email: 'john@example.com' },
            { id: 2, email: 'mark@example.com' },
          ],
        },
      });

      const expectedState = [
        {
          user_ids_string: '0,1,2',
          unread_message_ids: [1, 2, 3, 4],
        },
      ];

      const actualState = unreadHuddlesReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if sender id does not exist, append to state as new sender', () => {
      const initialState = deepFreeze([
        {
          user_ids_string: '0,3,4',
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 4,
          type: 'private',
          sender_id: 2,
          display_recipient: [
            { id: 0, email: 'me@example.com' },
            { id: 1, email: 'john@example.com' },
            { id: 2, email: 'mark@example.com' },
          ],
        },
      });

      const expectedState = [
        {
          user_ids_string: '0,3,4',
          unread_message_ids: [1, 2, 3],
        },
        {
          user_ids_string: '0,1,2',
          unread_message_ids: [4],
        },
      ];

      const actualState = unreadHuddlesReducers(initialState, action);

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

      const actualState = unreadHuddlesReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if id does not exist do not mutate state', () => {
      const initialState = deepFreeze([
        {
          user_ids_string: '0,1,2',
          unread_message_ids: [1, 2, 3, 4, 5],
        },
        {
          user_ids_string: '0,3,4',
          unread_message_ids: [4, 5],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [6, 7],
        flag: 'read',
        operation: 'add',
      });

      const actualState = unreadHuddlesReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if ids are in state remove them', () => {
      const initialState = deepFreeze([
        {
          user_ids_string: '0,1,2',
          unread_message_ids: [1, 2, 3],
        },
        {
          user_ids_string: '0,3,4',
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
          user_ids_string: '0,1,2',
          unread_message_ids: [1, 2],
        },
      ];

      const actualState = unreadHuddlesReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when operation is "remove" do nothing', () => {
      const initialState = deepFreeze([
        {
          user_ids_string: '0,1,2',
          unread_message_ids: [1, 2, 3, 4, 5],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1, 2],
        flag: 'read',
        operation: 'remove',
      });

      const actualState = unreadHuddlesReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('when "all" is true reset state', () => {
      const initialState = deepFreeze([
        {
          user_ids_string: '0,1,2',
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

      const actualState = unreadHuddlesReducers(initialState, action);

      expect(actualState).toBe(NULL_ARRAY);
    });
  });
});
