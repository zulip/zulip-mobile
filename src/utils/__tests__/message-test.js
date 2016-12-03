import { normalizeRecipients, sameRecipient } from '../message';

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
});

describe('sameRecipient', () => {
  test('passing undefined as any of parameters means recipients are not the same', () => {
    expect(sameRecipient(undefined, {})).toBe(false);
    expect(sameRecipient({}, undefined)).toBe(false);
    expect(sameRecipient(undefined, undefined)).toBe(false);
  });

  test('recipient types are compared first, if they differ then recipients differ', () => {
    expect(sameRecipient({ type: 'private' }, { type: 'stream' })).toBe(false);
  });

  test('recipient of unknown types are never the same', () => {
    expect(sameRecipient({ type: 'someUnknown' }, { type: 'someUnknown' })).toBe(false);
  });

  test('recipients are same for private type if display_recipient match in any order', () => {
    const msg1 = {
      type: 'private',
      display_recipient: [
        { email: 'abc@example.com' },
        { email: 'xyz@example.com' },
      ],
    };
    const msg2 = {
      type: 'private',
      display_recipient: [
        { email: 'xyz@example.com' },
        { email: 'abc@example.com' },
      ],
    };
    expect(sameRecipient(msg1, msg2)).toBe(true);
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
    expect(sameRecipient(msg1, msg2)).toBe(true);
  });
});
