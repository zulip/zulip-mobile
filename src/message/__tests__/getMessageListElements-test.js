/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import { HOME_NARROW } from '../../utils/narrow';
import getMessageListElements from '../getMessageListElements';

describe('getMessageListElements', () => {
  const narrow = deepFreeze(HOME_NARROW);

  test('empty messages results in no pieces', () => {
    const messageListElements = getMessageListElements([], HOME_NARROW);
    expect(messageListElements).toEqual([]);
  });

  test('renders time, header and message for a single input', () => {
    const message = { ...eg.streamMessage({ id: 12345 }), timestamp: 123 };
    const messages = deepFreeze([message]);

    const messageListElements = getMessageListElements(messages, narrow);

    expect(messageListElements).toMatchObject([
      { type: 'time', key: 'time123' },
      { type: 'header', key: 'header12345' },
      { type: 'message', key: 12345 },
    ]);
  });

  test('several messages in same stream, from same person result in time row, header for the stream, three messages, only first of which is full detail', () => {
    const stream = eg.stream;
    const sender = eg.otherUser;

    const messages = deepFreeze([
      eg.streamMessage({ stream, sender, id: 1 }),
      eg.streamMessage({ stream, sender, id: 2 }),
      eg.streamMessage({ stream, sender, id: 3 }),
    ]);

    const messageListElements = getMessageListElements(messages, narrow);

    expect(messageListElements).toMatchObject([
      { type: 'time' },
      { type: 'header' },
      { type: 'message', key: 1, isBrief: false },
      { type: 'message', key: 2, isBrief: true },
      { type: 'message', key: 3, isBrief: true },
    ]);
  });

  test('several messages in same stream, from different people result in time row, header for the stream, three messages, only all full detail', () => {
    const stream = eg.stream;

    const messages = deepFreeze([
      eg.streamMessage({ stream, sender: eg.selfUser, id: 1 }),
      eg.streamMessage({ stream, sender: eg.otherUser, id: 2 }),
      eg.streamMessage({ stream, sender: eg.thirdUser, id: 3 }),
    ]);

    const messageListElements = getMessageListElements(messages, narrow);

    expect(messageListElements).toMatchObject([
      { type: 'time' },
      { type: 'header' },
      { type: 'message', key: 1, isBrief: false },
      { type: 'message', key: 2, isBrief: false },
      { type: 'message', key: 3, isBrief: false },
    ]);
  });

  test('private messages between two people, results in time row, header and two full messages', () => {
    const messages = deepFreeze([
      eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser, eg.otherUser], id: 1 }),
      eg.pmMessage({ sender: eg.otherUser, recipients: [eg.selfUser, eg.otherUser], id: 2 }),
    ]);

    const messageListElements = getMessageListElements(messages, narrow);

    expect(messageListElements).toMatchObject([
      { type: 'time' },
      { type: 'header' },
      { type: 'message', key: 1, isBrief: false },
      { type: 'message', key: 2, isBrief: false },
    ]);
  });
});
