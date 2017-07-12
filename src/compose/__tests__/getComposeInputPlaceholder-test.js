import getComposeInputPlaceholder from '../getComposeInputPlaceholder';
import { privateNarrow, streamNarrow, topicNarrow, groupNarrow } from '../../utils/narrow';

describe('getComposeInputPlaceholder', () => {
  test('returns "Message @ThisPerson" object for person narrow', () => {
    const narrow = privateNarrow('abc@zulip.com');

    const ownEmail = 'hamlet@zulip.com';

    const users = [
      {
        id: 23,
        email: 'abc@zulip.com',
        fullName: 'ABC',
      },
      {
        id: 22,
        email: 'xyz@zulip.com',
        fullName: 'XYZ',
      },
    ];

    const placeholder = getComposeInputPlaceholder(narrow, ownEmail, users);
    expect(placeholder).toEqual({ text: 'Message {recipient}', values: { recipient: '@ABC' } });
  });

  test('returns "Jot down something" object for self narrow', () => {
    const narrow = privateNarrow('abc@zulip.com');

    const ownEmail = 'abc@zulip.com';

    const placeholder = getComposeInputPlaceholder(narrow, ownEmail);
    expect(placeholder).toEqual({ text: 'Jot down something' });
  });

  test('returns "Message #streamName" for stream narrow', () => {
    const narrow = streamNarrow('Denmark');
    const placeholder = getComposeInputPlaceholder(narrow);
    expect(placeholder).toEqual({ text: 'Message {recipient}', values: { recipient: '#Denmark' } });
  });

  test('returns "Message #streamName topic:topicName" for stream narrow', () => {
    const narrow = topicNarrow('Denmark', 'Copenhagen');
    const placeholder = getComposeInputPlaceholder(narrow);
    expect(placeholder).toEqual({
      text: 'Message {recipient}',
      values: { recipient: '#Denmark:Copenhagen' },
    });
  });

  test('returns "Message group" object for group narrow', () => {
    const narrow = groupNarrow(['abc@zulip.com, xyz@zulip.com']);
    const placeholder = getComposeInputPlaceholder(narrow);
    expect(placeholder).toEqual({ text: 'Message group' });
  });
});
