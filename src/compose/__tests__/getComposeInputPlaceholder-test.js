/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import getComposeInputPlaceholder from '../getComposeInputPlaceholder';
import {
  pmNarrowFromEmail,
  streamNarrow,
  topicNarrow,
  pmNarrowFromEmails,
} from '../../utils/narrow';
import * as eg from '../../__tests__/lib/exampleData';

describe('getComposeInputPlaceholder', () => {
  const usersByEmail = new Map([eg.selfUser, eg.otherUser, eg.thirdUser].map(u => [u.email, u]));
  const ownEmail = eg.selfUser.email;

  test('returns "Message @ThisPerson" object for person narrow', () => {
    const narrow = deepFreeze(pmNarrowFromEmail(eg.otherUser.email));
    const placeholder = getComposeInputPlaceholder(narrow, ownEmail, usersByEmail);
    expect(placeholder).toEqual({
      text: 'Message {recipient}',
      values: { recipient: `@${eg.otherUser.full_name}` },
    });
  });

  test('returns "Jot down something" object for self narrow', () => {
    const narrow = deepFreeze(pmNarrowFromEmail(eg.selfUser.email));
    const placeholder = getComposeInputPlaceholder(narrow, ownEmail, usersByEmail);
    expect(placeholder).toEqual({ text: 'Jot down something' });
  });

  test('returns "Message #streamName" for stream narrow', () => {
    const narrow = deepFreeze(streamNarrow('Denmark'));
    const placeholder = getComposeInputPlaceholder(narrow, ownEmail, usersByEmail);
    expect(placeholder).toEqual({ text: 'Message {recipient}', values: { recipient: '#Denmark' } });
  });

  test('returns properly for topic narrow', () => {
    const narrow = deepFreeze(topicNarrow('Denmark', 'Copenhagen'));
    const placeholder = getComposeInputPlaceholder(narrow, ownEmail, usersByEmail);
    expect(placeholder).toEqual({ text: 'Reply' });
  });

  test('returns "Message group" object for group narrow', () => {
    const narrow = deepFreeze(pmNarrowFromEmails([eg.otherUser.email, eg.thirdUser.email]));
    const placeholder = getComposeInputPlaceholder(narrow, ownEmail, usersByEmail);
    expect(placeholder).toEqual({ text: 'Message group' });
  });
});
