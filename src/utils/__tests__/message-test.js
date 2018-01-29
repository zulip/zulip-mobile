import {
  normalizeRecipients,
  normalizeRecipientsSansMe,
  isSameRecipient,
  shouldBeMuted,
  isMessageRead,
  findFirstUnread,
} from '../message';
import { homeNarrow } from '../narrow';
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
  test('private messages are never muted', () => {
    const message = {
      display_recipient: [],
    };

    const isMuted = shouldBeMuted(message, homeNarrow, []);

    expect(isMuted).toBe(false);
  });

  test('message in a stream is muted if stream is not in mute list', () => {
    const message = {
      display_recipient: 'stream',
    };

    const isMuted = shouldBeMuted(message, homeNarrow, []);

    expect(isMuted).toBe(true);
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

describe('isMessageRead', () => {
  test('message with no flags is considered not read', () => {
    const message = { id: 0 };
    const result = isMessageRead(message);
    expect(result).toEqual(false);
  });

  test('message with flag of "read" is considered read', () => {
    const message = { id: 0, flags: ['read'] };
    const result = isMessageRead(message);
    expect(result).toEqual(true);
  });

  test('a message in a muted stream is considered read', () => {
    const message = {
      id: 0,
      flags: [],
      display_recipient: 'muted stream',
      subject: 'topic',
    };
    const subscriptions = [
      {
        name: 'muted stream',
        in_home_view: false,
      },
    ];

    const result = isMessageRead(message, subscriptions);

    expect(result).toEqual(true);
  });

  test('a message in a muted topic is considered read', () => {
    const message = {
      id: 0,
      flags: [],
      display_recipient: 'stream',
      subject: 'muted topic',
    };
    const subscriptions = [
      {
        name: 'stream',
        in_home_view: false,
      },
    ];
    const mute = [['stream', 'muted topic']];

    const result = isMessageRead(message, subscriptions, mute);

    expect(result).toEqual(true);
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

  test('if all are read returns the last message', () => {
    const messages = [
      { id: 0, flags: ['read'] },
      { id: 1, flags: ['read'] },
      { id: 2, flags: ['read'] },
    ];

    const result = findFirstUnread(messages);

    expect(result).toEqual({ id: 2, flags: ['read'] });
  });

  test('if no messages returns NULL_MESSAGE', () => {
    const messages = [];

    const result = findFirstUnread(messages);

    expect(result).toEqual(NULL_MESSAGE);
  });

  test('a message in muted stream or topic is considered read', () => {
    const messageInMutedStream = {
      id: 0,
      flags: [],
      display_recipient: 'muted stream',
      subject: 'topic',
    };
    const messageInMutedTopic = {
      id: 1,
      flags: [],
      display_recipient: 'stream',
      subject: 'muted topic',
    };
    const unreadMessage = { id: 2, flags: [] };
    const messages = [messageInMutedStream, messageInMutedTopic, unreadMessage];
    const subscriptions = [
      {
        name: 'stream',
        in_home_view: true,
      },
      {
        name: 'muted stream',
        in_home_view: false,
      },
    ];
    const mute = [['stream', 'muted topic']];
    const result = findFirstUnread(messages, subscriptions, mute);

    expect(result).toEqual(unreadMessage);
  });
});
