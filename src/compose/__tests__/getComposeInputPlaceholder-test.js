import deepFreeze from 'deep-freeze';

import getComposeInputPlaceholder from '../getComposeInputPlaceholder';
import { privateNarrow, streamNarrow, topicNarrow, groupNarrow } from '../../utils/narrow';

describe('getComposeInputPlaceholder', () => {
  test('returns "Message @ThisPerson" object for person narrow', () => {
    const narrow = deepFreeze(privateNarrow('abc@zulip.com'));

    const ownEmail = 'hamlet@zulip.com';

    const usersByEmail = new Map([
      [
        'abc@zulip.com',
        {
          id: 23,
          email: 'abc@zulip.com',
          full_name: 'ABC',
        },
      ],
      [
        'xyz@zulip.com',
        {
          id: 22,
          email: 'xyz@zulip.com',
          full_name: 'XYZ',
        },
      ],
    ]);

    const placeholder = getComposeInputPlaceholder(narrow, ownEmail, usersByEmail);
    expect(placeholder).toEqual({ text: 'Message {recipient}', values: { recipient: '@ABC' } });
  });

  test('returns "Jot down something" object for self narrow', () => {
    const narrow = deepFreeze(privateNarrow('abc@zulip.com'));

    const ownEmail = 'abc@zulip.com';

    const placeholder = getComposeInputPlaceholder(narrow, ownEmail);
    expect(placeholder).toEqual({ text: 'Jot down something' });
  });

  test('returns "Message #streamName" for stream narrow', () => {
    const narrow = deepFreeze(streamNarrow('Denmark'));

    const placeholder = getComposeInputPlaceholder(narrow);
    expect(placeholder).toEqual({ text: 'Message {recipient}', values: { recipient: '#Denmark' } });
  });

  test('returns properly for topic narrow', () => {
    const narrow = deepFreeze(topicNarrow('Denmark', 'Copenhagen'));

    const placeholder = getComposeInputPlaceholder(narrow);
    expect(placeholder).toEqual({
      text: 'Reply',
    });
  });

  test('returns "Message group" object for group narrow', () => {
    const narrow = deepFreeze(groupNarrow(['abc@zulip.com, xyz@zulip.com']));

    const placeholder = getComposeInputPlaceholder(narrow);
    expect(placeholder).toEqual({ text: 'Message group' });
  });
});
