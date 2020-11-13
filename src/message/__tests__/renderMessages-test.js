import deepFreeze from 'deep-freeze';

import { HOME_NARROW } from '../../utils/narrow';
import renderMessages from '../renderMessages';

describe('renderMessages', () => {
  const narrow = deepFreeze([]);

  test('empty messages results in a single empty section', () => {
    const messageList = renderMessages([], HOME_NARROW);
    expect(messageList).toEqual([{ key: 0, message: {}, data: [] }]);
  });

  test('renders time, header and message for a single input', () => {
    const messages = deepFreeze([
      {
        timestamp: 123,
        avatar_url: '',
        id: 12345,
      },
    ]);

    const messageList = renderMessages(messages, narrow);

    expect(messageList).toHaveLength(2);
    expect(messageList[0].data[0].key).toEqual('time123');
    expect(messageList[1].data[0].key).toEqual(12345);
  });

  test('several messages in same stream, from same person result in time row, header for the stream, three messages, only first of which is full detail', () => {
    const messages = deepFreeze([
      {
        timestamp: 123,
        type: 'stream',
        id: 1,
        sender_email: 'john@example.com',
        sender_full_name: 'John Doe',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
      {
        timestamp: 124,
        type: 'stream',
        id: 2,
        sender_email: 'john@example.com',
        sender_full_name: 'John Doe',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
      {
        timestamp: 125,
        type: 'stream',
        id: 3,
        sender_email: 'john@example.com',
        sender_full_name: 'John Doe',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
    ]);

    const messageList = renderMessages(messages, narrow);

    const messageKeys = messageList[1].data.map(x => x.key);
    const messageBriefs = messageList[1].data.map(x => x.isBrief);
    expect(messageKeys).toEqual([1, 2, 3]);
    expect(messageBriefs).toEqual([false, true, true]);
  });

  test('several messages in same stream, from different people result in time row, header for the stream, three messages, only all full detail', () => {
    const messages = deepFreeze([
      {
        timestamp: 123,
        type: 'stream',
        id: 1,
        sender_email: 'john@example.com',
        sender_full_name: 'John',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
      {
        timestamp: 124,
        type: 'stream',
        id: 2,
        sender_email: 'mark@example.com',
        sender_full_name: 'Mark',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
      {
        timestamp: 125,
        type: 'stream',
        id: 3,
        sender_email: 'peter@example.com',
        sender_full_name: 'Peter',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
    ]);

    const messageList = renderMessages(messages, narrow);

    const messageKeys = messageList[1].data.map(x => x.key);
    const messageBriefs = messageList[1].data.map(x => x.isBrief);
    expect(messageKeys).toEqual([1, 2, 3]);
    expect(messageBriefs).toEqual([false, false, false]);
  });

  test('private messages between two people, results in time row, header and two full messages', () => {
    const messages = deepFreeze([
      {
        timestamp: 123,
        type: 'private',
        id: 1,
        sender_email: 'john@example.com',
        sender_full_name: 'John',
        avatar_url: '',
        display_recipient: [{ email: 'john@example.com' }, { email: 'mark@example.com' }],
      },
      {
        timestamp: 123,
        type: 'private',
        id: 2,
        sender_email: 'mark@example.com',
        sender_full_name: 'Mark',
        avatar_url: '',
        display_recipient: [{ email: 'john@example.com' }, { email: 'mark@example.com' }],
      },
    ]);

    const messageList = renderMessages(messages, narrow);

    const messageKeys = messageList[1].data.map(x => x.key);
    const messageBriefs = messageList[1].data.map(x => x.isBrief);
    expect(messageKeys).toEqual([1, 2]);
    expect(messageBriefs).toEqual([false, false]);
  });
});
