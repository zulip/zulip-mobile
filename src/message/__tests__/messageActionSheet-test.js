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
  const narrow = [];

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
      mute
    });
    const topicButtons = constructActionButtons({
      message,
      auth,
      narrow: topic,
      subscriptions,
      mute
    });
    const privateButtons = constructActionButtons({
      message,
      auth,
      narrow: pmNarrow,
      subscriptions,
      mute
    });
    const specialButtons = constructActionButtons({
      message,
      auth,
      narrow: special,
      subscriptions,
      mute
    });
    const homeButtons = constructActionButtons({
      message,
      auth,
      narrow: home,
      subscriptions,
      mute
    });
    const streamButtons = constructActionButtons({
      message,
      auth,
      narrow: stream,
      subscriptions,
      mute
    });

    expect(groupButtons).not.toContain('Narrow to conversation');
    expect(topicButtons).not.toContain('Narrow to conversation');
    expect(privateButtons).not.toContain('Narrow to conversation');
    expect(specialButtons).toContain('Narrow to conversation');
    expect(homeButtons).toContain('Narrow to conversation');
    expect(streamButtons).toContain('Narrow to conversation');
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
