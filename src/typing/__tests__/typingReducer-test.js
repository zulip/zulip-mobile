/* @flow strict-local */

import deepFreeze from 'deep-freeze';

import type { Action, User } from '../../types';
import { EVENT_TYPING_START, EVENT_TYPING_STOP } from '../../actionConstants';
import typingReducer from '../typingReducer';
import { NULL_OBJECT } from '../../nullObjects';
import * as eg from '../../__tests__/lib/exampleData';
import { makeUserId } from '../../api/idTypes';

describe('typingReducer', () => {
  const user1 = { ...eg.otherUser, user_id: makeUserId(1) };
  const user2 = { ...eg.thirdUser, user_id: makeUserId(2) };

  const egTypingAction = (args: {|
    op: 'start' | 'stop',
    sender: User,
    recipients: $ReadOnlyArray<User>,
    time: number,
  |}): Action => {
    const { op, sender, recipients, time } = args;
    const base = { id: 123, ownUserId: eg.selfUser.user_id, sender, recipients, time };
    return op === 'start'
      ? { ...base, op: 'start', type: EVENT_TYPING_START }
      : { ...base, op: 'stop', type: EVENT_TYPING_STOP };
  };

  describe('EVENT_TYPING_START', () => {
    test('adds sender as currently typing user', () => {
      const initialState = NULL_OBJECT;

      const action = egTypingAction({
        op: 'start',
        sender: user1,
        recipients: [user1, eg.selfUser],
        time: 123456789,
      });

      const expectedState = {
        '1': { time: 123456789, userIds: [user1.user_id] },
      };

      const newState = typingReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if user is already typing, no change in userIds but update time', () => {
      const initialState = deepFreeze({
        '1': { time: 123456789, userIds: [user1.user_id] },
      });

      const action = egTypingAction({
        op: 'start',
        sender: user1,
        recipients: [user1, eg.selfUser],
        time: 123456889,
      });

      const expectedState = {
        '1': { time: 123456889, userIds: [user1.user_id] },
      };

      const newState = typingReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if other people are typing in other narrows, add, do not affect them', () => {
      const initialState = deepFreeze({
        '1': { time: 123489, userIds: [user1.user_id] },
      });

      const action = egTypingAction({
        op: 'start',
        sender: user2,
        recipients: [user1, user2, eg.selfUser],
        time: 123456789,
      });

      const expectedState = {
        '1': { time: 123489, userIds: [user1.user_id] },
        '1,2': { time: 123456789, userIds: [user2.user_id] },
      };

      const newState = typingReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if another user is typing already, append new one', () => {
      const initialState = deepFreeze({
        '1,2': { time: 123489, userIds: [user1.user_id] },
      });

      const action = egTypingAction({
        op: 'start',
        sender: user2,
        recipients: [user1, user2, eg.selfUser],
        time: 123456789,
      });

      const expectedState = {
        '1,2': { time: 123456789, userIds: [user1.user_id, user2.user_id] },
      };

      const newState = typingReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_TYPING_STOP', () => {
    test('if after removing, key is an empty list, key is removed', () => {
      const initialState = deepFreeze({
        '1': { time: 123489, userIds: [user1.user_id] },
        '3': { time: 123489, userIds: [eg.selfUser.user_id] },
      });

      const action = egTypingAction({
        op: 'stop',
        sender: user1,
        recipients: [user1, eg.selfUser],
        time: 123456789,
      });

      const expectedState = {
        '3': { time: 123489, userIds: [eg.selfUser.user_id] },
      };

      const newState = typingReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if two people are typing, just one is removed', () => {
      const initialState = deepFreeze({
        '1': { time: 123489, userIds: [user1.user_id, eg.selfUser.user_id] },
      });

      const action = egTypingAction({
        op: 'stop',
        sender: user1,
        recipients: [user1, eg.selfUser],
        time: 123456789,
      });

      const expectedState = {
        '1': { time: 123456789, userIds: [eg.selfUser.user_id] },
      };

      const newState = typingReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if typing state does not exist, no change is made', () => {
      const initialState = NULL_OBJECT;

      const action = egTypingAction({
        op: 'stop',
        sender: user1,
        recipients: [user1, eg.selfUser],
        time: 123456789,
      });

      const expectedState = {};

      const newState = typingReducer(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
