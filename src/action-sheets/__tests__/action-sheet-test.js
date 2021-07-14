// @flow strict-local
import deepFreeze from 'deep-freeze';
import { HOME_NARROW } from '../../utils/narrow';

import * as eg from '../../__tests__/lib/exampleData';
import { constructMessageActionButtons, constructTopicActionButtons } from '../index';
import { reducer } from '../../unread/unreadModel';
import { initialState } from '../../unread/__tests__/unread-testlib';

const buttonTitles = buttons => buttons.map(button => button.title);

describe('constructActionButtons', () => {
  const narrow = deepFreeze(HOME_NARROW);

  test('show star message option if message is not starred', () => {
    const message = eg.streamMessage();
    const flags = { ...eg.backgroundData.flags, starred: {} };
    const buttons = constructMessageActionButtons({
      backgroundData: { ...eg.backgroundData, flags },
      message,
      narrow,
    });
    expect(buttonTitles(buttons)).toContain('Star message');
  });

  test('show unstar message option if message is starred', () => {
    const message = eg.streamMessage();
    const flags = { ...eg.backgroundData.flags, starred: { [message.id]: true } };
    const buttons = constructMessageActionButtons({
      backgroundData: { ...eg.backgroundData, flags },
      message,
      narrow,
    });
    expect(buttonTitles(buttons)).toContain('Unstar message');
  });

  test('show reactions option if message is has at least one reaction', () => {
    const buttons = constructMessageActionButtons({
      backgroundData: eg.backgroundData,
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

  const baseState = (() => {
    const r = (state, action) => reducer(state, action, eg.plusReduxState);
    let state = initialState;
    state = r(state, eg.mkActionEventNewMessage(streamMessage));
    return state;
  })();

  test('show mark as read if topic is unread', () => {
    const unread = baseState;
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.backgroundData, streams, unread },
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Mark topic as read');
  });

  test('do not show mark as read if topic is read', () => {
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.backgroundData, streams },
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).not.toContain('Mark topic as read');
  });

  test('show Unmute topic option if topic is muted', () => {
    const mute = deepFreeze([[stream.name, topic]]);
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.backgroundData, streams, mute },
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Unmute topic');
  });

  test('show mute topic option if topic is not muted', () => {
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.backgroundData, streams, mute: [] },
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Mute topic');
  });

  test('show Unmute stream option if stream is not in home view', () => {
    const subscriptions = [{ ...eg.subscription, in_home_view: false, ...stream }];
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.backgroundData, subscriptions, streams },
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Unmute stream');
  });

  test('show mute stream option if stream is in home view', () => {
    const subscriptions = [{ ...eg.subscription, in_home_view: true, ...stream }];
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.backgroundData, subscriptions, streams },
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Mute stream');
  });

  test('show delete topic option if current user is an admin', () => {
    const ownUser = { ...eg.selfUser, is_admin: true };
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.backgroundData, ownUser, streams },
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).toContain('Delete topic');
  });

  test('do not show delete topic option if current user is not an admin', () => {
    const buttons = constructTopicActionButtons({
      backgroundData: { ...eg.backgroundData, streams },
      streamId,
      topic,
    });
    expect(buttonTitles(buttons)).not.toContain('Delete topic');
  });
});
