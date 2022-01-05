/* @flow strict-local */
import * as eg from '../../__tests__/lib/exampleData';
import { HOME_NARROW } from '../../utils/narrow';
import getMessageListElements from '../getMessageListElements';

describe('getMessageListElements', () => {
  const narrow = HOME_NARROW;

  test('empty messages results in no pieces', () => {
    const messageListElements = getMessageListElements([], HOME_NARROW);
    expect(messageListElements).toEqual([]);
  });

  test('renders time, header and message for a single input', () => {
    const message = { ...eg.streamMessage({ id: 12345 }), timestamp: 123 };

    const messageListElements = getMessageListElements([message], narrow);

    expect(messageListElements).toMatchObject([
      { type: 'time', key: [message.id, 0] },
      { type: 'header', key: [message.id, 1] },
      { type: 'message', key: [message.id, 2] },
    ]);
  });

  test('several messages in same stream, from same person result in time row, header for the stream, three messages, only first of which is full detail', () => {
    const stream = eg.stream;
    const sender = eg.otherUser;

    const message1 = eg.streamMessage({ stream, sender, id: 1 });
    const message2 = eg.streamMessage({ stream, sender, id: 2 });
    const message3 = eg.streamMessage({ stream, sender, id: 3 });

    const messageListElements = getMessageListElements([message1, message2, message3], narrow);

    expect(messageListElements).toMatchObject([
      { type: 'time' },
      { type: 'header' },
      { type: 'message', key: [message1.id, 2], isBrief: false },
      { type: 'message', key: [message2.id, 2], isBrief: true },
      { type: 'message', key: [message3.id, 2], isBrief: true },
    ]);
  });

  test('several messages in same stream, from different people result in time row, header for the stream, three messages, only all full detail', () => {
    const stream = eg.stream;

    const message1 = eg.streamMessage({ stream, sender: eg.selfUser, id: 1 });
    const message2 = eg.streamMessage({ stream, sender: eg.otherUser, id: 2 });
    const message3 = eg.streamMessage({ stream, sender: eg.thirdUser, id: 3 });

    const messageListElements = getMessageListElements([message1, message2, message3], narrow);

    expect(messageListElements).toMatchObject([
      { type: 'time' },
      { type: 'header' },
      { type: 'message', key: [message1.id, 2], isBrief: false },
      { type: 'message', key: [message2.id, 2], isBrief: false },
      { type: 'message', key: [message3.id, 2], isBrief: false },
    ]);
  });

  test('private messages between two people, results in time row, header and two full messages', () => {
    const message1 = eg.pmMessage({
      sender: eg.selfUser,
      recipients: [eg.selfUser, eg.otherUser],
      id: 1,
    });
    const message2 = eg.pmMessage({
      sender: eg.otherUser,
      recipients: [eg.selfUser, eg.otherUser],
      id: 2,
    });

    const messageListElements = getMessageListElements([message1, message2], narrow);

    expect(messageListElements).toMatchObject([
      { type: 'time' },
      { type: 'header' },
      { type: 'message', key: [message1.id, 2], isBrief: false },
      { type: 'message', key: [message2.id, 2], isBrief: false },
    ]);
  });
});
