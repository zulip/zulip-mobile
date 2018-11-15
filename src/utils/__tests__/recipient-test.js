import { normalizeRecipients, normalizeRecipientsSansMe, isSameRecipient } from '../recipient';

describe('normalizeRecipients', () => {
  test('joins emails from recipients, sorted, trimmed, not including missing ones', () => {
    const recipients = [
      { email: '' },
      { email: 'abc@example.com' },
      { email: 'xyz@example.com' },
      { email: '  def@example.com  ' },
    ];
    const expectedResult = 'abc@example.com,def@example.com,xyz@example.com';

    const normalized = normalizeRecipients(recipients);

    expect(normalized).toEqual(expectedResult);
  });

  test('on a string input, returns same string', () => {
    const recipients = 'abc@example.com';
    const expectedResult = 'abc@example.com';

    const normalized = normalizeRecipients(recipients);

    expect(normalized).toEqual(expectedResult);
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

    const normalized = normalizeRecipientsSansMe(recipients, ownEmail);

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
