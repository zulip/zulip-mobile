/* @flow strict-local */
import { shouldBeMuted, isMessageRead, findFirstUnread } from '../message';
import { HOME_NARROW, topicNarrow } from '../narrow';
import { eg } from '../../__tests__/exampleData';

describe('shouldBeMuted', () => {
  const message = eg.streamMessage();
  const messageMute = [eg.stream.name, message.subject];

  test('private messages are never muted', () => {
    expect(shouldBeMuted(eg.pmMessage(), HOME_NARROW, [], [])).toBe(false);
  });

  test('stream message not muted in base case', () => {
    expect(shouldBeMuted(message, HOME_NARROW, [eg.subscription], [])).toBe(false);
  });

  test('stream message is muted if stream not subscribed to', () => {
    expect(shouldBeMuted(message, HOME_NARROW, [], [])).toBe(true);
  });

  test('stream message is muted if the stream is muted', () => {
    expect(
      shouldBeMuted(message, HOME_NARROW, [{ ...eg.subscription, in_home_view: false }], []),
    ).toBe(true);
  });

  test('stream message is muted if the topic is muted', () => {
    expect(shouldBeMuted(message, HOME_NARROW, [eg.subscription], [messageMute])).toBe(true);
  });

  test('stream message not muted when narrowed to topic, even if otherwise would be', () => {
    const narrow = topicNarrow(eg.stream.name, message.subject);
    expect(shouldBeMuted(message, narrow, [], [])).toBe(false);
    expect(shouldBeMuted(message, narrow, [{ ...eg.subscription, in_home_view: false }], [])).toBe(
      false,
    );
    expect(shouldBeMuted(message, narrow, [eg.subscription], [messageMute])).toBe(false);
    expect(shouldBeMuted(message, narrow, [], [messageMute])).toBe(false);
  });
});

describe('isMessageRead', () => {
  const message = eg.streamMessage();
  const flags = read =>
    read ? { ...eg.baseReduxState.flags, read: { [message.id]: true } } : eg.baseReduxState.flags;

  test('message with no flags entry is considered not read', () => {
    expect(isMessageRead(message, flags(false), [eg.subscription], [])).toEqual(false);
  });

  test('message with flags entry is considered read', () => {
    expect(isMessageRead(message, flags(true), [eg.subscription], [])).toEqual(true);
  });

  test('message in not-subscribed-to stream is considered read', () => {
    expect(isMessageRead(message, flags(false), [], [])).toEqual(true);
  });

  test('a message in a muted stream is considered read', () => {
    expect(
      isMessageRead(message, flags(false), [{ ...eg.subscription, in_home_view: false }], []),
    ).toEqual(true);
  });

  test('a message in a muted topic is considered read', () => {
    expect(
      isMessageRead(message, flags(false), [eg.subscription], [[eg.stream.name, message.subject]]),
    ).toEqual(true);
  });
});

describe('findFirstUnread', () => {
  test('returns first message not flagged "read"', () => {
    const messages = [
      { id: 0, display_recipient: 'testStream', type: 'stream' },
      { id: 1, display_recipient: 'testStream', type: 'stream' },
      { id: 2, display_recipient: 'testStream', type: 'stream' },
      { id: 3, display_recipient: 'testStream', type: 'stream' },
    ];
    const flags = {
      read: {
        0: true,
        1: true,
      },
    };
    const subscriptions = [{ name: 'testStream', in_home_view: true }];

    const result = findFirstUnread(messages, flags, subscriptions);

    expect(result).toEqual(messages[2]);
  });

  test('if all are read return undefined', () => {
    const messages = [{ id: 0 }, { id: 1 }, { id: 2 }];
    const flags = {
      read: {
        0: true,
        1: true,
        2: true,
      },
    };

    const result = findFirstUnread(messages, flags);

    expect(result).toEqual(undefined);
  });

  test('if no messages returns undefined', () => {
    const messages = [];

    const result = findFirstUnread(messages);

    expect(result).toEqual(undefined);
  });

  test('a message in muted stream or topic is considered read', () => {
    const messageInMutedStream = {
      id: 0,
      display_recipient: 'muted stream',
      subject: 'topic',
      type: 'stream',
    };
    const messageInMutedTopic = {
      id: 1,
      display_recipient: 'stream',
      subject: 'muted topic',
      type: 'stream',
    };
    const unreadMessage = { id: 2, display_recipient: 'stream', type: 'stream' };
    const flags = { read: {} };
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

    const result = findFirstUnread(messages, flags, subscriptions, mute);

    expect(result).toEqual(unreadMessage);
  });
});
