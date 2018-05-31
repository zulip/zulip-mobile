import { getInputMessages } from '../webViewHandleUpdates';

describe('getInputMessages', () => {
  test('missing prev and next props returns no messages', () => {
    const prevProps = {};
    const nextProps = {};

    const messages = getInputMessages(prevProps, nextProps);

    expect(messages).toEqual([]);
  });

  test('if fetching message differs send a message for fetching', () => {
    const prevProps = { fetching: { older: false, newer: false } };
    const nextProps = { fetching: { older: false, newer: true } };

    const messages = getInputMessages(prevProps, nextProps);

    expect(messages).toEqual([
      {
        type: 'fetching',
        fetchingNewer: true,
        fetchingOlder: false,
      },
    ]);
  });

  test('if fetching key is the same no message is sent', () => {
    const prevProps = { fetching: { older: false, newer: false } };
    const nextProps = { fetching: { older: false, newer: false } };

    const messages = getInputMessages(prevProps, nextProps);

    expect(messages).toEqual([]);
  });

  test('if typing users differ send a "typing" message', () => {
    const prevProps = { auth: {}, typingUsers: [] };
    const nextProps = { auth: {}, typingUsers: [{ id: 10 }] };

    const messages = getInputMessages(prevProps, nextProps);

    expect(messages).toHaveLength(1);
    expect(messages[0].type).toEqual('typing');
  });

  test('when rendered messages are the same return empty result', () => {
    const prevProps = { renderedMessages: [] };
    const nextProps = { renderedMessages: [] };

    const messages = getInputMessages(prevProps, nextProps);

    expect(messages).toEqual([]);
  });

  test('when the rendered messages differ (even deeply) a "content" message is returned', () => {
    const prevProps = {
      auth: { realm: '' },
      messages: [],
      renderedMessages: [{ key: 0, data: [], message: {} }],
    };
    const nextProps = {
      auth: { realm: '' },
      messages: [],
      renderedMessages: [
        {
          key: 0,
          data: [{ key: 123, type: 'message', isBrief: false, message: { id: 0 } }],
          message: {},
        },
      ],
    };

    const messages = getInputMessages(prevProps, nextProps);

    expect(messages).toHaveLength(1);
    expect(messages[0].type).toEqual('content');
  });

  test('WUUT there are several diffs return several messages', () => {
    const prevProps = {
      auth: {},
      fetching: { older: false, newer: false },
      typingUsers: [],
    };
    const nextProps = {
      auth: {},
      fetching: { older: false, newer: true },
      typingUsers: [{ id: 10 }],
    };

    const messages = getInputMessages(prevProps, nextProps);

    expect(messages).toHaveLength(2);
    expect(messages[0].type).toEqual('fetching');
    expect(messages[1].type).toEqual('typing');
  });

  test('when there are several diffs but messages differ too return only a single "content" message', () => {
    const prevProps = {
      auth: { realm: '' },
      fetching: { older: false, newer: false },
      typingUsers: [],
      messages: [],
      renderedMessages: [{ key: 0, data: [], message: {} }],
    };
    const nextProps = {
      auth: { realm: '' },
      fetching: { older: false, newer: true },
      typingUsers: [{ id: 10 }],
      messages: [],
      renderedMessages: [
        {
          key: 0,
          data: [{ key: 123, type: 'message', isBrief: false, message: { id: 0 } }],
          message: {},
        },
      ],
    };

    const messages = getInputMessages(prevProps, nextProps);

    expect(messages).toHaveLength(1);
    expect(messages[0].type).toEqual('content');
  });
});
