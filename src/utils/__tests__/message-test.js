/* @flow strict-local */
import { shouldBeMuted, isMessageRead, findFirstUnread } from '../message';
import { HOME_NARROW, topicNarrow } from '../narrow';
import { eg } from '../../__tests__/exampleData';

describe('shouldBeMuted', () => {
  test('private messages are never muted', () => {
    expect(shouldBeMuted(eg.pmMessage(), HOME_NARROW, [])).toBe(false);
  });

  test('messages when narrowed to a topic are never muted', () => {
    const message = eg.streamMessage();
    const narrow = topicNarrow(eg.stream.name, message.subject);
    const mutes = [[eg.stream.name, message.subject]];
    expect(shouldBeMuted(message, narrow, [], mutes)).toBe(false);
  });

  test('message in a stream is muted if stream is not in mute list', () => {
    const message = eg.streamMessage();
    expect(shouldBeMuted(message, HOME_NARROW, [])).toBe(true);
  });

  test('message in a stream is muted if the stream is muted', () => {
    expect(
      shouldBeMuted(
        eg.streamMessage(),
        HOME_NARROW,
        [{ ...eg.subscription, in_home_view: false }],
        [],
      ),
    ).toBe(true);
  });

  test('message in a stream is muted if the topic is muted and topic matches', () => {
    const message = eg.streamMessage();
    expect(
      shouldBeMuted(
        message,
        HOME_NARROW,
        [{ ...eg.subscription, in_home_view: true }],
        [[eg.stream.name, message.subject]],
      ),
    ).toBe(true);
  });
});

describe('isMessageRead', () => {
  test('message with no flags entry is considered not read', () => {
    const message = eg.streamMessage();
    const flags = eg.baseReduxState.flags;
    const subscriptions = [eg.subscription];
    expect(isMessageRead(message, flags, subscriptions, [])).toEqual(false);
  });

  test('message with flags entry is considered read', () => {
    const message = eg.streamMessage();
    const flags = { ...eg.baseReduxState.flags, read: { [123]: true } }; // eslint-disable-line no-useless-computed-key
    expect(isMessageRead(message, flags, [], [])).toEqual(true);
  });

  test('a message in a muted stream is considered read', () => {
    const message = eg.streamMessage();
    const flags = eg.baseReduxState.flags;
    const subscriptions = [{ ...eg.subscription, in_home_view: false }];
    expect(isMessageRead(message, flags, subscriptions, [])).toEqual(true);
  });

  test('a message in a muted topic is considered read', () => {
    const message = eg.streamMessage();
    const flags = eg.baseReduxState.flags;
    const subscriptions = [eg.subscription];
    const mute = [[eg.stream.name, message.subject]];
    expect(isMessageRead(message, flags, subscriptions, mute)).toEqual(true);
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
