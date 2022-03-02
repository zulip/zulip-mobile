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

describe('constructActionButtons', () => {
  const narrow = deepFreeze(HOME_NARROW);

  test('show star message option if message is not starred', () => {
    const message = eg.streamMessage();
    const flags = { ...eg.baseBackgroundData.flags, starred: {} };
    const buttons = constructMessageActionButtons({
      backgroundData: { ...eg.baseBackgroundData, flags },
      message,
      narrow,
    });
    expect(buttonTitles(buttons)).toContain('Star message');
  });

  test('show unstar message option if message is starred', () => {
    const message = eg.streamMessage();
    const flags = { ...eg.baseBackgroundData.flags, starred: { [message.id]: true } };
    const buttons = constructMessageActionButtons({
      backgroundData: { ...eg.baseBackgroundData, flags },
      message,
      narrow,
    });
    expect(buttonTitles(buttons)).toContain('Unstar message');
  });

  test('show reactions option if message is has at least one reaction', () => {
    const buttons = constructMessageActionButtons({
      backgroundData: eg.baseBackgroundData,
      message: eg.streamMessage({ reactions: [eg.unicodeEmojiReaction] }),
      narrow,
    });
    expect(buttonTitles(buttons)).toContain('See who reacted');
  });
});

describe('constructTopicActionButtons', () => {
  const stream = eg.makeStream();
  const streamMessage = eg.streamMessage({ stream });
  const topic = streamMessage.subject;
  const streamId = streamMessage.stream_id;
  const streams = deepFreeze(new Map([[stream.stream_id, stream]]));

  test('show mark as read if topic is unread', () => {
    const unread = makeUnreadState(eg.plusReduxState, [streamMessage]);
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.baseBackgroundData, streams, unread },
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Mark topic as read');
  });

  test('do not show mark as read if topic is read', () => {
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.baseBackgroundData, streams },
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).not.toContain('Mark topic as read');
  });

  test('show Unmute topic option if topic is muted', () => {
    const mute = makeMuteState([[stream, topic]]);
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.baseBackgroundData, streams, mute },
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Unmute topic');
  });

  test('show mute topic option if topic is not muted', () => {
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.baseBackgroundData, streams, mute: makeMuteState([]) },
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Mute topic');
  });

  test('show Unmute stream option if stream is not in home view', () => {
    const subscriptions = deepFreeze(
      new Map([[stream.stream_id, { ...eg.subscription, in_home_view: false, ...stream }]]),
    );
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.baseBackgroundData, subscriptions, streams },
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Unmute stream');
  });

  test('show mute stream option if stream is in home view', () => {
    const subscriptions = deepFreeze(
      new Map([[stream.stream_id, { ...eg.subscription, in_home_view: true, ...stream }]]),
    );
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.baseBackgroundData, subscriptions, streams },
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Mute stream');
  });

  test('show "subscribe" option, if stream is not subscribed yet', () => {
    const buttons = constructStreamActionButtons({
      backgroundData: { ...eg.baseBackgroundData, streams },
      streamId,
    });
    expect(buttonTitles(buttons)).toContain('Subscribe');
  });

  test('show "unsubscribe" option, if stream is subscribed', () => {
    const subscriptions = deepFreeze(new Map([[eg.subscription.stream_id, eg.subscription]]));
    const buttons = constructStreamActionButtons({
      backgroundData: { ...eg.baseBackgroundData, subscriptions },
      streamId: eg.subscription.stream_id,
    });
    expect(buttonTitles(buttons)).toContain('Unsubscribe');
  });

  test('show "enable notification" if push notifications are not enabled for stream', () => {
    const subscriptions = deepFreeze(
      new Map([[stream.stream_id, { ...eg.subscription, push_notifications: false, ...stream }]]),
    );
    const buttons = constructStreamActionButtons({
      backgroundData: { ...eg.baseBackgroundData, subscriptions },
      streamId,
    });
    expect(buttonTitles(buttons)).toContain('Enable notifications');
  });

  test('show "disable notification" if push notifications are enabled for stream', () => {
    const subscriptions = deepFreeze(
      new Map([[stream.stream_id, { ...eg.subscription, push_notifications: true, ...stream }]]),
    );
    const buttons = constructStreamActionButtons({
      backgroundData: { ...eg.baseBackgroundData, subscriptions },
      streamId,
    });
    expect(buttonTitles(buttons)).toContain('Disable notifications');
  });

  test('show "pin to top" if stream is not pinned to top', () => {
    const subscriptions = deepFreeze(
      new Map([[stream.stream_id, { ...eg.subscription, pin_to_top: false, ...stream }]]),
    );
    const buttons = constructStreamActionButtons({
      backgroundData: { ...eg.baseBackgroundData, subscriptions },
      streamId,
    });
    expect(buttonTitles(buttons)).toContain('Pin to top');
  });

  test('show "unpin from top" if stream is pinned to top', () => {
    const subscriptions = deepFreeze(
      new Map([[stream.stream_id, { ...eg.subscription, pin_to_top: true, ...stream }]]),
    );
    const buttons = constructStreamActionButtons({
      backgroundData: { ...eg.baseBackgroundData, subscriptions },
      streamId,
    });
    expect(buttonTitles(buttons)).toContain('Unpin from top');
  });

  test('show delete topic option if current user is an admin', () => {
    const ownUser = { ...eg.selfUser, is_admin: true };
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.baseBackgroundData, ownUser, streams },
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Delete topic');
  });

  test('do not show delete topic option if current user is not an admin', () => {
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.baseBackgroundData, streams },
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).not.toContain('Delete topic');
  });
});
