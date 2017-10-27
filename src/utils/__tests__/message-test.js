import {
  normalizeRecipients,
  normalizeRecipientsSansMe,
  isSameRecipient,
  shouldBeMuted,
  findFirstUnread,
} from '../message';
import { NULL_MESSAGE } from '../../nullObjects';

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

describe('shouldBeMuted', () => {
  const homeNarrow = [];

  test('private messages are never muted', () => {
    const message = {
      display_recipient: [],
    };

    const isMuted = shouldBeMuted(message, homeNarrow, []);

    expect(isMuted).toBe(false);
  });

  test('message in a stream is not muted if stream is not in mute list', () => {
    const message = {
      display_recipient: 'stream',
    };

    const isMuted = shouldBeMuted(message, homeNarrow, []);

    expect(isMuted).toBe(false);
  });

  test('message in a stream is muted if the stream is muted', () => {
    const message = {
      display_recipient: 'stream',
    };
    const subscriptions = [
      {
        name: 'stream',
        in_home_view: false,
      },
    ];
    const isMuted = shouldBeMuted(message, homeNarrow, subscriptions);

    expect(isMuted).toBe(true);
  });

  test('message in a stream is muted if the topic is muted and topic matches', () => {
    const message = {
      display_recipient: 'stream',
      subject: 'topic',
    };
    const subscriptions = [
      {
        name: 'stream',
        in_home_view: true,
      },
    ];
    const mutes = [['stream', 'topic']];
    const isMuted = shouldBeMuted(message, homeNarrow, subscriptions, mutes);

    expect(isMuted).toBe(true);
  });
});

describe('findFirstUnread', () => {
  test('returns first message with no flags property', () => {
    const messages = [{ id: 0, flags: ['read'] }, { id: 1, flags: ['read'] }, { id: 2 }, { id: 3 }];

    const result = findFirstUnread(messages);

    expect(result).toEqual(messages[2]);
  });

  test('returns first message with no "read" flag', () => {
    const messages = [{ id: 0, flags: ['read'] }, { id: 1, flags: ['star'] }];

    const result = findFirstUnread(messages);

    expect(result).toEqual(messages[1]);
  });

  test('if all are read returns undefined', () => {
    const messages = [
      { id: 0, flags: ['read'] },
      { id: 1, flags: ['read'] },
      { id: 2, flags: ['read'] },
    ];

    const result = findFirstUnread(messages);

    expect(result).toEqual(NULL_MESSAGE);
  });
});
