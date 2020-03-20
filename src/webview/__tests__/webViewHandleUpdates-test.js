import deepFreeze from 'deep-freeze';

import { getUpdateEvents } from '../webViewHandleUpdates';
import { flagsStateToStringList } from '../html/messageAsHtml';
import { HOME_NARROW } from '../../utils/narrow';
import * as eg from '../../__tests__/lib/exampleData';

describe('getUpdateEvents', () => {
  const emptyFlags = eg.baseReduxState.flags;

  const baseBackgroundData = deepFreeze({
    flags: emptyFlags,
    auth: {},
  });

  const baseProps = deepFreeze({
    backgroundData: baseBackgroundData,
  });

  test('missing prev and next props returns no messages', () => {
    const prevProps = baseProps;
    const nextProps = baseProps;

    const messages = getUpdateEvents(prevProps, nextProps);

    expect(messages).toEqual([]);
  });

  test('if fetching message differs send a message for fetching', () => {
    const prevProps = {
      ...baseProps,
      fetching: { older: false, newer: false },
    };
    const nextProps = {
      ...baseProps,
      fetching: { older: false, newer: true },
    };

    const messages = getUpdateEvents(prevProps, nextProps);

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
      ...baseProps,
      fetching: { older: false, newer: false },
    };
    const nextProps = {
      ...baseProps,
      fetching: { older: false, newer: false },
    };

    const messages = getUpdateEvents(prevProps, nextProps);

    expect(messages).toEqual([]);
  });

  test('if typing users differ send a "typing" message', () => {
    const prevProps = {
      ...baseProps,
      typingUsers: [],
    };
    const nextProps = {
      ...baseProps,
      typingUsers: [{ id: 10 }],
    };

    const messages = getUpdateEvents(prevProps, nextProps);

    expect(messages).toHaveLength(1);
    expect(messages[0].type).toEqual('typing');
  });

  test('when rendered messages are the same return empty result', () => {
    const prevProps = {
      ...baseProps,
      renderedMessages: [],
    };
    const nextProps = {
      ...baseProps,
      renderedMessages: [],
    };

    const messages = getUpdateEvents(prevProps, nextProps);

    expect(messages).toEqual([]);
  });

  test('when the rendered messages differ (even deeply) a "content" message is returned', () => {
    const prevProps = {
      backgroundData: {
        alertWords: {},
        auth: { realm: '' },
        flags: { starred: {}, has_alert_word: {} },
        ownUser: { user_id: 1432 },
      },
      narrow: HOME_NARROW,
      messages: [],
      renderedMessages: [{ key: 0, data: [], message: {} }],
    };
    const nextProps = {
      backgroundData: {
        alertWords: {},
        auth: { realm: '' },
        flags: { starred: {}, has_alert_word: {} },
        ownUser: { user_id: 1432 },
      },
      narrow: HOME_NARROW,
      messages: [],
      renderedMessages: [
        {
          key: 0,
          data: [{ key: 123, type: 'message', isBrief: false, message: { id: 0, reactions: [] } }],
          message: {},
        },
      ],
    };

    const messages = getUpdateEvents(prevProps, nextProps);

    expect(messages).toHaveLength(1);
    expect(messages[0].type).toEqual('content');
  });

  test('WUUT there are several diffs return several messages', () => {
    const prevProps = {
      ...baseProps,
      narrow: HOME_NARROW,
      fetching: { older: false, newer: false },
      typingUsers: [],
    };
    const nextProps = {
      ...baseProps,
      narrow: HOME_NARROW,
      fetching: { older: false, newer: true },
      typingUsers: [{ id: 10 }],
    };

    const messages = getUpdateEvents(prevProps, nextProps);

    expect(messages).toHaveLength(2);
    expect(messages[0].type).toEqual('fetching');
    expect(messages[1].type).toEqual('typing');
  });

  test('when there are several diffs but messages differ too return only a single "content" message', () => {
    const prevProps = {
      backgroundData: {
        alertWords: {},
        auth: { realm: '' },
        flags: { starred: {}, has_alert_word: {} },
        ownUser: { user_id: 1432 },
      },
      narrow: HOME_NARROW,
      fetching: { older: false, newer: false },
      typingUsers: [],
      messages: [],
      renderedMessages: [{ key: 0, data: [], message: {} }],
    };
    const nextProps = {
      backgroundData: {
        alertWords: {},
        auth: { realm: '' },
        flags: { starred: {}, has_alert_word: {} },
        ownUser: { user_id: 1432 },
      },
      narrow: HOME_NARROW,
      fetching: { older: false, newer: true },
      typingUsers: [{ id: 10 }],
      messages: [],
      renderedMessages: [
        {
          key: 0,
          data: [{ key: 123, type: 'message', isBrief: false, message: { id: 0, reactions: [] } }],
          message: {},
        },
      ],
    };

    const messages = getUpdateEvents(prevProps, nextProps);

    expect(messages).toHaveLength(1);
    expect(messages[0].type).toEqual('content');
  });

  test('if a new message is read send a "read" update', () => {
    const prevProps = {
      auth: { realm: '' },
      typingUsers: [],
      backgroundData: {
        flags: { read: { 2: true } },
      },
    };
    const nextProps = {
      auth: { realm: '' },
      typingUsers: [],
      backgroundData: {
        flags: { read: { 1: true, 2: true, 3: true } },
      },
    };

    const messages = getUpdateEvents(prevProps, nextProps);

    expect(messages[0]).toEqual({
      type: 'read',
      messageIds: [1, 3],
    });
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
    // the actual state keeps track of many more flags
  };

  test("returns a string list of flags for some message, given some FlagsState and the message's id", () => {
    expect(flagsStateToStringList(flags, 1)).toEqual(['read', 'starred']);
    expect(flagsStateToStringList(flags, 2)).toEqual(['read']);
    expect(flagsStateToStringList(flags, 3)).toEqual(['starred']);
  });
});
