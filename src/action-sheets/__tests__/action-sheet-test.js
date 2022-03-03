// @flow strict-local
import deepFreeze from 'deep-freeze';
import * as resolved_topic from '@zulip/shared/js/resolved_topic';

import { HOME_NARROW } from '../../utils/narrow';
import * as eg from '../../__tests__/lib/exampleData';
import {
  constructMessageActionButtons,
  constructTopicActionButtons,
  constructStreamActionButtons,
} from '../index';
import { makeUnreadState } from '../../unread/__tests__/unread-testlib';
import { makeMuteState } from '../../mute/__tests__/mute-testlib';

const buttonTitles = buttons => buttons.map(button => button.title);

describe('constructStreamActionButtons', () => {
  const streamId = eg.stream.stream_id;

  const titles = backgroundData =>
    buttonTitles(constructStreamActionButtons({ backgroundData, streamId }));

  // TODO: test constructStreamActionButtons for mute/unmute

  // TODO: test constructStreamActionButtons for copyLinkToStream

  test('show pinToTop', () => {
    const subscriptions = new Map([
      [eg.stream.stream_id, eg.makeSubscription({ pin_to_top: false })],
    ]);
    expect(titles({ ...eg.plusBackgroundData, subscriptions })).toContain('Pin to top');
  });

  test('show unpinFromTop', () => {
    const subscriptions = new Map([
      [eg.stream.stream_id, eg.makeSubscription({ pin_to_top: true })],
    ]);
    expect(titles({ ...eg.plusBackgroundData, subscriptions })).toContain('Unpin from top');
  });

  test('show enableNotifications', () => {
    const subscriptions = new Map([
      [eg.stream.stream_id, eg.makeSubscription({ push_notifications: false })],
    ]);
    expect(titles({ ...eg.plusBackgroundData, subscriptions })).toContain('Enable notifications');
  });

  test('show disableNotifications', () => {
    const subscriptions = new Map([
      [eg.stream.stream_id, eg.makeSubscription({ push_notifications: true })],
    ]);
    expect(titles({ ...eg.plusBackgroundData, subscriptions })).toContain('Disable notifications');
  });

  test('show subscribe', () => {
    expect(titles({ ...eg.plusBackgroundData, subscriptions: new Map() })).toContain('Subscribe');
  });

  test('show unsubscribe', () => {
    expect(titles({ ...eg.plusBackgroundData })).toContain('Unsubscribe');
  });

  // TODO: test constructStreamActionButtons for showStreamSettings
});

describe('constructTopicActionButtons', () => {
  const streamMessage = eg.streamMessage();
  const topic = streamMessage.subject;
  const streamId = eg.stream.stream_id;

  const titles = (backgroundData, topic_) =>
    buttonTitles(constructTopicActionButtons({ backgroundData, streamId, topic: topic_ ?? topic }));

  test('show markTopicAsRead', () => {
    const unread = makeUnreadState(eg.plusReduxState, [streamMessage]);
    expect(titles({ ...eg.plusBackgroundData, unread })).toContain('Mark topic as read');
  });

  test('hide markTopicAsRead', () => {
    const unread = makeUnreadState(eg.plusReduxState, []);
    expect(titles({ ...eg.plusBackgroundData, unread })).not.toContain('Mark topic as read');
  });

  test('show unmuteTopic', () => {
    const mute = makeMuteState([[eg.stream, topic]]);
    expect(titles({ ...eg.plusBackgroundData, mute })).toContain('Unmute topic');
  });

  test('show muteTopic', () => {
    const mute = makeMuteState([]);
    expect(titles({ ...eg.plusBackgroundData, mute })).toContain('Mute topic');
  });

  test('show resolveTopic', () => {
    expect(titles({ ...eg.plusBackgroundData })).toContain('Resolve topic');
  });

  test('show unresolveTopic', () => {
    expect(titles({ ...eg.plusBackgroundData }, resolved_topic.resolve_name(topic))).toContain(
      'Unresolve topic',
    );
  });

  test('show deleteTopic', () => {
    const ownUser = { ...eg.selfUser, is_admin: true };
    expect(titles({ ...eg.plusBackgroundData, ownUser })).toContain('Delete topic');
  });

  test('hide deleteTopic', () => {
    const ownUser = { ...eg.selfUser, is_admin: false };
    expect(titles({ ...eg.plusBackgroundData, ownUser })).not.toContain('Delete topic');
  });

  test('show unmuteStream', () => {
    const subscriptions = new Map([
      [eg.stream.stream_id, eg.makeSubscription({ in_home_view: false })],
    ]);
    expect(titles({ ...eg.plusBackgroundData, subscriptions })).toContain('Unmute stream');
  });

  test('show muteStream', () => {
    const subscriptions = new Map([
      [eg.stream.stream_id, eg.makeSubscription({ in_home_view: true })],
    ]);
    expect(titles({ ...eg.plusBackgroundData, subscriptions })).toContain('Mute stream');
  });

  // TODO: test constructTopicActionButtons for copyLinkToTopic

  // TODO: test constructTopicActionButtons for showStreamSettings
});

// TODO: test constructPmConversationActionButtons

describe('constructMessageActionButtons', () => {
  const narrow = deepFreeze(HOME_NARROW);

  const titles = (backgroundData, message) =>
    buttonTitles(constructMessageActionButtons({ backgroundData, message, narrow }));

  // TODO: test constructMessageActionButtons on Outbox

  // TODO: test constructMessageActionButtons for addReaction

  test('show showReactions', () => {
    const message = eg.streamMessage({ reactions: [eg.unicodeEmojiReaction] });
    expect(titles(eg.plusBackgroundData, message)).toContain('See who reacted');
  });

  // TODO: test constructMessageActionButtons for hide showReactions

  // TODO: test constructMessageActionButtons for reply

  // TODO: test constructMessageActionButtons for copy and share

  // TODO: test constructMessageActionButtons for edit

  // TODO: test constructMessageActionButtons for delete

  test('show starMessage', () => {
    const message = eg.streamMessage();
    const flags = { ...eg.plusBackgroundData.flags, starred: {} };
    expect(titles({ ...eg.plusBackgroundData, flags }, message)).toContain('Star message');
  });

  test('show unstarMessage', () => {
    const message = eg.streamMessage();
    const flags = { ...eg.plusBackgroundData.flags, starred: { [message.id]: true } };
    expect(titles({ ...eg.plusBackgroundData, flags }, message)).toContain('Unstar message');
  });
});
