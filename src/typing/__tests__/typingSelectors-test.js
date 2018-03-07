import deepFreeze from 'deep-freeze';

import { getCurrentTypingUsers } from '../typingSelectors';
import { homeNarrow, privateNarrow, groupNarrow } from '../../utils/narrow';

describe('getCurrentTypingUsers', () => {
  test('return undefined when current narrow is not private or group', () => {
    const state = deepFreeze({
      accounts: [{}],
    });

    const typingUsers = getCurrentTypingUsers(homeNarrow)(state);

    expect(typingUsers).toEqual(undefined);
  });

  test('when in private narrow and the same user is typing return details', () => {
    const expectedUser = {
      id: 1,
      email: 'john@example.com',
      avatarUrl: 'http://example.com/avatar.png',
      fullName: 'John Doe',
    };
    const state = deepFreeze({
      accounts: [{ email: 'me@example.com' }],
      typing: {
        'john@example.com': { userIds: [1] },
      },
      users: [expectedUser],
    });

    const typingUsers = getCurrentTypingUsers(privateNarrow('john@example.com'))(state);

    expect(typingUsers).toEqual([expectedUser]);
  });

  test('when two people are typing, return details for all of them', () => {
    const user1 = {
      id: 1,
      email: 'john@example.com',
      avatarUrl: 'http://example.com/avatar1.png',
      fullName: 'John Doe',
    };
    const user2 = {
      id: 2,
      email: 'mark@example.com',
      avatarUrl: 'http://example.com/avatar2.png',
      fullName: 'Mark Dark',
    };
    const state = deepFreeze({
      accounts: [{ email: 'me@example.com' }],
      typing: {
        'john@example.com,mark@example.com': { userIds: [1, 2] },
      },
      users: [user1, user2],
    });

    const typingUsers = getCurrentTypingUsers(
      groupNarrow(['john@example.com', 'mark@example.com']),
    )(state);

    expect(typingUsers).toEqual([user1, user2]);
  });

  test('when in private narrow but different user is typing return undefined', () => {
    const state = deepFreeze({
      accounts: [{ email: 'me@example.com' }],
      typing: {
        'john@example.com': { userIds: [1] },
      },
    });

    const typingUsers = getCurrentTypingUsers(privateNarrow('mark@example.com'))(state);

    expect(typingUsers).toEqual(undefined);
  });

  test('when in group narrow and someone is typing in that narrow return details', () => {
    const expectedUser = {
      id: 1,
      email: 'john@example.com',
      avatarUrl: 'http://example.com/avatar.png',
      fullName: 'John Doe',
    };
    const state = deepFreeze({
      accounts: [{ email: 'me@example.com' }],
      typing: {
        'john@example.com,mark@example.com': { userIds: [1] },
      },
      users: [expectedUser],
    });

    const typingUsers = getCurrentTypingUsers(
      groupNarrow(['mark@example.com', 'john@example.com']),
    )(state);

    expect(typingUsers).toEqual([expectedUser]);
  });
});
