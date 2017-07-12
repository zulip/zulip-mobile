import renderMessages from '../renderMessages';

describe('renderMessages', () => {
  const auth = {
    realm: '',
  };
  const subscriptions = [];
  const narrow = [];

  test('empty messages results in no rendered messages', () => {
    const messageList = renderMessages({ messages: [] });
    expect(messageList).toEqual([]);
  });

  test('renders time, header and message for a single input', () => {
    const messages = [
      {
        timestamp: 123,
        avatar_url: '',
      },
    ];
    const expectedComponentTypes = ['TimeRow', 'MessageHeader', 'MessageContainer'];

    const messageList = renderMessages({ messages, subscriptions, auth, narrow });
    const messageTypes = messageList.map(x => x.type.name);

    expect(messageTypes).toEqual(expectedComponentTypes);
  });

  test('several messages in same stream, from same person result in time row, header for the stream, three messages, only first of which is full detail', () => {
    const messages = [
      {
        timestamp: 123,
        type: 'stream',
        sender_full_name: 'John Doe',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
      {
        timestamp: 124,
        type: 'stream',
        sender_full_name: 'John Doe',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
      {
        timestamp: 125,
        type: 'stream',
        sender_full_name: 'John Doe',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
    ];
    const expectedComponentTypes = [
      'TimeRow',
      'MessageHeader',
      'MessageContainer',
      'MessageContainer',
      'MessageContainer',
    ];

    const messageList = renderMessages({ messages, subscriptions, auth, narrow });
    const messageTypes = messageList.map(x => x.type.name);

    expect(messageTypes).toEqual(expectedComponentTypes);
    expect(messageList[2].props.isBrief).toBe(false);
    expect(messageList[3].props.isBrief).toBe(true);
    expect(messageList[4].props.isBrief).toBe(true);
  });

  test('several messages in same stream, from different people result in time row, header for the stream, three messages, only all full detail', () => {
    const messages = [
      {
        timestamp: 123,
        type: 'stream',
        sender_full_name: 'John',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
      {
        timestamp: 124,
        type: 'stream',
        sender_full_name: 'Mark',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
      {
        timestamp: 125,
        type: 'stream',
        sender_full_name: 'Peter',
        display_recipient: 'general',
        subject: '',
        avatar_url: '',
      },
    ];
    const expectedComponentTypes = [
      'TimeRow',
      'MessageHeader',
      'MessageContainer',
      'MessageContainer',
      'MessageContainer',
    ];

    const messageList = renderMessages({ messages, subscriptions, auth, narrow });
    const messageTypes = messageList.map(x => x.type.name);

    expect(messageTypes).toEqual(expectedComponentTypes);
    expect(messageList[2].props.isBrief).toBe(false);
    expect(messageList[3].props.isBrief).toBe(false);
    expect(messageList[4].props.isBrief).toBe(false);
  });

  test('private messages between two people, results in time row, header and two full messages', () => {
    const messages = [
      {
        timestamp: 123,
        type: 'private',
        sender_full_name: 'John',
        avatar_url: '',
        display_recipient: [{ email: 'john@example.com' }, { email: 'mark@example.com' }],
      },
      {
        timestamp: 123,
        type: 'private',
        sender_full_name: 'Mark',
        avatar_url: '',
        display_recipient: [{ email: 'john@example.com' }, { email: 'mark@example.com' }],
      },
    ];
    const expectedComponentTypes = [
      'TimeRow',
      'MessageHeader',
      'MessageContainer',
      'MessageContainer',
    ];

    const messageList = renderMessages({ messages, subscriptions, auth, narrow });
    const messageTypes = messageList.map(x => x.type.name);

    expect(messageTypes).toEqual(expectedComponentTypes);
    expect(messageList[2].props.isBrief).toBe(false);
    expect(messageList[3].props.isBrief).toBe(false);
  });
});
