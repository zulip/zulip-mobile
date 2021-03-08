// @flow strict-local
import deepFreeze from 'deep-freeze';
import { HOME_NARROW } from '../../utils/narrow';

import * as eg from '../../__tests__/lib/exampleData';
import {
  constructMessageActionButtons,
  constructHeaderActionButtons,
  messageFilter,
} from '../messageActionSheet';

const baseBackgroundData = deepFreeze({
  alertWords: [],
  allImageEmojiById: eg.action.realm_init.data.realm_emoji,
  auth: eg.selfAuth,
  debug: eg.baseReduxState.session.debug,
  flags: eg.baseReduxState.flags,
  mute: [],
  ownUser: eg.selfUser,
  subscriptions: [],
  theme: 'default',
  twentyFourHourTime: false,
});

describe('constructActionButtons', () => {
  const narrow = deepFreeze(HOME_NARROW);

  test('show star message option if message is not starred', () => {
    const message = eg.streamMessage();
    const flags = { ...baseBackgroundData.flags, starred: {} };
    const buttons = constructMessageActionButtons({
      backgroundData: { ...baseBackgroundData, flags },
      message,
      narrow,
    });
    expect(buttons).toContain('starMessage');
  });

  test('show unstar message option if message is starred', () => {
    const message = eg.streamMessage();
    const flags = { ...baseBackgroundData.flags, starred: { [message.id]: true } };
    const buttons = constructMessageActionButtons({
      backgroundData: { ...baseBackgroundData, flags },
      message,
      narrow,
    });
    expect(buttons).toContain('unstarMessage');
  });

  test('show reactions option if message is has at least one reaction', () => {
    const buttons = constructMessageActionButtons({
      backgroundData: baseBackgroundData,
      message: eg.streamMessage({ reactions: [eg.unicodeEmojiReaction] }),
      narrow,
    });
    expect(buttons).toContain('showReactions');
  });
});

describe('constructHeaderActionButtons', () => {
  const narrow = deepFreeze(HOME_NARROW);

  test('show Unmute topic option if topic is muted', () => {
    const mute = deepFreeze([['electron issues', 'issue #556']]);
    const message = eg.streamMessage({
      display_recipient: 'electron issues',
      subject: 'issue #556',
    });
    const buttons = constructHeaderActionButtons({
      backgroundData: { ...baseBackgroundData, mute },
      message,
      narrow,
    });
    expect(buttons).toContain('unmuteTopic');
  });

  test('show mute topic option if topic is not muted', () => {
    const buttons = constructHeaderActionButtons({
      backgroundData: { ...baseBackgroundData, mute: [] },
      message: eg.streamMessage(),
      narrow,
    });
    expect(buttons).toContain('muteTopic');
  });

  test('show Unmute stream option if stream is not in home view', () => {
    const subscriptions = [{ ...eg.subscription, in_home_view: false }];
    const buttons = constructHeaderActionButtons({
      backgroundData: { ...baseBackgroundData, subscriptions },
      message: eg.streamMessage(),
      narrow,
    });
    expect(buttons).toContain('unmuteStream');
  });

  test('show mute stream option if stream is in home view', () => {
    const subscriptions = [{ ...eg.subscription, in_home_view: true }];
    const buttons = constructHeaderActionButtons({
      backgroundData: { ...baseBackgroundData, subscriptions },
      message: eg.streamMessage(),
      narrow,
    });
    expect(buttons).toContain('muteStream');
  });

  test('show delete topic option if current user is an admin', () => {
    const ownUser = { ...eg.selfUser, is_admin: true };
    const buttons = constructHeaderActionButtons({
      backgroundData: { ...baseBackgroundData, ownUser },
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

describe('messageFilter', () => {
  test('empty string returns empty strings', () => {
    expect(messageFilter('')).toEqual('');
  });

  test('tags should be removed', () => {
    expect(messageFilter('<p>😄John <a></br>Doe</p>')).toEqual('😄John Doe');
    expect(messageFilter('1<div clas="a">2<p>3<a href="a" /></br>4</p>5')).toEqual('12345');
  });

  test("'&amp;','&lt;' and '&gt' should be replaced with '&', '<' and '>'", () => {
    expect(messageFilter('&lt;&gt;&amp;')).toEqual('<>&');
    expect(messageFilter('&amp;&amp;amp;')).toEqual('&&amp;');
    expect(messageFilter('<p>&lt;p&gt;</p>&amp;<a href="p" />')).toEqual('<p>&');
  });
});
