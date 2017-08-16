import deepFreeze from 'deep-freeze';

import renderMessages from '../renderMessages';

describe('renderMessages', () => {
  const narrow = deepFreeze([]);

  test('empty messages results in no rendered messages', () => {
    const messageList = renderMessages([]);
    expect(messageList).toEqual([]);
  });

  test('renders time, header and message for a single input', () => {
    const messages = deepFreeze([
      {
        timestamp: 123,
        avatar_url: '',
        id: 1,
      },
    ]);

    const expectedComponentKeys = ['time123', 'header1', '1'];

    const messageList = renderMessages(messages, narrow);
    const messageKeys = messageList.map(x => x.key);

    expect(messageKeys).toEqual(expectedComponentKeys);
  });

  test('several messages in same stream, from same person result in time row, header for the stream, three messages, only first of which is full detail', () => {
    const messages = deepFreeze([
      {
        timestamp: 123,
        type: 'stream',
        id: 1,
        sender_full_name: 'John Doe',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
      {
        timestamp: 124,
        type: 'stream',
        id: 2,
        sender_full_name: 'John Doe',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
      {
        timestamp: 125,
        type: 'stream',
        id: 3,
        sender_full_name: 'John Doe',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
    ]);

    const expectedComponentKeys = ['time123', 'header1', '1', '2', '3'];

    const messageList = renderMessages(messages, narrow);
    const messageKeys = messageList.map(x => x.key);

    expect(messageKeys).toEqual(expectedComponentKeys);
    expect(messageList[2].props.isBrief).toBe(false);
    expect(messageList[3].props.isBrief).toBe(true);
    expect(messageList[4].props.isBrief).toBe(true);
  });

  test('several messages in same stream, from different people result in time row, header for the stream, three messages, only all full detail', () => {
    const messages = deepFreeze([
      {
        timestamp: 123,
        type: 'stream',
        id: 1,
        sender_full_name: 'John',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
      {
        timestamp: 124,
        type: 'stream',
        id: 2,
        sender_full_name: 'Mark',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
      {
        timestamp: 125,
        type: 'stream',
        id: 3,
        sender_full_name: 'Peter',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
    ]);

    const expectedComponentKeys = ['time123', 'header1', '1', '2', '3'];

    const messageList = renderMessages(messages, narrow);
    const messageKeys = messageList.map(x => x.key);

    expect(messageKeys).toEqual(expectedComponentKeys);
    expect(messageList[2].props.isBrief).toBe(false);
    expect(messageList[3].props.isBrief).toBe(false);
    expect(messageList[4].props.isBrief).toBe(false);
  });

  test('private messages between two people, results in time row, header and two full messages', () => {
    const messages = deepFreeze([
      {
        timestamp: 123,
        type: 'private',
        id: 1,
        sender_full_name: 'John',
        avatar_url: '',
        display_recipient: [{ email: 'john@example.com' }, { email: 'mark@example.com' }],
      },
      {
        timestamp: 123,
        type: 'private',
        id: 2,
        sender_full_name: 'Mark',
        avatar_url: '',
        display_recipient: [{ email: 'john@example.com' }, { email: 'mark@example.com' }],
      },
    ]);

    const expectedComponentTypes = ['time123', 'header1', '1', '2'];

    const messageList = renderMessages(messages, narrow);
    const messageTypes = messageList.map(x => x.key);

    expect(messageTypes).toEqual(expectedComponentTypes);
    expect(messageList[2].props.isBrief).toBe(false);
    expect(messageList[3].props.isBrief).toBe(false);
  });
});
