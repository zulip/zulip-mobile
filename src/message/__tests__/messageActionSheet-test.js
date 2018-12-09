import deepFreeze from 'deep-freeze';
import { IntlProvider } from 'react-intl';

import { constructMessageActionButtons, constructHeaderActionButtons } from '../messageActionSheet';

const messages = require('../../i18n/translations/messages_en.json');

const intlProvider = new IntlProvider({ locale: 'en', messages }, {});
const { intl } = intlProvider.getChildContext();
const _ = value => intl.formatMessage({ id: value });

describe('constructActionButtons', () => {
  const auth = deepFreeze({
    realm: '',
    email: 'Zoe@zulip.com',
  });

  const subscriptions = deepFreeze([]);

  const mute = deepFreeze([]);

  const narrow = deepFreeze([]);

  const flags = deepFreeze({
    starred: {
      1: true,
      2: true,
    },
  });

  test('show star message option if message is not starred', () => {
    const message = deepFreeze({
      id: 3,
    });

    const buttons = constructMessageActionButtons({
      backgroundData: { auth, flags, mute, subscriptions },
      message,
      narrow,
      _,
    });

    expect(buttons).toContain('starMessage');
  });

  test('show unstar message option if message is starred', () => {
    const message = deepFreeze({
      id: 1,
    });

    const buttons = constructMessageActionButtons({
      backgroundData: { auth, flags, mute, subscriptions },
      message,
      narrow,
      _,
    });

    expect(buttons).toContain('unstarMessage');
  });
});

describe('constructHeaderActionButtons', () => {
  test('show Unmute topic option if topic is muted', () => {
    const subscriptions = deepFreeze([
      { name: 'denmark', in_home_view: true },
      { name: 'donald', in_home_view: false },
    ]);

    const message = deepFreeze({
      type: 'stream',
      display_recipient: 'electron issues',
      subject: 'issue #556',
    });

    const mute = deepFreeze([['electron issues', 'issue #556']]);

    const buttons = constructHeaderActionButtons({
      backgroundData: { mute, subscriptions },
      message,
      _,
    });

    expect(buttons).toContain('unmuteTopic');
  });

  test('show mute topic option if topic is not muted', () => {
    const message = deepFreeze({
      type: 'stream',
      display_recipient: 'electron issues',
      subject: 'PR #558',
    });

    const subscriptions = deepFreeze([
      { name: 'denmark', in_home_view: true },
      { name: 'donald', in_home_view: false },
    ]);

    const mute = deepFreeze([]);

    const buttons = constructHeaderActionButtons({
      backgroundData: { mute, subscriptions },
      message,
      _,
    });

    expect(buttons).toContain('muteTopic');
  });

  test('show Unmute stream option if stream is not in home view', () => {
    const message = deepFreeze({
      type: 'stream',
      display_recipient: 'electron issues',
    });

    const subscriptions = deepFreeze([
      {
        name: 'electron issues',
        in_home_view: false,
      },
    ]);

    const mute = deepFreeze([]);

    const buttons = constructHeaderActionButtons({
      backgroundData: { mute, subscriptions },
      message,
      _,
    });

    expect(buttons).toContain('unmuteStream');
  });

  test('show mute stream option if stream is in home view', () => {
    const message = deepFreeze({
      type: 'stream',
    });

    const subscriptions = deepFreeze([
      { name: 'denmark', in_home_view: true },
      { name: 'donald', in_home_view: false },
    ]);

    const mute = deepFreeze([]);

    const buttons = constructHeaderActionButtons({
      backgroundData: { mute, subscriptions },
      message,
      _,
    });

    expect(buttons).toContain('muteStream');
  });
});
