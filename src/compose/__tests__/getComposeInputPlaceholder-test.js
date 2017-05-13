import getComposeInputPlaceholder from '../getComposeInputPlaceholder';
import { privateNarrow, streamNarrow, topicNarrow, groupNarrow } from '../../utils/narrow';

describe('getComposeInputPlaceholder', () => {
  test('returns "Message @ThisPerson" for person narrow', () => {
    const narrow = privateNarrow('abc@zulip.com');

    const ownEmail = 'hamlet@zulip.com';

    const users = [
      {
        id: 23,
        email: 'abc@zulip.com',
        fullName: 'ABC'
      },
      {
        id: 22,
        email: 'xyz@zulip.com',
        fullName: 'XYZ'
      }
    ];

    const placeholder = getComposeInputPlaceholder(narrow, ownEmail, users);
    expect(placeholder).toEqual('Message @ABC');
  });

  test('returns "Jot down something" for self narrow', () => {
    const narrow = privateNarrow('abc@zulip.com');

    const ownEmail = 'abc@zulip.com';

    const placeholder = getComposeInputPlaceholder(narrow, ownEmail);
    expect(placeholder).toEqual('Jot down something');
  });

  test('returns "Message #streamName" for stream narrow', () => {
    const narrow = streamNarrow('Denmark');
    const placeholder = getComposeInputPlaceholder(narrow);
    expect(placeholder).toEqual('Message #Denmark');
  });

  test('returns "Message #streamName topic:topicName" for stream narrow', () => {
    const narrow = topicNarrow('Denmark', 'Copenhagen');
    const placeholder = getComposeInputPlaceholder(narrow);
    expect(placeholder).toEqual('Message #Denmark topic:Copenhagen');
  });

  test('returns "Message group" for group narrow', () => {
    const narrow = groupNarrow(['abc@zulip.com, xyz@zulip.com']);
    const placeholder = getComposeInputPlaceholder(narrow);
    expect(placeholder).toEqual('Message group');
  });
});
