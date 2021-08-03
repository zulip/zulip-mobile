/* @flow strict-local */
import { streamNarrow } from '../../utils/narrow';
import { getMessageTransitionProps, getMessageUpdateStrategy } from '../messageUpdates';

import * as eg from '../../__tests__/lib/exampleData';

const someNarrow = streamNarrow(eg.stream.name);
const anotherNarrow = streamNarrow(eg.makeStream().name);

describe('getMessageTransitionProps', () => {
  test('recognize when messages are the same and the narrows are the same', () => {
    const prevProps = {
      messages: [],
      narrow: someNarrow,
    };
    const nextProps = {
      messages: [],
      narrow: someNarrow,
    };

    const result = getMessageTransitionProps(prevProps, nextProps);

    expect(result).toEqual({
      newMessagesAdded: false,
      noMessages: true,
      noNewMessages: true,
      allNewMessages: false,
      oldMessagesAdded: false,
      onlyOneNewMessage: false,
      sameNarrow: true,
      messagesReplaced: false,
    });
  });

  test('recognize when more old messages are loaded', () => {
    const prevProps = {
      messages: [{ id: 2 }, { id: 3 }, { id: 4 }],
      narrow: someNarrow,
    };
    const nextProps = {
      messages: [{ id: 0 }, { id: 1 }, { id: 3 }, { id: 4 }],
      narrow: someNarrow,
    };

    const result = getMessageTransitionProps(prevProps, nextProps);

    expect(result).toEqual({
      newMessagesAdded: false,
      noMessages: false,
      noNewMessages: false,
      allNewMessages: false,
      oldMessagesAdded: true,
      onlyOneNewMessage: false,
      sameNarrow: true,
      messagesReplaced: false,
    });
  });

  test('recognize when more new messages are loaded', () => {
    const prevProps = {
      messages: [{ id: 2 }, { id: 3 }, { id: 4 }],
      narrow: someNarrow,
    };
    const nextProps = {
      messages: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }],
      narrow: someNarrow,
    };

    const result = getMessageTransitionProps(prevProps, nextProps);

    expect(result).toEqual({
      newMessagesAdded: true,
      noMessages: false,
      noNewMessages: false,
      allNewMessages: false,
      oldMessagesAdded: false,
      onlyOneNewMessage: false,
      sameNarrow: true,
      messagesReplaced: false,
    });
  });

  test('recognize when only one new message is loaded', () => {
    const prevProps = {
      messages: [{ id: 2 }, { id: 3 }, { id: 4 }],
      narrow: someNarrow,
    };
    const nextProps = {
      messages: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      narrow: someNarrow,
    };

    const result = getMessageTransitionProps(prevProps, nextProps);

    expect(result).toEqual({
      newMessagesAdded: true,
      noMessages: false,
      noNewMessages: false,
      allNewMessages: false,
      oldMessagesAdded: false,
      onlyOneNewMessage: true,
      sameNarrow: true,
      messagesReplaced: false,
    });
  });

  test('when different narrows do not consider new message', () => {
    const prevProps = {
      messages: [{ id: 2 }, { id: 3 }, { id: 4 }],
      narrow: someNarrow,
    };
    const nextProps = {
      messages: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      narrow: anotherNarrow,
    };

    const result = getMessageTransitionProps(prevProps, nextProps);

    expect(result).toEqual({
      newMessagesAdded: false,
      noMessages: false,
      noNewMessages: false,
      allNewMessages: false,
      oldMessagesAdded: false,
      onlyOneNewMessage: false,
      sameNarrow: false,
      messagesReplaced: false,
    });
  });

  test('recognize when all messages are loaded', () => {
    const prevProps = {
      messages: [],
      narrow: someNarrow,
    };
    const nextProps = {
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
      narrow: someNarrow,
    };

    const result = getMessageTransitionProps(prevProps, nextProps);

    expect(result).toEqual({
      newMessagesAdded: false,
      noMessages: false,
      noNewMessages: false,
      allNewMessages: true,
      oldMessagesAdded: false,
      onlyOneNewMessage: false,
      sameNarrow: true,
      messagesReplaced: false,
    });
  });

  test('recognize when messages are invalidated and replaced', () => {
    const prevProps = {
      messages: [{ id: 1 }, { id: 2 }],
      narrow: someNarrow,
    };
    const nextProps = {
      messages: [{ id: 4 }, { id: 5 }, { id: 6 }],
      narrow: someNarrow,
    };

    const result = getMessageTransitionProps(prevProps, nextProps);

    expect(result).toEqual({
      newMessagesAdded: true,
      noMessages: false,
      noNewMessages: false,
      allNewMessages: false,
      oldMessagesAdded: false,
      onlyOneNewMessage: false,
      sameNarrow: true,
      messagesReplaced: true,
    });
  });
});

describe('getMessageUpdateStrategy', () => {
  test('initial load positions at anchor (first unread)', () => {
    const prevProps = {
      messages: [],
      narrow: someNarrow,
    };
    const nextProps = {
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }],
      narrow: someNarrow,
    };

    const result = getMessageUpdateStrategy(getMessageTransitionProps(prevProps, nextProps));

    expect(result).toEqual('scroll-to-anchor');
  });

  test('switching narrows position at anchor (first unread)', () => {
    const prevProps = {
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }],
      narrow: someNarrow,
    };
    const nextProps = {
      messages: [{ id: 2 }, { id: 3 }, { id: 5 }, { id: 6 }],
      narrow: anotherNarrow,
    };

    const result = getMessageUpdateStrategy(getMessageTransitionProps(prevProps, nextProps));

    expect(result).toEqual('scroll-to-anchor');
  });

  test('when no messages just replace content', () => {
    const prevProps = {
      messages: [],
      narrow: someNarrow,
    };
    const nextProps = {
      messages: [],
      narrow: anotherNarrow,
    };

    const result = getMessageUpdateStrategy(getMessageTransitionProps(prevProps, nextProps));

    expect(result).toEqual('replace');
  });

  test('when messages replaced go to anchor', () => {
    const prevProps = {
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }],
      narrow: someNarrow,
    };
    const nextProps = {
      messages: [{ id: 5 }, { id: 6 }, { id: 7 }],
      narrow: someNarrow,
    };

    const result = getMessageUpdateStrategy(getMessageTransitionProps(prevProps, nextProps));

    expect(result).toEqual('scroll-to-anchor');
  });

  test('when older messages loaded preserve scroll position', () => {
    const prevProps = {
      messages: [{ id: 4 }, { id: 5 }, { id: 6 }],
      narrow: someNarrow,
    };
    const nextProps = {
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],
      narrow: someNarrow,
    };

    const result = getMessageUpdateStrategy(getMessageTransitionProps(prevProps, nextProps));

    expect(result).toEqual('preserve-position');
  });

  test('when newer messages loaded preserve scroll position', () => {
    const prevProps = {
      messages: [{ id: 4 }, { id: 5 }, { id: 6 }],
      narrow: someNarrow,
    };
    const nextProps = {
      messages: [{ id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }],
      narrow: someNarrow,
    };

    const result = getMessageUpdateStrategy(getMessageTransitionProps(prevProps, nextProps));

    expect(result).toEqual('preserve-position');
  });

  test('if only one new message scroll to bottom if near bottom', () => {
    const prevProps = {
      messages: [{ id: 4 }, { id: 5 }, { id: 6 }],
      narrow: someNarrow,
    };
    const nextProps = {
      messages: [{ id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }],
      narrow: someNarrow,
    };

    const result = getMessageUpdateStrategy(getMessageTransitionProps(prevProps, nextProps));

    expect(result).toEqual('scroll-to-bottom-if-near-bottom');
  });

  test('when loading new messages, scroll to anchor', () => {
    const prevProps = {
      messages: [],
      narrow: someNarrow,
    };
    const nextProps = {
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }],
      narrow: someNarrow,
    };

    const result = getMessageUpdateStrategy(getMessageTransitionProps(prevProps, nextProps));

    expect(result).toEqual('scroll-to-anchor');
  });
});
