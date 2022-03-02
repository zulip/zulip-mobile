// @flow strict-local
import deepFreeze from 'deep-freeze';
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

  test('show "pin to top" if stream is not pinned to top', () => {
    const subscriptions = new Map([
      [eg.stream.stream_id, eg.makeSubscription({ pin_to_top: false })],
    ]);
    expect(titles({ ...eg.plusBackgroundData, subscriptions })).toContain('Pin to top');
  });

  test('show "unpin from top" if stream is pinned to top', () => {
    const subscriptions = new Map([
      [eg.stream.stream_id, eg.makeSubscription({ pin_to_top: true })],
    ]);
    expect(titles({ ...eg.plusBackgroundData, subscriptions })).toContain('Unpin from top');
  });

  test('show "enable notification" if push notifications are not enabled for stream', () => {
    const subscriptions = new Map([
      [eg.stream.stream_id, eg.makeSubscription({ push_notifications: false })],
    ]);
    expect(titles({ ...eg.plusBackgroundData, subscriptions })).toContain('Enable notifications');
  });

  test('show "disable notification" if push notifications are enabled for stream', () => {
    const subscriptions = new Map([
      [eg.stream.stream_id, eg.makeSubscription({ push_notifications: true })],
    ]);
    expect(titles({ ...eg.plusBackgroundData, subscriptions })).toContain('Disable notifications');
  });

  test('show "subscribe" option, if stream is not subscribed yet', () => {
    expect(titles({ ...eg.plusBackgroundData, subscriptions: new Map() })).toContain('Subscribe');
  });

  test('show "unsubscribe" option, if stream is subscribed', () => {
    expect(titles({ ...eg.plusBackgroundData })).toContain('Unsubscribe');
  });

  // TODO: test constructStreamActionButtons for showStreamSettings
});

describe('constructTopicActionButtons', () => {
  const streamMessage = eg.streamMessage();
  const topic = streamMessage.subject;
  const streamId = eg.stream.stream_id;

  const titles = backgroundData =>
    buttonTitles(constructTopicActionButtons({ backgroundData, streamId, topic }));

  test('show delete topic option if current user is an admin', () => {
    const ownUser = { ...eg.selfUser, is_admin: true };
    expect(titles({ ...eg.plusBackgroundData, ownUser })).toContain('Delete topic');
  });

  test('do not show delete topic option if current user is not an admin', () => {
    expect(titles({ ...eg.plusBackgroundData })).not.toContain('Delete topic');
  });

  test('show mark as read if topic is unread', () => {
    const unread = makeUnreadState(eg.plusReduxState, [streamMessage]);
    expect(titles({ ...eg.plusBackgroundData, unread })).toContain('Mark topic as read');
  });

  test('do not show mark as read if topic is read', () => {
    expect(titles({ ...eg.plusBackgroundData })).not.toContain('Mark topic as read');
  });

  test('show Unmute topic option if topic is muted', () => {
    const mute = makeMuteState([[eg.stream, topic]]);
    expect(titles({ ...eg.plusBackgroundData, mute })).toContain('Unmute topic');
  });

  test('show mute topic option if topic is not muted', () => {
    expect(titles({ ...eg.plusBackgroundData, mute: makeMuteState([]) })).toContain('Mute topic');
  });

  test('show Unmute stream option if stream is not in home view', () => {
    const subscriptions = new Map([
      [eg.stream.stream_id, eg.makeSubscription({ in_home_view: false })],
    ]);
    expect(titles({ ...eg.plusBackgroundData, subscriptions })).toContain('Unmute stream');
  });

  test('show mute stream option if stream is in home view', () => {
    const subscriptions = new Map([
      [eg.stream.stream_id, eg.makeSubscription({ in_home_view: true })],
    ]);
    expect(titles({ ...eg.plusBackgroundData, subscriptions })).toContain('Mute stream');
  });

  // TODO: test constructStreamActionButtons for showStreamSettings
});

// TODO: test constructPmConversationActionButtons

describe('constructMessageActionButtons', () => {
  const narrow = deepFreeze(HOME_NARROW);

  const titles = (backgroundData, message) =>
    buttonTitles(constructMessageActionButtons({ backgroundData, message, narrow }));

  // TODO: test constructMessageActionButtons on Outbox

  // TODO: test constructMessageActionButtons for addReaction

  test('show reactions option if message is has at least one reaction', () => {
    const message = eg.streamMessage({ reactions: [eg.unicodeEmojiReaction] });
    expect(titles(eg.plusBackgroundData, message)).toContain('See who reacted');
  });

  // TODO: test constructMessageActionButtons for hide showReactions

  // TODO: test constructMessageActionButtons for reply

  // TODO: test constructMessageActionButtons for copy and share

  // TODO: test constructMessageActionButtons for edit

  // TODO: test constructMessageActionButtons for delete

  test('show star message option if message is not starred', () => {
    const message = eg.streamMessage();
    const flags = { ...eg.plusBackgroundData.flags, starred: {} };
    expect(titles({ ...eg.plusBackgroundData, flags }, message)).toContain('Star message');
  });

  test('show unstar message option if message is starred', () => {
    const message = eg.streamMessage();
    const flags = { ...eg.plusBackgroundData.flags, starred: { [message.id]: true } };
    expect(titles({ ...eg.plusBackgroundData, flags }, message)).toContain('Unstar message');
  });
});
