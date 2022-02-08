/* @flow strict-local */
import deepFreeze from 'deep-freeze';
import Immutable from 'immutable';

import unreadMentionsReducer from '../unreadMentionsReducer';
import { ACCOUNT_SWITCH, EVENT_UPDATE_MESSAGE_FLAGS } from '../../actionConstants';
import { NULL_ARRAY } from '../../nullObjects';
import * as eg from '../../__tests__/lib/exampleData';

describe('unreadMentionsReducer', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze([1, 2, 3]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
        index: 0,
      });

      const expectedState = [];

      const actualState = unreadMentionsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('REGISTER_COMPLETE', () => {
    test('received data from "unread_msgs.mentioned" key replaces the current state ', () => {
      const initialState = deepFreeze([]);

      const action = eg.mkActionRegisterComplete({
        unread_msgs: { streams: [], huddles: [], pms: [], mentions: [1, 2, 3] },
      });

      const expectedState = [1, 2, 3];

      const actualState = unreadMentionsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('if message does not contain "mentioned" flag, do not mutate state', () => {
      const initialState = deepFreeze([]);

      const action = eg.mkActionEventNewMessage(eg.streamMessage({ flags: [] }));

      const actualState = unreadMentionsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message has "read" flag, do not mutate state', () => {
      const initialState = deepFreeze([]);

      const action = eg.mkActionEventNewMessage(eg.streamMessage({ flags: ['mentioned', 'read'] }));

      const actualState = unreadMentionsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if message id already exists, do not mutate state', () => {
      const initialState = deepFreeze([1, 2]);

      const action = eg.mkActionEventNewMessage(
        eg.streamMessage({ id: 2, flags: ['mentioned', 'read'] }),
      );

      const actualState = unreadMentionsReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if "mentioned" flag is set and message id does not exist, append to state', () => {
      const initialState = deepFreeze([1, 2]);

      const action = eg.mkActionEventNewMessage(eg.streamMessage({ id: 3, flags: ['mentioned'] }));

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
        id: 0,
        all: false,
        allMessages: Immutable.Map(),
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
        id: 0,
        all: false,
        allMessages: Immutable.Map(),
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
        id: 0,
        all: false,
        allMessages: Immutable.Map(),
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
        id: 0,
        all: false,
        allMessages: Immutable.Map(),
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
        id: 0,
        allMessages: Immutable.Map(),
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
