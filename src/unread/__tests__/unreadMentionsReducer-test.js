import deepFreeze from 'deep-freeze';

import unreadMentionsReducer from '../unreadMentionsReducer';
import {
  REALM_INIT,
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../../actionConstants';
import { NULL_ARRAY } from '../../nullObjects';

describe('unreadMentionsReducer', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze([1, 2, 3]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = [];

      const actualState = unreadMentionsReducer(initialState, action);

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

      const actualState = unreadMentionsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('if message does not contain "mentioned" flag, do not mutate state', () => {
      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 2,
          flags: [],
        },
      });

      const actualState = unreadMentionsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message id already exists, do not mutate state', () => {
      const initialState = deepFreeze([1, 2]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 2,
          flags: ['mentioned'],
        },
      });

      const actualState = unreadMentionsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if "mentioned" flag is set and message id does not exist, append to state', () => {
      const initialState = deepFreeze([1, 2]);

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 3,
          flags: ['mentioned'],
        },
      });

      const expectedState = [1, 2, 3];

      const actualState = unreadMentionsReducer(initialState, action);

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
        op: 'add',
      };

      const actualState = unreadMentionsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if id does not exist do not mutate state', () => {
      const initialState = deepFreeze([1]);

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [2],
        flag: 'read',
        op: 'add',
      });

      const actualState = unreadMentionsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if ids are in state remove them', () => {
      const initialState = deepFreeze([1, 2, 3]);

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [2, 3],
        flag: 'read',
        op: 'add',
      });

      const expectedState = [1];

      const actualState = unreadMentionsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('when operation is "remove" do nothing', () => {
      const initialState = deepFreeze([1]);

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [1, 2],
        flag: 'read',
        op: 'remove',
      });

      const actualState = unreadMentionsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('when "all" is true reset state', () => {
      const initialState = deepFreeze([1, 2, 3]);

      const action = deepFreeze({
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        messages: [],
        flag: 'read',
        op: 'add',
        all: true,
      });

      const actualState = unreadMentionsReducer(initialState, action);

      expect(actualState).toBe(NULL_ARRAY);
    });
  });
});
