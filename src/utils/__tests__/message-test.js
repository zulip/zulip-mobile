import { shouldBeMuted } from '../message';
import { HOME_NARROW, MENTIONED_NARROW, topicNarrow } from '../narrow';

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
      type: 'stream',
      display_recipient: 'stream',
    };

    const isMuted = shouldBeMuted(message, HOME_NARROW, []);

    expect(isMuted).toBe(true);
  });

  test('message in a stream is muted if the stream is muted', () => {
    const message = {
      type: 'stream',
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
      type: 'stream',
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

  test('mention narrow messages are never muted', () => {
    const message = {
      type: 'stream',
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
    const isMuted = shouldBeMuted(message, MENTIONED_NARROW, subscriptions, mutes);

    expect(isMuted).toBe(false);
  });
});
