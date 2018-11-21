import { getInputMessages } from '../webViewHandleUpdates';
import { flagsStateToStringList } from '../html/messageAsHtml';

describe('getInputMessages', () => {
  test('missing prev and next props returns no messages', () => {
    const prevProps = {
      backgroundData: {},
    };
    const nextProps = {
      backgroundData: {},
    };

    const messages = getInputMessages(prevProps, nextProps);

    expect(messages).toEqual([]);
  });

  test('if fetching message differs send a message for fetching', () => {
    const prevProps = {
      backgroundData: {},
      fetching: { older: false, newer: false },
    };
    const nextProps = {
      backgroundData: {},
      fetching: { older: false, newer: true },
    };

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
    const prevProps = {
      backgroundData: {},
      fetching: { older: false, newer: false },
    };
    const nextProps = {
      backgroundData: {},
      fetching: { older: false, newer: false },
    };

    const messages = getInputMessages(prevProps, nextProps);

    expect(messages).toEqual([]);
  });

  test('if typing users differ send a "typing" message', () => {
    const prevProps = {
      backgroundData: { account: {} },
      typingUsers: [],
    };
    const nextProps = {
      backgroundData: { account: {} },
      typingUsers: [{ id: 10 }],
    };

    const messages = getInputMessages(prevProps, nextProps);

    expect(messages).toHaveLength(1);
    expect(messages[0].type).toEqual('typing');
  });

  test('when rendered messages are the same return empty result', () => {
    const prevProps = {
      backgroundData: { account: {} },
      renderedMessages: [],
    };
    const nextProps = {
      backgroundData: { account: {} },
      renderedMessages: [],
    };

    const messages = getInputMessages(prevProps, nextProps);

    expect(messages).toEqual([]);
  });

  test('when the rendered messages differ (even deeply) a "content" message is returned', () => {
    const prevProps = {
      backgroundData: {
        alertWords: {},
        account: { realm: '' },
        flags: { starred: {}, has_alert_word: {} },
      },
      messages: [],
      renderedMessages: [{ key: 0, data: [], message: {} }],
    };
    const nextProps = {
      backgroundData: {
        alertWords: {},
        account: { realm: '' },
        flags: { starred: {}, has_alert_word: {} },
      },
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
      backgroundData: { account: {} },
      fetching: { older: false, newer: false },
      typingUsers: [],
    };
    const nextProps = {
      backgroundData: { account: {} },
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
      backgroundData: {
        alertWords: {},
        account: { realm: '' },
        flags: { starred: {}, has_alert_word: {} },
      },
      fetching: { older: false, newer: false },
      typingUsers: [],
      messages: [],
      renderedMessages: [{ key: 0, data: [], message: {} }],
    };
    const nextProps = {
      backgroundData: {
        alertWords: {},
        account: { realm: '' },
        flags: { starred: {}, has_alert_word: {} },
      },
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
