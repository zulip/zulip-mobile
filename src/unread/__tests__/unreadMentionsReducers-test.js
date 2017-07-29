import deepFreeze from 'deep-freeze';

import unreadMentionsReducers from '../unreadMentionsReducers';
import {
  REALM_INIT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  MARK_MESSAGES_READ,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../../actionConstants';

describe('unreadMentionsReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze([1, 2, 3]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = [];

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('REALM_INIT', () => {
    test('received data from "unread_msgs.mentioned" key replaces the current state ', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: REALM_INIT,
        data: {
          unread_msgs: {
            streams: [{}, {}],
            huddles: [{}, {}, {}],
            pms: [{}, {}, {}],
            mentions: [1, 2, 3],
          },
        },
      });

      const expectedState = [1, 2, 3];

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('if message does not contain is_mentioned, do not mutate state', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 2,
        },
      });

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message id already exists, do not mutate state', () => {
      const initialState = deepFreeze([1, 2]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 2,
          is_mentioned: true,
        },
      });

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if is_mentioned is true and message id does not exist, append to state', () => {
      const initialState = deepFreeze([1, 2]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 3,
          is_mentioned: true,
        },
      });

      const expectedState = [1, 2, 3];

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('MARK_MESSAGES_READ', () => {
    test('when ids are not contained already, do not change the state', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: MARK_MESSAGES_READ,
        messageIds: [1, 2, 3],
      });

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message ids exist in state, remove them', () => {
      const initialState = deepFreeze([1, 2, 3, 4, 5]);

      const action = deepFreeze({
        type: MARK_MESSAGES_READ,
        messageIds: [1, 2, 3, 6, 7],
      });

      const expectedState = [4, 5];

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_UPDATE_MESSAGE_FLAGS', () => {
    test('when operation is "add" and flag is "read" adds message id to state', () => {
      const initialState = deepFreeze([]);

      const action = {
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1, 2, 3],
        flag: 'read',
        operation: 'add',
      };

      const expectedState = [1, 2, 3];

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if flag already exists do not mutate state', () => {
      const initialState = deepFreeze([1]);

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'read',
        operation: 'add',
      });

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if other flags exist, adds new one to the list', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'read',
        operation: 'add',
      });

      const expectedState = [1];

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('adds flags for multiple messages', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'starred',
        operation: 'add',
      });

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('when operation is "remove" removes a flag from message', () => {
      const initialState = deepFreeze([1]);

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'read',
        operation: 'remove',
      });

      const expectedState = [];

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if flag does not exist, do nothing', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1],
        flag: 'read',
        operation: 'remove',
      });

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('removes flags from multiple messages', () => {
      const initialState = deepFreeze([1, 2, 3, 4, 5]);

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1, 2, 3, 6, 7],
        flag: 'read',
        operation: 'remove',
      });

      const expectedState = [4, 5];

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
