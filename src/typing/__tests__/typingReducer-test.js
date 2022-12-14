/* @flow strict-local */

import deepFreeze from 'deep-freeze';

import type { PerAccountAction, User } from '../../types';
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
  |}): PerAccountAction => {
    const { op, sender, recipients, time } = args;
    const base = {
      id: 123,
      ownUserId: eg.selfUser.user_id,
      sender: { user_id: sender.user_id, email: sender.email },
      recipients: recipients.map(r => ({ user_id: r.user_id, email: r.email })),
      time,
    };
    return op === 'start'
      ? { ...base, op: 'start', type: EVENT_TYPING_START }
      : { ...base, op: 'stop', type: EVENT_TYPING_STOP };
  };

  describe('RESET_ACCOUNT_DATA', () => {
    const initialState = eg.baseReduxState.typing;
    const action1 = egTypingAction({
      op: 'start',
      sender: user1,
      recipients: [user1, user2],
      time: 123456789,
    });
    const prevState = typingReducer(initialState, action1);
    expect(prevState).not.toEqual(initialState);

    expect(typingReducer(prevState, eg.action.reset_account_data)).toEqual(initialState);
  });

  describe('EVENT_TYPING_START', () => {
    test('adds sender as currently typing user', () => {
      const prevState = NULL_OBJECT;
      expect(
        typingReducer(
          prevState,
          egTypingAction({
            op: 'start',
            sender: user1,
            recipients: [user1, eg.selfUser],
            time: 123456789,
          }),
        ),
      ).toEqual({ '1': { time: 123456789, userIds: [user1.user_id] } });
    });

    test('if user is already typing, no change in userIds but update time', () => {
      const prevState = deepFreeze({ '1': { time: 123456789, userIds: [user1.user_id] } });
      expect(
        typingReducer(
          prevState,
          egTypingAction({
            op: 'start',
            sender: user1,
            recipients: [user1, eg.selfUser],
            time: 123456889,
          }),
        ),
      ).toEqual({ '1': { time: 123456889, userIds: [user1.user_id] } });
    });

    test('if other people are typing in other narrows, add, do not affect them', () => {
      const prevState = deepFreeze({ '1': { time: 123489, userIds: [user1.user_id] } });
      expect(
        typingReducer(
          prevState,
          egTypingAction({
            op: 'start',
            sender: user2,
            recipients: [user1, user2, eg.selfUser],
            time: 123456789,
          }),
        ),
      ).toEqual({
        '1': { time: 123489, userIds: [user1.user_id] },
        '1,2': { time: 123456789, userIds: [user2.user_id] },
      });
    });

    test('if another user is typing already, append new one', () => {
      const prevState = deepFreeze({ '1,2': { time: 123489, userIds: [user1.user_id] } });
      expect(
        typingReducer(
          prevState,
          egTypingAction({
            op: 'start',
            sender: user2,
            recipients: [user1, user2, eg.selfUser],
            time: 123456789,
          }),
        ),
      ).toEqual({ '1,2': { time: 123456789, userIds: [user1.user_id, user2.user_id] } });
    });
  });

  describe('EVENT_TYPING_STOP', () => {
    test('if after removing, key is an empty list, key is removed', () => {
      const prevState = deepFreeze({
        '1': { time: 123489, userIds: [user1.user_id] },
        '3': { time: 123489, userIds: [eg.selfUser.user_id] },
      });
      expect(
        typingReducer(
          prevState,
          egTypingAction({
            op: 'stop',
            sender: user1,
            recipients: [user1, eg.selfUser],
            time: 123456789,
          }),
        ),
      ).toEqual({ '3': { time: 123489, userIds: [eg.selfUser.user_id] } });
    });

    test('if two people are typing, just one is removed', () => {
      const prevState = deepFreeze({
        '1': { time: 123489, userIds: [user1.user_id, eg.selfUser.user_id] },
      });
      expect(
        typingReducer(
          prevState,
          egTypingAction({
            op: 'stop',
            sender: user1,
            recipients: [user1, eg.selfUser],
            time: 123456789,
          }),
        ),
      ).toEqual({ '1': { time: 123456789, userIds: [eg.selfUser.user_id] } });
    });

    test('if typing state does not exist, no change is made', () => {
      const prevState = NULL_OBJECT;
      expect(
        typingReducer(
          prevState,
          egTypingAction({
            op: 'stop',
            sender: user1,
            recipients: [user1, eg.selfUser],
            time: 123456789,
          }),
        ),
      ).toEqual({});
    });
  });
});
