/* @flow strict-local */

import type { GlobalState } from '../../types';
import { getCurrentTypingUsers } from '../typingSelectors';
import { HOME_NARROW, pm1to1NarrowFromUser, pmNarrowFromUsersUnsafe } from '../../utils/narrow';
import { NULL_ARRAY } from '../../nullObjects';
import * as eg from '../../__tests__/lib/exampleData';
import { normalizeRecipientsAsUserIds } from '../../utils/recipient';

describe('getCurrentTypingUsers', () => {
  test('return NULL_ARRAY when current narrow is not private or group', () => {
    const state: GlobalState = eg.reduxState({});

    const typingUsers = getCurrentTypingUsers(state, HOME_NARROW);

    expect(typingUsers).toBe(NULL_ARRAY);
  });

  test('when in private narrow and the same user is typing return details', () => {
    const expectedUser = eg.makeUser();
    const state = eg.reduxState({
      typing: {
        [expectedUser.user_id.toString()]: { userIds: [expectedUser.user_id] },
      },
      users: [expectedUser],
    });

    const typingUsers = getCurrentTypingUsers(state, pm1to1NarrowFromUser(expectedUser));

    expect(typingUsers).toEqual([expectedUser]);
  });

  test('when two people are typing, return details for all of them', () => {
    const user1 = eg.makeUser();
    const user2 = eg.makeUser();

    const normalizedRecipients = normalizeRecipientsAsUserIds([user1.user_id, user2.user_id]);

    const state = eg.reduxState({
      typing: {
        [normalizedRecipients]: { userIds: [user1.user_id, user2.user_id] },
      },
      users: [user1, user2],
    });

    const typingUsers = getCurrentTypingUsers(state, pmNarrowFromUsersUnsafe([user1, user2]));

    expect(typingUsers).toEqual([user1, user2]);
  });

  test('when in private narrow but different user is typing return NULL_ARRAY', () => {
    const user1 = eg.makeUser();
    const user2 = eg.makeUser();
    const normalizedRecipients = normalizeRecipientsAsUserIds([user1.user_id]);

    const state = eg.reduxState({
      typing: {
        [normalizedRecipients]: { userIds: [user1.user_id] },
      },
      users: [user1, user2],
    });

    const typingUsers = getCurrentTypingUsers(state, pm1to1NarrowFromUser(user2));

    expect(typingUsers).toEqual(NULL_ARRAY);
  });

  test('when in group narrow and someone is typing in that narrow return details', () => {
    const expectedUser = eg.makeUser();
    const anotherUser = eg.makeUser();

    const normalizedRecipients = normalizeRecipientsAsUserIds([
      expectedUser.user_id,
      anotherUser.user_id,
    ]);
    const state = eg.reduxState({
      typing: {
        [normalizedRecipients]: { userIds: [expectedUser.user_id] },
      },
      users: [expectedUser, anotherUser],
    });

    const typingUsers = getCurrentTypingUsers(
      state,
      pmNarrowFromUsersUnsafe([expectedUser, anotherUser]),
    );

    expect(typingUsers).toEqual([expectedUser]);
  });

  test('when in a private narrow with a deactivated user, return valid data', () => {
    const deactivatedUser = eg.makeUser();
    const state = eg.reduxState({
      typing: {},
      realm: eg.realmState({ nonActiveUsers: [deactivatedUser] }),
    });

    const getTypingUsers = () =>
      getCurrentTypingUsers(state, pm1to1NarrowFromUser(deactivatedUser));

    expect(getTypingUsers).not.toThrow();
    expect(getTypingUsers()).toEqual([]);
  });

  test('when in a private narrow with a cross-realm bot, return valid data', () => {
    const crossRealmBot = eg.makeCrossRealmBot();
    const state = eg.reduxState({
      typing: {},
      realm: eg.realmState({ crossRealmBots: [crossRealmBot] }),
    });

    const getTypingUsers = () => getCurrentTypingUsers(state, pm1to1NarrowFromUser(crossRealmBot));

    expect(getTypingUsers).not.toThrow();
    expect(getTypingUsers()).toEqual([]);
  });
});
