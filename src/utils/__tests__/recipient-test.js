/* @flow strict-local */

import {
  normalizeRecipientsAsUserIdsSansMe,
  isSameRecipient,
  pmKeyRecipientUsersFromIds,
} from '../recipient';
import * as eg from '../../__tests__/lib/exampleData';
import { makeUserId } from '../../api/idTypes';

describe('normalizeRecipientsAsUserIdsSansMe', () => {
  test('if only self user ID provided return unmodified', () => {
    const recipients = [1].map(makeUserId);
    const ownUserId = makeUserId(1);
    const expectedResult = '1';

    const normalized = normalizeRecipientsAsUserIdsSansMe(recipients, ownUserId);

    expect(normalized).toEqual(expectedResult);
  });

  test('when more than one user IDs normalize but filter out self user ID', () => {
    const recipients = [22, 1, 5, 3, 4].map(makeUserId);
    const expectedResult = '3,4,5,22';
    const ownUserId = makeUserId(1);

    const normalized = normalizeRecipientsAsUserIdsSansMe(recipients, ownUserId);

    expect(normalized).toEqual(expectedResult);
  });
});

describe('pmKeyRecipientUsersFromIds', () => {
  const allUsersById = new Map([eg.selfUser, eg.otherUser, eg.thirdUser].map(u => [u.user_id, u]));
  const [self, other, third] = [eg.selfUser, eg.otherUser, eg.thirdUser];
  // prettier-ignore
  /* eslint-disable no-multi-spaces */
  /* eslint-disable array-bracket-spacing */
  for (const [description, users, expectedSet] of [
    ['self-1:1, self included',  [self],               [self]],
    ['self-1:1, self omitted',   [    ],               [self]],
    ['other 1:1, self included', [self, other],        [other]],
    ['other 1:1, self included', [      other],        [other]],
    ['group PM, self included',  [self, other, third], [other, third]],
    ['group PM, self included',  [      other, third], [other, third]],
  ]) {
    test(`correct on ${description}`, () => {
      expect(
        pmKeyRecipientUsersFromIds(users.map(u => u.user_id), allUsersById, eg.selfUser.user_id),
      ).toEqual(expectedSet.sort((a, b) => a.user_id - b.user_id));
    });
  }
});

describe('isSameRecipient', () => {
  test('passing undefined as any of parameters means recipients are not the same', () => {
    expect(isSameRecipient(undefined, eg.pmMessage())).toBe(false);
    expect(isSameRecipient(eg.streamMessage(), undefined)).toBe(false);
    expect(isSameRecipient(undefined, undefined)).toBe(false);
  });

  test('recipient types are compared first, if they differ then recipients differ', () => {
    expect(isSameRecipient(eg.pmMessage(), eg.streamMessage())).toBe(false);
  });

  // Skipped because we don't currently support this.  See comment on implementation.
  test.skip('recipients are same for private type if display_recipient match in any order', () => {
    const msg1 = eg.pmMessageFromTo(eg.selfUser, [eg.otherUser, eg.thirdUser]);
    const msg2 = eg.pmMessageFromTo(eg.selfUser, [eg.thirdUser, eg.otherUser]);
    expect(isSameRecipient(msg1, msg2)).toBe(true);
  });

  test('recipients are same for stream type if display_recipient and subject match', () => {
    const topic = eg.randString();
    const msg1 = eg.streamMessage({ stream: eg.stream, subject: topic, content: eg.randString() });
    const msg2 = eg.streamMessage({ stream: eg.stream, subject: topic, content: eg.randString() });
    expect(isSameRecipient(msg1, msg2)).toBe(true);
  });
});
