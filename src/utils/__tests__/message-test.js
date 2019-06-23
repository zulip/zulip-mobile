import { shouldBeMuted, isMessageRead, findFirstUnread, getLinkToMessage } from '../message';
import { HOME_NARROW, topicNarrow } from '../narrow';

describe('shouldBeMuted', () => {
  test('private messages are never muted', () => {
    const message = {
      display_recipient: [],
      type: 'private',
    };

    const isMuted = shouldBeMuted(message, HOME_NARROW, []);

    expect(isMuted).toBe(false);
  });

  test('messages when narrowed to a topic are never muted', () => {
    const message = {
      display_recipient: 'stream',
      subject: 'some topic',
    };
    const narrow = topicNarrow('some topic');
    const mutes = [['stream', 'some topic']];

    const isMuted = shouldBeMuted(message, narrow, [], mutes);

    expect(isMuted).toBe(false);
  });

  test('message in a stream is muted if stream is not in mute list', () => {
    const message = {
      display_recipient: 'stream',
    };

    const isMuted = shouldBeMuted(message, HOME_NARROW, []);

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
    const isMuted = shouldBeMuted(message, HOME_NARROW, subscriptions);

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
    const isMuted = shouldBeMuted(message, HOME_NARROW, subscriptions, mutes);

    expect(isMuted).toBe(true);
  });
});

describe('isMessageRead', () => {
  test('message with no flags entry is considered not read', () => {
    const message = { id: 0, display_recipient: 'testStream', type: 'stream' };
    const flags = { read: {} };
    const subscriptions = [{ name: 'testStream', in_home_view: true }];

    const result = isMessageRead(message, flags, subscriptions);

    expect(result).toEqual(false);
  });

  test('message with flags entry is considered read', () => {
    const message = { id: 123 };
    const flags = { read: { 123: true } };

    const result = isMessageRead(message, flags);

    expect(result).toEqual(true);
  });

  test('a message in a muted stream is considered read', () => {
    const message = {
      id: 0,
      display_recipient: 'muted stream',
      subject: 'topic',
    };
    const flags = { read: {} };
    const subscriptions = [
      {
        name: 'muted stream',
        in_home_view: false,
      },
    ];

    const result = isMessageRead(message, flags, subscriptions);

    expect(result).toEqual(true);
  });

  test('a message in a muted topic is considered read', () => {
    const message = {
      id: 0,
      display_recipient: 'stream',
      subject: 'muted topic',
    };
    const flags = { read: {} };
    const subscriptions = [
      {
        name: 'stream',
        in_home_view: false,
      },
    ];
    const mute = [['stream', 'muted topic']];

    const result = isMessageRead(message, flags, subscriptions, mute);

    expect(result).toEqual(true);
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

describe('getLinkToMessage', () => {
  test('should return a stream link if message link copied from stream', () => {
    const realm = 'https://zulip.com';
    const message = {
      display_recipient: 'stream',
      stream_id: 12345,
      subject: 'exampleTopic',
      id: 2345,
      type: 'stream',
    };

    const result = getLinkToMessage(realm, message);
    const expectedResult =
      'https://zulip.com/#narrow/stream/12345-stream/topic/exampleTopic/near/2345';

    expect(result).toEqual(expectedResult);
  });

  test('should return a group link if message link copied from pm with > 3 people', () => {
    const realm = 'https://zulip.com';
    const message = {
      display_recipient: [{ id: 11111 }, { id: 22222 }, { id: 33333 }, { id: 44444 }],
      id: 2345,
      type: 'private',
    };

    const result = getLinkToMessage(realm, message);
    const expectedResult =
      'https://zulip.com/#narrow/pm-with/11111,22222,33333,44444-group/near/2345';

    expect(result).toEqual(expectedResult);
  });

  test('should return pm link for message link copied from pm with >= 3 people', () => {
    const realm = 'https://zulip.com';
    const message = {
      display_recipient: [{ id: 11111 }, { id: 22222 }, { id: 33333 }],
      id: 2345,
      type: 'private',
    };

    const result = getLinkToMessage(realm, message);
    const expectedResult = 'https://zulip.com/#narrow/pm-with/11111,22222,33333-group/near/2345';

    expect(result).toEqual(expectedResult);
  });
});
