// @flow strict-local
import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import { constructMessageActionButtons, constructHeaderActionButtons } from '../messageActionSheet';

const baseBackgroundData = deepFreeze({
  alertWords: [],
  allImageEmojiById: eg.action.realm_init.data.realm_emoji,
  auth: eg.selfAuth,
  debug: {
    doNotMarkMessagesAsRead: false,
  },
  flags: {
    read: {},
    starred: {
      // Key has to be number according to the type declaration. $FlowFixMe.
      1: true,
      // Key has to be number according to the type declaration. $FlowFixMe.
      2: true,
    },
    collapsed: {},
    mentioned: {},
    wildcard_mentioned: {},
    summarize_in_home: {},
    summarize_in_stream: {},
    force_expand: {},
    force_collapse: {},
    has_alert_word: {},
    historical: {},
    is_me_message: {},
  },
  mute: [],
  ownUser: eg.selfUser,
  subscriptions: [
    {
      ...eg.makeStream(),
      color: '#ffffff',
      in_home_view: false,
      pin_to_top: false,
      audible_notifications: false,
      desktop_notifications: false,
      email_address: 'stream@email.com',
      is_old_stream: false,
      push_notifications: true,
      stream_weekly_traffic: 2,
    },
  ],
  theme: 'default',
  twentyFourHourTime: false,
});

describe('constructActionButtons', () => {
  const narrow = deepFreeze([]);

  test('show star message option if message is not starred', () => {
    const message = eg.streamMessage({ id: 3 });

    const buttons = constructMessageActionButtons({
      backgroundData: baseBackgroundData,
      message,
      narrow,
    });

    expect(buttons).toContain('starMessage');
  });

  test('show unstar message option if message is starred', () => {
    const message = eg.streamMessage({ id: 1 });

    const buttons = constructMessageActionButtons({
      backgroundData: baseBackgroundData,
      message,
      narrow,
    });

    expect(buttons).toContain('unstarMessage');
  });

  test('show reactions option if message is has at least one reaction', () => {
    const message = eg.streamMessage({
      reactions: [
        {
          user_id: 12345,
          emoji_name: 'haha',
          reaction_type: 'unicode_emoji',
          emoji_code: '',
        },
      ],
    });

    const buttons = constructMessageActionButtons({
      backgroundData: baseBackgroundData,
      message,
      narrow,
    });

    expect(buttons).toContain('showReactions');
  });
});

describe('constructHeaderActionButtons', () => {
  const narrow = deepFreeze([]);

  test('show Unmute topic option if topic is muted', () => {
    const mute = deepFreeze([['electron issues', 'issue #556']]);

    const backgroundData = deepFreeze({ ...baseBackgroundData, mute });

    const message = eg.streamMessage({
      display_recipient: 'electron issues',
      subject: 'issue #556',
    });

    const buttons = constructHeaderActionButtons({
      backgroundData,
      message,
      narrow,
    });

    expect(buttons).toContain('unmuteTopic');
  });

  test('show mute topic option if topic is not muted', () => {
    const mute = deepFreeze([]);

    const backgroundData = deepFreeze({ ...baseBackgroundData, mute });

    const buttons = constructHeaderActionButtons({
      backgroundData,
      message: eg.streamMessage(),
      narrow,
    });

    expect(buttons).toContain('muteTopic');
  });

  test('show Unmute stream option if stream is not in home view', () => {
    const message = eg.streamMessage({
      display_recipient: 'electron issues',
    });

    const subscriptions = deepFreeze([
      {
        ...baseBackgroundData.subscriptions[0],
        name: 'electron issues',
        in_home_view: false,
      },
    ]);

    const backgroundData = deepFreeze({
      ...baseBackgroundData,
      subscriptions,
    });

    const buttons = constructHeaderActionButtons({
      backgroundData,
      message,
      narrow,
    });

    expect(buttons).toContain('unmuteStream');
  });

  test('show mute stream option if stream is in home view', () => {
    const message = eg.streamMessage({
      display_recipient: 'electron issues',
    });

    const subscriptions = deepFreeze([
      {
        ...baseBackgroundData.subscriptions[0],
        name: 'electron issues',
        in_home_view: true,
      },
    ]);

    const backgroundData = deepFreeze({
      ...baseBackgroundData,
      subscriptions,
    });

    const buttons = constructHeaderActionButtons({
      backgroundData,
      message,
      narrow,
    });

    expect(buttons).toContain('muteStream');
  });

  test('show delete topic option if current user is an admin', () => {
    const backgroundData = deepFreeze({
      ...baseBackgroundData,
      ownUser: {
        ...baseBackgroundData.ownUser,
        is_admin: true,
      },
    });

    const buttons = constructHeaderActionButtons({
      backgroundData,
      message: eg.streamMessage(),
      narrow,
    });

    expect(buttons).toContain('deleteTopic');
  });

  test('do not show delete topic option if current user is not an admin', () => {
    const buttons = constructHeaderActionButtons({
      backgroundData: baseBackgroundData,
      message: eg.streamMessage(),
      narrow,
    });

    expect(buttons).not.toContain('deleteTopic');
  });
});
