import { getInputMessages } from '../webViewHandleUpdates';
import { flagsStateToStringList } from '../html/messageAsHtml';

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
      alertWords: {},
      auth: { realm: '' },
      messages: [],
      flags: { starred: {}, has_alert_word: {} },
      renderedMessages: [{ key: 0, data: [], message: {} }],
    };
    const nextProps = {
      alertWords: {},
      auth: { realm: '' },
      messages: [],
      flags: { starred: {}, has_alert_word: {} },
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
      alertWords: {},
      auth: { realm: '' },
      fetching: { older: false, newer: false },
      typingUsers: [],
      messages: [],
      renderedMessages: [{ key: 0, data: [], message: {} }],
      flags: { starred: {}, has_alert_word: {} },
    };
    const nextProps = {
      alertWords: {},
      auth: { realm: '' },
      fetching: { older: false, newer: true },
      typingUsers: [{ id: 10 }],
      messages: [],
      flags: { starred: {}, has_alert_word: {} },
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

describe('flagsStateToStringList', () => {
  const flags = {
    read: {
      1: true,
      2: true,
    },
    starred: {
      1: true,
      3: true,
    },
    mentions: {},
    // ...
    // the actual store keeps track of many more flags
  };

  test("returns a string list of flags for some message, given some FlagsState and the message's id", () => {
    expect(flagsStateToStringList(flags, 1)).toEqual(['read', 'starred']);
    expect(flagsStateToStringList(flags, 2)).toEqual(['read']);
    expect(flagsStateToStringList(flags, 3)).toEqual(['starred']);
  });
});
