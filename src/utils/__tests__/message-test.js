/* @flow strict-local */
import { shouldBeMuted } from '../message';
import { HOME_NARROW, MENTIONED_NARROW, streamNarrow, topicNarrow } from '../narrow';
import * as eg from '../../__tests__/lib/exampleData';

describe('shouldBeMuted', () => {
  const stream = eg.makeStream({
    name: 'stream',
  });

  const subscription = eg.makeSubscription({ stream });
  const mutedSubscription = eg.makeSubscription({ stream, in_home_view: false });

  const message = eg.streamMessage({
    stream,
    subject: 'some topic',
  });

  describe('HOME_NARROW', () => {
    test('private messages are never muted', () => {
      const pmMessage = eg.pmMessage();
      expect(shouldBeMuted(pmMessage, HOME_NARROW, [], [])).toBe(false);
    });

    test('message in a stream is not muted if stream and topic not muted', () => {
      expect(shouldBeMuted(message, HOME_NARROW, [subscription], [])).toBe(false);
    });

    test('message in a stream is muted if stream is not in subscriptions', () => {
      expect(shouldBeMuted(message, HOME_NARROW, [], [])).toBe(true);
    });

    test('message in a stream is muted if the stream is muted', () => {
      expect(shouldBeMuted(message, HOME_NARROW, [mutedSubscription], [])).toBe(true);
    });

    test('message in a stream is muted if the topic is muted and topic matches', () => {
      const mutes = [['stream', 'some topic']];
      expect(shouldBeMuted(message, HOME_NARROW, [subscription], mutes)).toBe(true);
    });
  });

  describe('stream narrow', () => {
    const narrow = streamNarrow('stream');

    test('message not muted even if stream not subscribed', () => {
      expect(shouldBeMuted(message, narrow, [], [])).toBe(false);
    });

    test('message not muted even if stream is muted', () => {
      expect(shouldBeMuted(message, narrow, [mutedSubscription], [])).toBe(false);
    });

    test('message muted if topic is muted', () => {
      const mutes = [['stream', 'some topic']];
      expect(shouldBeMuted(message, narrow, [subscription], mutes)).toBe(true);
    });
  });

  describe('topic narrow', () => {
    const narrow = topicNarrow('stream', 'some topic');

    test('message not muted even if stream not subscribed', () => {
      expect(shouldBeMuted(message, narrow, [], [])).toBe(false);
    });

    test('message not muted even if stream is muted', () => {
      expect(shouldBeMuted(message, narrow, [mutedSubscription], [])).toBe(false);
    });

    test('message not muted even if topic is muted', () => {
      const mutes = [['stream', 'some topic']];
      expect(shouldBeMuted(message, narrow, [subscription], mutes)).toBe(false);
    });
  });

  describe('@-mentions narrow', () => {
    const narrow = MENTIONED_NARROW;

    test('message not muted even if stream not subscribed', () => {
      expect(shouldBeMuted(message, narrow, [], [])).toBe(false);
    });

    test('message not muted even if stream is muted', () => {
      expect(shouldBeMuted(message, narrow, [mutedSubscription], [])).toBe(false);
    });

    test('message not muted even if topic is muted', () => {
      const mutes = [['stream', 'some topic']];
      expect(shouldBeMuted(message, narrow, [subscription], mutes)).toBe(false);
    });
  });
});
