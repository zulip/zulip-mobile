/* @flow strict-local */
import deepFreeze from 'deep-freeze';
import invariant from 'invariant';

import * as eg from '../../__tests__/lib/exampleData';
import { HOME_NARROW } from '../../utils/narrow';
import getHtmlPieceDescriptors from '../getHtmlPieceDescriptors';

describe('getHtmlPieceDescriptors', () => {
  const narrow = deepFreeze(HOME_NARROW);

  test('empty messages results in a single empty section', () => {
    const htmlPieceDescriptors = getHtmlPieceDescriptors([], HOME_NARROW);
    expect(htmlPieceDescriptors).toEqual([{ key: 0, message: null, data: [] }]);
  });

  test('renders time, header and message for a single input', () => {
    const message = { ...eg.streamMessage({ id: 12345 }), timestamp: 123 };
    const messages = deepFreeze([message]);

    const htmlPieceDescriptors = getHtmlPieceDescriptors(messages, narrow);

    expect(htmlPieceDescriptors).toHaveLength(2);
    expect(htmlPieceDescriptors[0].data[0].key).toEqual('time123');
    expect(htmlPieceDescriptors[1].data[0].key).toEqual(12345);
  });

  test('several messages in same stream, from same person result in time row, header for the stream, three messages, only first of which is full detail', () => {
    const stream = eg.stream;
    const sender = eg.otherUser;

    const messages = deepFreeze([
      eg.streamMessage({ stream, sender, id: 1 }),
      eg.streamMessage({ stream, sender, id: 2 }),
      eg.streamMessage({ stream, sender, id: 3 }),
    ]);

    const htmlPieceDescriptors = getHtmlPieceDescriptors(messages, narrow);

    const messageKeys = htmlPieceDescriptors[1].data.map(x => x.key);
    const messageBriefs = htmlPieceDescriptors[1].data.map(x => {
      invariant(x.type === 'message', 'expected message item');
      return x.isBrief;
    });
    expect(messageKeys).toEqual([1, 2, 3]);
    expect(messageBriefs).toEqual([false, true, true]);
  });

  test('several messages in same stream, from different people result in time row, header for the stream, three messages, only all full detail', () => {
    const stream = eg.stream;

    const messages = deepFreeze([
      eg.streamMessage({ stream, sender: eg.selfUser, id: 1 }),
      eg.streamMessage({ stream, sender: eg.otherUser, id: 2 }),
      eg.streamMessage({ stream, sender: eg.thirdUser, id: 3 }),
    ]);

    const htmlPieceDescriptors = getHtmlPieceDescriptors(messages, narrow);

    const messageKeys = htmlPieceDescriptors[1].data.map(x => x.key);
    const messageBriefs = htmlPieceDescriptors[1].data.map(x => {
      invariant(x.type === 'message', 'expected message item');
      return x.isBrief;
    });
    expect(messageKeys).toEqual([1, 2, 3]);
    expect(messageBriefs).toEqual([false, false, false]);
  });

  test('private messages between two people, results in time row, header and two full messages', () => {
    const messages = deepFreeze([
      eg.pmMessage({ sender: eg.selfUser, recipients: [eg.selfUser, eg.otherUser], id: 1 }),
      eg.pmMessage({ sender: eg.otherUser, recipients: [eg.selfUser, eg.otherUser], id: 2 }),
    ]);

    const htmlPieceDescriptors = getHtmlPieceDescriptors(messages, narrow);

    const messageKeys = htmlPieceDescriptors[1].data.map(x => x.key);
    const messageBriefs = htmlPieceDescriptors[1].data.map(x => {
      invariant(x.type === 'message', 'expected message item');
      return x.isBrief;
    });
    expect(messageKeys).toEqual([1, 2]);
    expect(messageBriefs).toEqual([false, false]);
  });
});
