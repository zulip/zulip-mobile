import { constructActionButtons, constructHeaderActionButtons } from '../messageActionSheet';
import {
  streamNarrow,
  homeNarrow,
  specialNarrow,
  privateNarrow,
  topicNarrow,
  groupNarrow,
} from '../../utils/narrow';

describe('constructActionButtons', () => {
  const auth = {
    realm: '',
    email: 'Zoe@zulip.com',
  };

  let message = {};
  const subscriptions = [];
  const mute = [];
  const narrow = [];
  const flags = {
    starred: {
      1: true,
      2: true,
    },
  };

  test('do not show narrow option in bottom most narrow', () => {
    const group = groupNarrow(['abc@zulip.com, xyz@zulip.com']);
    const topic = topicNarrow('Denmark', 'Copenhagen');
    const pmNarrow = privateNarrow('abc@zulip.com');
    const special = specialNarrow('private');
    const home = homeNarrow();
    const stream = streamNarrow('all');

    const groupButtons = constructActionButtons({
      message,
      auth,
      narrow: group,
      subscriptions,
      mute,
      flags,
    });
    const topicButtons = constructActionButtons({
      message,
      auth,
      narrow: topic,
      subscriptions,
      mute,
      flags,
    });
    const privateButtons = constructActionButtons({
      message,
      auth,
      narrow: pmNarrow,
      subscriptions,
      mute,
      flags,
    });
    const specialButtons = constructActionButtons({
      message,
      auth,
      narrow: special,
      subscriptions,
      mute,
      flags,
    });
    const homeButtons = constructActionButtons({
      message,
      auth,
      narrow: home,
      subscriptions,
      mute,
      flags,
    });
    const streamButtons = constructActionButtons({
      message,
      auth,
      narrow: stream,
      subscriptions,
      mute,
      flags,
    });

    expect(groupButtons).not.toContain('Narrow to conversation');
    expect(topicButtons).not.toContain('Narrow to conversation');
    expect(privateButtons).not.toContain('Narrow to conversation');
    expect(specialButtons).toContain('Narrow to conversation');
    expect(homeButtons).toContain('Narrow to conversation');
    expect(streamButtons).toContain('Narrow to conversation');
  });

  test('show star message option if message is not starred', () => {
    message = {
      id: 3,
    };

    const buttons = constructActionButtons({ message, auth, narrow, subscriptions, mute, flags });

    expect(buttons).toContain('Star Message');
  });

  test('show unstar message option if message is starred', () => {
    message = {
      id: 1,
    };

    const buttons = constructActionButtons({ message, auth, narrow, subscriptions, mute, flags });

    expect(buttons).toContain('Unstar Message');
  });
});

describe('constructHeaderActionButtons', () => {
  let subscriptions = [
    { name: 'denmark', in_home_view: true },
    { name: 'donald', in_home_view: false },
  ];
  let mute = [];
  let item = {};

  test('show Unmute topic option if topic is muted', () => {
    item = {
      type: 'stream',
      display_recipient: 'electron issues',
      subject: 'issue #556',
    };
    mute = [['electron issues', 'issue #556']];

    const buttons = constructHeaderActionButtons({ item, subscriptions, mute });

    expect(buttons).toContain('Unmute topic');
  });

  test('show mute topic option if topic is not muted', () => {
    item = {
      type: 'stream',
      display_recipient: 'electron issues',
      subject: 'PR #558',
    };

    const buttons = constructHeaderActionButtons({ item, subscriptions, mute });

    expect(buttons).toContain('Mute topic');
  });

  test('show Unmute stream option if stream is not in home view', () => {
    item = {
      type: 'stream',
      display_recipient: 'electron issues',
    };
    subscriptions = [
      {
        name: 'electron issues',
        in_home_view: false,
      },
    ];

    const buttons = constructHeaderActionButtons({ item, subscriptions, mute });

    expect(buttons).toContain('Unmute stream');
  });

  test('show mute stream option if stream is in home view', () => {
    item = {
      type: 'stream',
    };

    const buttons = constructHeaderActionButtons({ item, subscriptions, mute });

    expect(buttons).toContain('Mute stream');
  });
});
