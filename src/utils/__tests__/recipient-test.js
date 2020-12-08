import {
  normalizeRecipients,
  normalizeRecipientsAsUserIds,
  normalizeRecipientsSansMe,
  normalizeRecipientsAsUserIdsSansMe,
  isSameRecipient,
} from '../recipient';
import * as logging from '../logging';

describe('normalizeRecipients', () => {
  test('joins emails from recipients, sorted, trimmed, not including missing ones', () => {
    const recipients = [
      { email: '' },
      { email: 'abc@example.com' },
      { email: 'xyz@example.com' },
      { email: '  def@example.com  ' },
    ];
    const expectedResult = 'abc@example.com,def@example.com,xyz@example.com';

    logging.error.mockReturnValue();

    const normalized = normalizeRecipients(recipients);
    expect(normalized).toEqual(expectedResult);

    expect(logging.error.mock.calls).toHaveLength(2);
    logging.error.mockReset();
  });
});

describe('normalizeRecipientsSansMe', () => {
  test('if only self email provided return unmodified', () => {
    const recipients = [{ email: 'me@example.com' }];
    const ownEmail = 'me@example.com';
    const expectedResult = 'me@example.com';

    const normalized = normalizeRecipientsSansMe(recipients, ownEmail);

    expect(normalized).toEqual(expectedResult);
  });

  test('when more than one emails normalize but filter out self email', () => {
    const recipients = [
      { email: 'abc@example.com' },
      { email: 'me@example.com' },
      { email: '  def@example.com  ' },
    ];
    const ownEmail = 'me@example.com';
    const expectedResult = 'abc@example.com,def@example.com';

    logging.error.mockReturnValue();

    const normalized = normalizeRecipientsSansMe(recipients, ownEmail);
    expect(normalized).toEqual(expectedResult);

    expect(logging.error.mock.calls).toHaveLength(1);
    logging.error.mockReset();
  });
});

describe('normalizeRecipientsAsUserIds', () => {
  test('joins user IDs from recipients, sorted', () => {
    const recipients = [
      { user_id: 22 },
      { user_id: 1 },
      { user_id: 5 },
      { user_id: 3 },
      { user_id: 4 },
    ];
    const expectedResult = '1,3,4,5,22';

    const normalized = normalizeRecipientsAsUserIds(recipients);

    expect(normalized).toEqual(expectedResult);
  });

  test('for a single recipient, returns the user ID as string', () => {
    const recipients = [{ user_id: 1 }];
    const expectedResult = '1';

    const normalized = normalizeRecipientsAsUserIds(recipients);

    expect(normalized).toEqual(expectedResult);
  });
});

describe('normalizeRecipientsAsUserIdsSansMe', () => {
  test('if only self user ID provided return unmodified', () => {
    const recipients = [{ user_id: 1 }];
    const ownUserId = 1;
    const expectedResult = '1';

    const normalized = normalizeRecipientsAsUserIdsSansMe(recipients, ownUserId);

    expect(normalized).toEqual(expectedResult);
  });

  test('when more than one user IDs normalize but filter out self user ID', () => {
    const recipients = [
      { user_id: 22 },
      { user_id: 1 },
      { user_id: 5 },
      { user_id: 3 },
      { user_id: 4 },
    ];
    const expectedResult = '3,4,5,22';
    const ownUserId = 1;

    const normalized = normalizeRecipientsAsUserIdsSansMe(recipients, ownUserId);

    expect(normalized).toEqual(expectedResult);
  });
});

describe('isSameRecipient', () => {
  test('passing undefined as any of parameters means recipients are not the same', () => {
    expect(isSameRecipient(undefined, {})).toBe(false);
    expect(isSameRecipient({}, undefined)).toBe(false);
    expect(isSameRecipient(undefined, undefined)).toBe(false);
  });

  test('recipient types are compared first, if they differ then recipients differ', () => {
    expect(isSameRecipient({ type: 'private' }, { type: 'stream' })).toBe(false);
  });

  test('recipient of unknown types are never the same', () => {
    expect(isSameRecipient({ type: 'someUnknown' }, { type: 'someUnknown' })).toBe(false);
  });

  test('recipients are same for private type if display_recipient match in any order', () => {
    const msg1 = {
      type: 'private',
      display_recipient: [{ email: 'abc@example.com' }, { email: 'xyz@example.com' }],
    };
    const msg2 = {
      type: 'private',
      display_recipient: [{ email: 'xyz@example.com' }, { email: 'abc@example.com' }],
    };
    expect(isSameRecipient(msg1, msg2)).toBe(true);
  });

  test('recipients are same for stream type if display_recipient and subject match', () => {
    const msg1 = {
      type: 'stream',
      display_recipient: 'abc',
      subject: 'def',
    };
    const msg2 = {
      type: 'stream',
      display_recipient: 'abc',
      subject: 'def',
    };
    expect(isSameRecipient(msg1, msg2)).toBe(true);
  });
});
