// @flow strict-local
import deepFreeze from 'deep-freeze';
import { HOME_NARROW } from '../../utils/narrow';
import { streamNameOfStreamMessage } from '../../utils/recipient';

import * as eg from '../../__tests__/lib/exampleData';
import { constructMessageActionButtons, constructHeaderActionButtons } from '../messageActionSheet';

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
  realmAllowMessageEditing: eg.action.realm_init.data.realm_allow_message_editing,
  realmAllowMessageDeleting: eg.action.realm_init.data.realm_allow_message_deleting,
  realmMessageContentEditLimitInSeconds:
    eg.action.realm_init.data.realm_message_content_edit_limit_seconds,
  realmMessageContentDeleteLimitInSeconds:
    eg.action.realm_init.data.realm_message_content_delete_limit_seconds,
});

const buttonTitles = buttons => buttons.map(button => button.title);

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
    expect(buttonTitles(buttons)).toContain('Star message');
  });

  test('show unstar message option if message is starred', () => {
    const message = eg.streamMessage();
    const flags = { ...baseBackgroundData.flags, starred: { [message.id]: true } };
    const buttons = constructMessageActionButtons({
      backgroundData: { ...baseBackgroundData, flags },
      message,
      narrow,
    });
    expect(buttonTitles(buttons)).toContain('Unstar message');
  });

  test('show reactions option if message is has at least one reaction', () => {
    const buttons = constructMessageActionButtons({
      backgroundData: baseBackgroundData,
      message: eg.streamMessage({ reactions: [eg.unicodeEmojiReaction] }),
      narrow,
    });
    expect(buttonTitles(buttons)).toContain('See who reacted');
  });
});

describe('constructHeaderActionButtons', () => {
  test('show Unmute topic option if topic is muted', () => {
    const mute = deepFreeze([['electron issues', 'issue #556']]);
    const buttons = constructHeaderActionButtons({
      backgroundData: { ...baseBackgroundData, mute },
      stream: 'electron issues',
      topic: 'issue #556',
    });
    expect(buttonTitles(buttons)).toContain('Unmute topic');
  });

  test('show mute topic option if topic is not muted', () => {
    const buttons = constructHeaderActionButtons({
      backgroundData: { ...baseBackgroundData, mute: [] },
      stream: streamNameOfStreamMessage(eg.streamMessage()),
      topic: eg.streamMessage().subject,
    });
    expect(buttonTitles(buttons)).toContain('Mute topic');
  });

  test('show Unmute stream option if stream is not in home view', () => {
    const subscriptions = [{ ...eg.subscription, in_home_view: false }];
    const buttons = constructHeaderActionButtons({
      backgroundData: { ...baseBackgroundData, subscriptions },
      stream: streamNameOfStreamMessage(eg.streamMessage()),
      topic: eg.streamMessage().subject,
    });
    expect(buttonTitles(buttons)).toContain('Unmute stream');
  });

  test('show mute stream option if stream is in home view', () => {
    const subscriptions = [{ ...eg.subscription, in_home_view: true }];
    const buttons = constructHeaderActionButtons({
      backgroundData: { ...baseBackgroundData, subscriptions },
      stream: streamNameOfStreamMessage(eg.streamMessage()),
      topic: eg.streamMessage().subject,
    });
    expect(buttonTitles(buttons)).toContain('Mute stream');
  });

  test('show delete topic option if current user is an admin', () => {
    const ownUser = { ...eg.selfUser, is_admin: true };
    const buttons = constructHeaderActionButtons({
      backgroundData: { ...baseBackgroundData, ownUser },
      stream: streamNameOfStreamMessage(eg.streamMessage()),
      topic: eg.streamMessage().subject,
    });
    expect(buttonTitles(buttons)).toContain('Delete topic');
  });

  test('do not show delete topic option if current user is not an admin', () => {
    const buttons = constructHeaderActionButtons({
      backgroundData: baseBackgroundData,
      stream: streamNameOfStreamMessage(eg.streamMessage()),
      topic: eg.streamMessage().subject,
    });
    expect(buttonTitles(buttons)).not.toContain('Delete topic');
  });
});
