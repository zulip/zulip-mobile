import deepFreeze from 'deep-freeze';

import unreadStreamsReducers from '../unreadStreamsReducers';
import {
  REALM_INIT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../../actionConstants';
import { NULL_ARRAY } from '../../nullObjects';

describe('unreadStreamsReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze([
        {
          stream_id: 1,
          topic: 'some topic',
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = [];

      const actualState = unreadStreamsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('REALM_INIT', () => {
    test('received data from "unread_msgs.streams" key replaces the current state ', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: REALM_INIT,
        data: {
          unread_msgs: {
            streams: [
              {
                stream_id: 1,
                topic: 'some topic',
                unread_message_ids: [1, 2],
              },
            ],
            huddles: [{}, {}, {}],
            pms: [{}, {}, {}],
            mentions: [1, 2, 3],
          },
        },
      });

      const expectedState = [
        {
          stream_id: 1,
          topic: 'some topic',
          unread_message_ids: [1, 2],
        },
      ];

      const actualState = unreadStreamsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('if message id already exists, do not mutate state', () => {
      const initialState = deepFreeze([
        {
          stream_id: 1,
          topic: 'some topic',
          unread_message_ids: [1, 2],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 1,
          type: 'stream',
          stream_id: 1,
          subject: 'some topic',
        },
      });

      const actualState = unreadStreamsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message is not stream, return original state', () => {
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
        },
      });

      const actualState = unreadStreamsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message is sent by self, do not mutate state', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 1,
          type: 'stream',
          stream_id: 2,
          subject: 'another topic',
          sender_email: 'me@example.com',
        },
        ownEmail: 'me@example.com',
      });

      const actualState = unreadStreamsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message id does not exist, append to state', () => {
      const initialState = deepFreeze([
        {
          stream_id: 1,
          topic: 'some topic',
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 4,
          type: 'stream',
          stream_id: 1,
          subject: 'some topic',
        },
      });

      const expectedState = [
        {
          stream_id: 1,
          topic: 'some topic',
          unread_message_ids: [1, 2, 3, 4],
        },
      ];

      const actualState = unreadStreamsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if stream with topic does not exist, append to state', () => {
      const initialState = deepFreeze([
        {
          stream_id: 1,
          topic: 'some topic',
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 4,
          type: 'stream',
          stream_id: 2,
          subject: 'another topic',
        },
      });

      const expectedState = [
        {
          stream_id: 1,
          topic: 'some topic',
          unread_message_ids: [1, 2, 3],
        },
        {
          stream_id: 2,
          topic: 'another topic',
          unread_message_ids: [4],
        },
      ];

      const actualState = unreadStreamsReducers(initialState, action);

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

      const actualState = unreadStreamsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if id does not exist do not mutate state', () => {
      const initialState = deepFreeze([
        {
          stream_id: 1,
          topic: 'some topic',
          unread_message_ids: [1, 2, 3, 4, 5],
        },
        {
          stream_id: 2,
          topic: 'another topic',
          unread_message_ids: [4, 5],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [6, 7],
        flag: 'read',
        operation: 'add',
      });

      const actualState = unreadStreamsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if ids are in state remove them', () => {
      const initialState = deepFreeze([
        {
          stream_id: 1,
          topic: 'some topic',
          unread_message_ids: [1, 2, 3],
        },
        {
          stream_id: 2,
          topic: 'another topic',
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
          stream_id: 1,
          topic: 'some topic',
          unread_message_ids: [1, 2],
        },
      ];

      const actualState = unreadStreamsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when operation is "remove" do nothing', () => {
      const initialState = deepFreeze([
        {
          stream_id: 1,
          topic: 'some topic',
          unread_message_ids: [1, 2, 3, 4, 5],
        },
      ]);

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1, 2],
        flag: 'read',
        operation: 'remove',
      });

      const actualState = unreadStreamsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('when "all" is true reset state', () => {
      const initialState = deepFreeze([
        {
          stream_id: 1,
          topic: 'some topic',
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

      const actualState = unreadStreamsReducers(initialState, action);

      expect(actualState).toBe(NULL_ARRAY);
    });
  });
});
