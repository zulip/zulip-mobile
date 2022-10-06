/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import generateInboundEvents from '../generateInboundEvents';
import { flagsStateToStringList } from '../html/message';
import { HOME_NARROW } from '../../utils/narrow';
import * as eg from '../../__tests__/lib/exampleData';
import type { Props } from '../MessageList';

describe('generateInboundEvents', () => {
  const baseSelectorProps = deepFreeze({
    backgroundData: eg.baseBackgroundData,
    initialScrollMessageId: null,
    fetching: { older: false, newer: false },
    messages: [],
    messageListElementsForShownMessages: [],
    typingUsers: [],
    doNotMarkMessagesAsRead: false,
  });

  type FudgedProps = {|
    ...Props,

    // `intl` property is complicated and not worth testing
    _: $FlowFixMe,
  |};

  const baseProps: FudgedProps = deepFreeze({
    narrow: HOME_NARROW,
    showMessagePlaceholders: false,
    startEditMessage: jest.fn(),
    composeBoxRef: { current: null },
    dispatch: jest.fn(),
    ...baseSelectorProps,
    showActionSheetWithOptions: jest.fn(),

    _: jest.fn(),
    setDoNotMarkMessagesAsRead: jest.fn(),
  });

  test('missing prev and next props returns no messages', () => {
    const prevProps = baseProps;
    const nextProps = baseProps;

    const messages = generateInboundEvents(prevProps, nextProps);

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

    const messages = generateInboundEvents(prevProps, nextProps);

    expect(messages).toEqual([
      {
        type: 'fetching',
        showMessagePlaceholders: nextProps.showMessagePlaceholders,
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

    const messages = generateInboundEvents(prevProps, nextProps);

    expect(messages).toEqual([]);
  });

  test('if typing users differ send a "typing" message', () => {
    const prevProps = {
      ...baseProps,
      typingUsers: [],
    };
    const nextProps = {
      ...baseProps,
      typingUsers: [eg.makeUser()],
    };

    const messages = generateInboundEvents(prevProps, nextProps);

    expect(messages).toHaveLength(1);
    expect(messages[0].type).toEqual('typing');
  });

  test('when rendered messages are the same return empty result', () => {
    const prevProps = {
      ...baseProps,
      messageListElementsForShownMessages: [],
    };
    const nextProps = {
      ...baseProps,
      messageListElementsForShownMessages: [],
    };

    const messages = generateInboundEvents(prevProps, nextProps);

    expect(messages).toEqual([]);
  });

  test('when the rendered messages differ (even deeply) a "content" message is returned', () => {
    const message = eg.streamMessage();

    const prevProps = {
      ...baseProps,
      messageListElementsForShownMessages: [],
    };
    const nextProps = {
      ...baseProps,
      messageListElementsForShownMessages: [
        { key: [message.id, 2], type: 'message', isBrief: false, message },
      ],
    };

    const messages = generateInboundEvents(prevProps, nextProps);

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
      typingUsers: [eg.makeUser()],
    };

    const messages = generateInboundEvents(prevProps, nextProps);

    expect(messages).toHaveLength(2);
    expect(messages[0].type).toEqual('fetching');
    expect(messages[1].type).toEqual('typing');
  });

  test('if a new message is read send a "read" update', () => {
    const message1 = eg.streamMessage({ id: 1 });
    const message2 = eg.streamMessage({ id: 2 });
    const message3 = eg.streamMessage({ id: 3 });

    const prevProps = {
      ...baseProps,
      backgroundData: {
        ...eg.baseBackgroundData,
        flags: {
          ...eg.baseBackgroundData.flags,
          read: { [message2.id]: true },
        },
      },
    };
    const nextProps = {
      ...baseProps,
      backgroundData: {
        ...eg.baseBackgroundData,
        flags: {
          ...eg.baseBackgroundData.flags,
          read: { [message1.id]: true, [message2.id]: true, [message3.id]: true },
        },
      },
    };

    const messages = generateInboundEvents(prevProps, nextProps);

    expect(messages[0]).toEqual({
      type: 'set-read',
      value: true,
      messageIds: [1, 3],
    });
  });
});

describe('flagsStateToStringList', () => {
  const message1 = eg.streamMessage({ id: 1 });
  const message2 = eg.streamMessage({ id: 2 });
  const message3 = eg.streamMessage({ id: 3 });

  const flags = {
    ...eg.baseReduxState.flags,
    read: {
      [message1.id]: true,
      [message2.id]: true,
    },
    starred: {
      [message1.id]: true,
      [message3.id]: true,
    },
    mentioned: {},
    // ...
    // the actual state keeps track of many more flags
  };

  test("returns a string list of flags for some message, given some FlagsState and the message's id", () => {
    expect(flagsStateToStringList(flags, 1)).toEqual(['read', 'starred']);
    expect(flagsStateToStringList(flags, 2)).toEqual(['read']);
    expect(flagsStateToStringList(flags, 3)).toEqual(['starred']);
  });
});
