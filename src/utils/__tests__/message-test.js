/* @flow strict-local */
import { shouldBeMuted } from '../message';
import { HOME_NARROW, MENTIONED_NARROW, topicNarrow } from '../narrow';
import * as eg from '../../__tests__/lib/exampleData';

describe('shouldBeMuted', () => {
  const stream = eg.makeStream({
    name: 'stream',
  });

  const subscription = eg.makeSubscription({ stream });

  const message = eg.streamMessage({
    stream,
    subject: 'some topic',
  });

  test('private messages are never muted', () => {
    const pmMessage = eg.pmMessage();
    const isMuted = shouldBeMuted(pmMessage, HOME_NARROW, []);

    expect(isMuted).toBe(false);
  });

  test('messages when narrowed to a topic are never muted', () => {
    const narrow = topicNarrow('stream', 'some topic');
    const mutes = [['stream', 'some topic']];

    const isMuted = shouldBeMuted(message, narrow, [], mutes);

    expect(isMuted).toBe(false);
  });

  test('message in a stream is muted if stream is not in mute list', () => {
    const isMuted = shouldBeMuted(message, HOME_NARROW, []);

    expect(isMuted).toBe(true);
  });

  test('message in a stream is muted if the stream is muted', () => {
    const mutedSubscription = eg.makeSubscription({
      stream,
      in_home_view: false,
    });

    const isMuted = shouldBeMuted(message, HOME_NARROW, [mutedSubscription]);

    expect(isMuted).toBe(true);
  });

  test('message in a stream is muted if the topic is muted and topic matches', () => {
    const mutes = [['stream', 'some topic']];
    const isMuted = shouldBeMuted(message, HOME_NARROW, [subscription], mutes);

    expect(isMuted).toBe(true);
  });

  test('mention narrow messages are never muted', () => {
    const mutes = [['stream', 'some topic']];
    const isMuted = shouldBeMuted(message, MENTIONED_NARROW, [subscription], mutes);

    expect(isMuted).toBe(false);
  });
});
