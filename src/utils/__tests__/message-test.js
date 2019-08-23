/* @flow strict-local */

import { shouldBeMuted, isMessageRead, findFirstUnread } from '../message';
import { HOME_NARROW, topicNarrow } from '../narrow';
import * as eg from '../../__tests__/exampleData';

describe('shouldBeMuted', () => {
  test('private messages are never muted', () => {
    const message = eg.pmMessage();

    const isMuted = shouldBeMuted(message, HOME_NARROW, eg.flagsState());

    expect(isMuted).toBe(false);
  });

  test('message in a muted stream is un-muted if it mentions the current user', () => {
    const message = eg.streamMessage();
    const flags = eg.flagsState({
      mentioned: {
        [message.id]: true,
      },
    });
    const mutes = [[message.display_recipient, message.subject]];

    const isMuted = shouldBeMuted(message, HOME_NARROW, flags, [], mutes);

    expect(isMuted).toBe(false);
  });

  test('messages when narrowed to a topic are never muted', () => {
    const message = eg.streamMessage({
      display_recipient: 'stream',
      subject: 'some topic',
    });
    const narrow = topicNarrow('stream', 'some topic');
    const mutes = [['stream', 'some topic']];

    const isMuted = shouldBeMuted(message, narrow, eg.flagsState(), [], mutes);

    expect(isMuted).toBe(false);
  });

  test('message in a stream is muted if stream is not in mute list', () => {
    const message = eg.streamMessage();

    const isMuted = shouldBeMuted(message, HOME_NARROW, eg.flagsState());

    expect(isMuted).toBe(true);
  });

  test('message in a stream is muted if the stream is muted', () => {
    const message = eg.streamMessage();
    const subscriptions = [
      eg.subscription({
        name: message.display_recipient,
        in_home_view: false,
      }),
    ];
    const isMuted = shouldBeMuted(message, HOME_NARROW, eg.flagsState(), subscriptions);

    expect(isMuted).toBe(true);
  });

  test('message in a stream is muted if the topic is muted and topic matches', () => {
    const message = eg.streamMessage();
    const subscriptions = [
      eg.subscription({
        name: message.display_recipient,
        in_home_view: true,
      }),
    ];
    const mutes = [[message.display_recipient, message.subject]];
    const isMuted = shouldBeMuted(message, HOME_NARROW, eg.flagsState(), subscriptions, mutes);

    expect(isMuted).toBe(true);
  });
});

describe('isMessageRead', () => {
  test('message with no flags entry is considered not read', () => {
    const message = eg.streamMessage();
    const subscriptions = [
      eg.subscription({ name: message.display_recipient, in_home_view: true }),
    ];

    const result = isMessageRead(message, eg.flagsState(), subscriptions, []);

    expect(result).toEqual(false);
  });

  test('message with flags entry is considered read', () => {
    const message = eg.streamMessage();
    const flags = eg.flagsState({ read: { [message.id]: true } });

    const result = isMessageRead(message, flags, [], []);

    expect(result).toEqual(true);
  });

  test('a message in a muted stream is considered read', () => {
    const message = eg.streamMessage();
    const subscriptions = [
      eg.subscription({
        name: message.display_recipient,
        in_home_view: false,
      }),
    ];

    const result = isMessageRead(message, eg.flagsState(), subscriptions, []);

    expect(result).toEqual(true);
  });

  test('a message in a muted topic is considered read', () => {
    const message = eg.streamMessage();
    const subscriptions = [
      eg.subscription({
        name: 'stream',
        in_home_view: false,
      }),
    ];
    const mute = [['stream', 'muted topic']];

    const result = isMessageRead(message, eg.flagsState(), subscriptions, mute);

    expect(result).toEqual(true);
  });
});

describe('findFirstUnread', () => {
  test('returns first message not flagged "read"', () => {
    const messages = [
      eg.streamMessage({ id: 0 }),
      eg.streamMessage({ id: 1 }),
      eg.streamMessage({ id: 2 }),
      eg.streamMessage({ id: 3 }),
    ];
    const flags = eg.flagsState({
      read: {
        [messages[0].id]: true,
        [messages[1].id]: true,
      },
    });
    const subscriptions = [
      eg.subscription({ name: messages[0].display_recipient, in_home_view: true }),
    ];

    const result = findFirstUnread(messages, flags, subscriptions, []);

    expect(result).toEqual(messages[2]);
  });

  test('if all are read return undefined', () => {
    const messages = [
      eg.streamMessage({ id: 0 }),
      eg.streamMessage({ id: 1 }),
      eg.streamMessage({ id: 2 }),
    ];
    const flags = eg.flagsState({
      read: {
        [messages[0].id]: true,
        [messages[1].id]: true,
        [messages[2].id]: true,
      },
    });

    const result = findFirstUnread(messages, flags, [], []);

    expect(result).toEqual(undefined);
  });

  test('if no messages returns undefined', () => {
    const messages = [];

    const result = findFirstUnread(messages, eg.flagsState(), [], []);

    expect(result).toEqual(undefined);
  });

  test('a message in muted stream or topic is considered read', () => {
    const messageInMutedStream = eg.streamMessage({
      id: 0,
      display_recipient: 'muted stream',
      subject: 'topic',
    });
    const messageInMutedTopic = eg.streamMessage({
      id: 1,
      display_recipient: 'stream',
      subject: 'muted topic',
    });
    const unreadMessage = eg.streamMessage({ id: 2, display_recipient: 'stream' });
    const messages = [messageInMutedStream, messageInMutedTopic, unreadMessage];
    const subscriptions = [
      eg.subscription({
        name: 'stream',
        in_home_view: true,
      }),
      eg.subscription({
        name: 'stream',
        in_home_view: true,
      }),
    ];
    const mute = [['stream', 'muted topic']];

    const result = findFirstUnread(messages, eg.flagsState(), subscriptions, mute);

    expect(result).toEqual(unreadMessage);
  });
});
