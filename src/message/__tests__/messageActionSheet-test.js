import { constructActionButtons } from '../messageActionSheet';
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
  let subscriptions = [];
  let mute = [];
  let narrow = [];

  test('show narrow option in stream narrow', () => {
    narrow = streamNarrow('all');
    const buttons = constructActionButtons({ message, auth, narrow, subscriptions, mute });

    expect(buttons).toContain('Narrow to conversation');
  });

  test('show narrow option in home narrow', () => {
    narrow = homeNarrow();
    const buttons = constructActionButtons({ message, auth, narrow, subscriptions, mute });

    expect(buttons).toContain('Narrow to conversation');
  });

  test('show narrow option in special narrow', () => {
    narrow = specialNarrow('private');
    const buttons = constructActionButtons({ message, auth, narrow, subscriptions, mute });

    expect(buttons).toContain('Narrow to conversation');
  });

  test('do not show narrow option in private narrow', () => {
    narrow = privateNarrow('abc@zulip.com');
    const buttons = constructActionButtons({ message, auth, narrow, subscriptions, mute });

    expect(buttons).not.toContain('Narrow to conversation');
  });

  test('do not show narrow option in topic narrow', () => {
    narrow = topicNarrow('Denmark', 'Copenhagen');
    const buttons = constructActionButtons({ message, auth, narrow, subscriptions, mute });

    expect(buttons).not.toContain('Narrow to conversation');
  });

  test('do not show narrow option in group narrow', () => {
    narrow = groupNarrow(['abc@zulip.com, xyz@zulip.com']);
    const buttons = constructActionButtons({ message, auth, narrow, subscriptions, mute });

    expect(buttons).not.toContain('Narrow to conversation');
  });

  test('show Unmute topic option if topic is muted', () => {
    message = {
      type: 'stream',
      display_recipient: 'electron issues',
      subject: 'issue #556'
    };
    mute = [[
      'electron issues', 'issue #556'
    ]];

    const buttons = constructActionButtons({ message, auth, narrow, subscriptions, mute });

    expect(buttons).toContain('Unmute topic');
  });

  test('show mute topic option if topic is not muted', () => {
    message = {
      type: 'stream',
      display_recipient: 'electron issues',
      subject: 'PR #558'
    };

    const buttons = constructActionButtons({ message, auth, narrow, subscriptions, mute });

    expect(buttons).toContain('Mute topic');
  });

  test('show Unmute stream option if stream is not in home view', () => {
    message = {
      type: 'stream',
      display_recipient: 'electron issues',
    };
    subscriptions = [{
      name: 'electron issues',
      in_home_view: false,
    }];

    const buttons = constructActionButtons({ message, auth, narrow, subscriptions, mute });

    expect(buttons).toContain('Unmute stream');
  });

  test('show mute stream option if stream is in home view', () => {
    message = {
      type: 'stream',
    };

    const buttons = constructActionButtons({ message, auth, narrow, subscriptions, mute });

    expect(buttons).toContain('Mute stream');
  });
});
