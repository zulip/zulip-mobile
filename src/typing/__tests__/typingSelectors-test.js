import deepFreeze from 'deep-freeze';

import { getCurrentTypingUsers } from '../typingSelectors';
import { HOME_NARROW, privateNarrow, groupNarrow } from '../../utils/narrow';
import { NULL_ARRAY } from '../../nullObjects';

describe('getCurrentTypingUsers', () => {
  test('return NULL_ARRAY when current narrow is not private or group', () => {
    const state = deepFreeze({
      accounts: [{}],
    });

    const typingUsers = getCurrentTypingUsers(state, HOME_NARROW);

    expect(typingUsers).toBe(NULL_ARRAY);
  });

  test('when in private narrow and the same user is typing return details', () => {
    const expectedUser = {
      user_id: 1,
      email: 'john@example.com',
      avatar_url: 'http://example.com/avatar.png',
      full_name: 'John Doe',
    };
    const state = deepFreeze({
      accounts: [{ email: 'me@example.com' }],
      typing: {
        'john@example.com': { userIds: [1] },
      },
      users: [expectedUser],
    });

    const typingUsers = getCurrentTypingUsers(state, privateNarrow('john@example.com'));

    expect(typingUsers).toEqual([expectedUser]);
  });

  test('when two people are typing, return details for all of them', () => {
    const user1 = {
      user_id: 1,
      email: 'john@example.com',
      avatar_url: 'http://example.com/avatar1.png',
      full_name: 'John Doe',
    };
    const user2 = {
      user_id: 2,
      email: 'mark@example.com',
      avatar_url: 'http://example.com/avatar2.png',
      full_name: 'Mark Dark',
    };
    const state = deepFreeze({
      accounts: [{ email: 'me@example.com' }],
      typing: {
        'john@example.com,mark@example.com': { userIds: [1, 2] },
      },
      users: [user1, user2],
    });

    const typingUsers = getCurrentTypingUsers(
      state,
      groupNarrow(['john@example.com', 'mark@example.com']),
    );

    expect(typingUsers).toEqual([user1, user2]);
  });

  test('when in private narrow but different user is typing return NULL_ARRAY', () => {
    const state = deepFreeze({
      accounts: [{ email: 'me@example.com' }],
      typing: {
        'john@example.com': { userIds: [1] },
      },
    });

    const typingUsers = getCurrentTypingUsers(state, privateNarrow('mark@example.com'));

    expect(typingUsers).toEqual(NULL_ARRAY);
  });

  test('when in group narrow and someone is typing in that narrow return details', () => {
    const expectedUser = {
      user_id: 1,
      email: 'john@example.com',
      avatar_url: 'http://example.com/avatar.png',
      full_name: 'John Doe',
    };
    const state = deepFreeze({
      accounts: [{ email: 'me@example.com' }],
      typing: {
        'john@example.com,mark@example.com': { userIds: [1] },
      },
      users: [expectedUser],
    });

    const typingUsers = getCurrentTypingUsers(
      state,
      groupNarrow(['mark@example.com', 'john@example.com']),
    );

    expect(typingUsers).toEqual([expectedUser]);
  });
});
