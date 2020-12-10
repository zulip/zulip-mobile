/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import unreadStreamsReducer from '../unreadStreamsReducer';
import { ACCOUNT_SWITCH, EVENT_UPDATE_MESSAGE_FLAGS } from '../../actionConstants';
import { NULL_ARRAY } from '../../nullObjects';
import * as eg from '../../__tests__/lib/exampleData';

describe('unreadStreamsReducer', () => {
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
        index: 1,
      });

      const expectedState = [];

      const actualState = unreadStreamsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('REALM_INIT', () => {
    test('received data from "unread_msgs.streams" key replaces the current state ', () => {
      const initialState = deepFreeze([]);

      const message1 = eg.streamMessage({ id: 1 });

      const action = deepFreeze({
        ...eg.action.realm_init,
        data: {
          ...eg.action.realm_init.data,
          unread_msgs: {
            ...eg.action.realm_init.data.unread_msgs,
            streams: [
              {
                stream_id: message1.stream_id,
                topic: message1.subject,
                unread_message_ids: [message1.id, 2],
              },
            ],
            huddles: [],
            pms: [],
            mentions: [message1.id, 2, 3],
          },
        },
      });

      const expectedState = [
        {
          stream_id: message1.stream_id,
          topic: message1.subject,
          unread_message_ids: [message1.id, 2],
        },
      ];

      const actualState = unreadStreamsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('if message id already exists, do not mutate state', () => {
      const message1 = eg.streamMessage({ id: 1 });
      const initialState = deepFreeze([
        {
          stream_id: message1.stream_id,
          topic: message1.subject,
          unread_message_ids: [message1.id],
        },
      ]);

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        message: message1,
      });

      const actualState = unreadStreamsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message is not stream, return original state', () => {
      const message4 = eg.pmMessage({ id: 4 });
      const initialState = deepFreeze([
        {
          stream_id: message4.stream_id,
          topic: message4.subject,
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        message: message4,
      });

      const actualState = unreadStreamsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message is sent by self, do not mutate state', () => {
      const initialState = deepFreeze([]);
      const message1 = eg.streamMessage({ sender: eg.selfUser });

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        message: message1,
        ownEmail: eg.selfUser.email,
      });

      const actualState = unreadStreamsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message id does not exist, append to state', () => {
      const message4 = eg.streamMessage({ id: 4 });

      const initialState = deepFreeze([
        {
          stream_id: message4.stream_id,
          topic: message4.subject,
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        message: message4,
      });

      const expectedState = [
        {
          stream_id: message4.stream_id,
          topic: message4.subject,
          unread_message_ids: [1, 2, 3, message4.id],
        },
      ];

      const actualState = unreadStreamsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if stream with topic does not exist, append to state', () => {
      const message4 = eg.streamMessage({ id: 4, stream_id: 2, subject: 'another topic' });

      const initialState = deepFreeze([
        {
          stream_id: 1,
          topic: 'some topic',
          unread_message_ids: [1, 2, 3],
        },
      ]);

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        message: message4,
      });

      const expectedState = [
        {
          stream_id: 1,
          topic: 'some topic',
          unread_message_ids: [1, 2, 3],
        },
        {
          stream_id: message4.stream_id,
          topic: message4.subject,
          unread_message_ids: [message4.id],
        },
      ];

      const actualState = unreadStreamsReducer(initialState, action);

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

      const actualState = unreadStreamsReducer(initialState, action);

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
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: false,
        allMessages: {},
        messages: [6, 7],
        flag: 'read',
        operation: 'add',
      });

      const actualState = unreadStreamsReducer(initialState, action);

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
          stream_id: 1,
          topic: 'some topic',
          unread_message_ids: [1, 2],
        },
      ];

      const actualState = unreadStreamsReducer(initialState, action);

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
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: false,
        allMessages: {},
        messages: [1, 2],
        flag: 'read',
        operation: 'remove',
      });

      const actualState = unreadStreamsReducer(initialState, action);

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
        id: 1,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        all: true,
        allMessages: {},
        messages: [],
        flag: 'read',
        operation: 'add',
      });

      const actualState = unreadStreamsReducer(initialState, action);

      expect(actualState).toBe(NULL_ARRAY);
    });
  });
});
