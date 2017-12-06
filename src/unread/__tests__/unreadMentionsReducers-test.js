import deepFreeze from 'deep-freeze';

import unreadMentionsReducers from '../unreadMentionsReducers';
import {
  REALM_INIT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  MARK_MESSAGES_READ,
  MARK_MESSAGE_AS_READ_LOCALLY,
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

  describe('MARK_MESSAGE_AS_READ_LOCALLY', () => {
    test('when operation is "add" but flag is not "read" do not mutate state', () => {
      const initialState = deepFreeze([]);

      const action = {
        type: MARK_MESSAGE_AS_READ_LOCALLY,
        messages: [1, 2, 3],
        flag: 'star',
        operation: 'add',
      };

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if id does not exist do not mutate state', () => {
      const initialState = deepFreeze([1]);

      const action = deepFreeze({
        type: MARK_MESSAGE_AS_READ_LOCALLY,
        messages: [2],
        flag: 'read',
        operation: 'add',
      });

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if ids are in state remove them', () => {
      const initialState = deepFreeze([1, 2, 3]);

      const action = deepFreeze({
        type: MARK_MESSAGE_AS_READ_LOCALLY,
        messages: [2, 3],
        flag: 'read',
        operation: 'add',
      });

      const expectedState = [1];

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when operation is "remove" do nothing', () => {
      const initialState = deepFreeze([1]);

      const action = deepFreeze({
        type: MARK_MESSAGE_AS_READ_LOCALLY,
        messages: [1, 2],
        flag: 'read',
        operation: 'remove',
      });

      const actualState = unreadMentionsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });
  });
});
