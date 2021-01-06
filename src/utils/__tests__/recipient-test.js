/* @flow strict-local */

import {
  normalizeRecipientsAsUserIds,
  normalizeRecipientsAsUserIdsSansMe,
  isSameRecipient,
} from '../recipient';
import * as eg from '../../__tests__/lib/exampleData';

describe('normalizeRecipientsAsUserIds', () => {
  test('joins user IDs from recipients, sorted', () => {
    const recipients = [22, 1, 5, 3, 4];
    const expectedResult = '1,3,4,5,22';

    const normalized = normalizeRecipientsAsUserIds(recipients);

    expect(normalized).toEqual(expectedResult);
  });

  test('for a single recipient, returns the user ID as string', () => {
    const recipients = [1];
    const expectedResult = '1';

    const normalized = normalizeRecipientsAsUserIds(recipients);

    expect(normalized).toEqual(expectedResult);
  });
});

describe('normalizeRecipientsAsUserIdsSansMe', () => {
  test('if only self user ID provided return unmodified', () => {
    const recipients = [1];
    const ownUserId = 1;
    const expectedResult = '1';

    const normalized = normalizeRecipientsAsUserIdsSansMe(recipients, ownUserId);

    expect(normalized).toEqual(expectedResult);
  });

  test('when more than one user IDs normalize but filter out self user ID', () => {
    const recipients = [22, 1, 5, 3, 4];
    const expectedResult = '3,4,5,22';
    const ownUserId = 1;

    const normalized = normalizeRecipientsAsUserIdsSansMe(recipients, ownUserId);

    expect(normalized).toEqual(expectedResult);
  });
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
