import { getMessageTransitionProps, getMessageUpdateStrategy } from '../messageUpdates';

describe('getMessageTransitionProps', () => {
  test('recognize when messages are the same and the narrows are the same', () => {
    const prevProps = {
      messages: [],
      narrow: 'some narrow',
    };
    const nextProps = {
      messages: [],
      narrow: 'some narrow',
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
      narrow: 'some narrow',
    };
    const nextProps = {
      messages: [{ id: 0 }, { id: 1 }, { id: 3 }, { id: 4 }],
      narrow: 'some narrow',
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
      narrow: 'some narrow',
    };
    const nextProps = {
      messages: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }],
      narrow: 'some narrow',
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
      narrow: 'some narrow',
    };
    const nextProps = {
      messages: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      narrow: 'some narrow',
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
      narrow: 'some narrow',
    };
    const nextProps = {
      messages: [{ id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
      narrow: 'another narrow',
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
      narrow: 'some narrow',
    };
    const nextProps = {
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
      narrow: 'some narrow',
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
      narrow: 'some narrow',
    };
    const nextProps = {
      messages: [{ id: 4 }, { id: 5 }, { id: 6 }],
      narrow: 'some narrow',
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
    };
    const nextProps = {
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }],
      narrow: 'some narrow',
    };

    const result = getMessageUpdateStrategy(getMessageTransitionProps(prevProps, nextProps));

    expect(result).toEqual('scroll-to-anchor');
  });

  test('switching narrows position at anchor (first unread)', () => {
    const prevProps = {
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }],
      narrow: 'some narrow',
    };
    const nextProps = {
      messages: [{ id: 2 }, { id: 3 }, { id: 5 }, { id: 6 }],
      narrow: 'another narrow',
    };

    const result = getMessageUpdateStrategy(getMessageTransitionProps(prevProps, nextProps));

    expect(result).toEqual('scroll-to-anchor');
  });

  test('when no messages just replace content', () => {
    const prevProps = {
      messages: [],
      narrow: 'some narrow',
    };
    const nextProps = {
      messages: [],
      narrow: 'some other narrow',
    };

    const result = getMessageUpdateStrategy(getMessageTransitionProps(prevProps, nextProps));

    expect(result).toEqual('replace');
  });

  test('when messages replaced go to anchor', () => {
    const prevProps = {
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }],
      narrow: 'some narrow',
    };
    const nextProps = {
      messages: [{ id: 5 }, { id: 6 }, { id: 7 }],
      narrow: 'some narrow',
    };

    const result = getMessageUpdateStrategy(getMessageTransitionProps(prevProps, nextProps));

    expect(result).toEqual('scroll-to-anchor');
  });

  test('when older messages loaded preserve scroll position', () => {
    const prevProps = {
      messages: [{ id: 4 }, { id: 5 }, { id: 6 }],
      narrow: 'some narrow',
    };
    const nextProps = {
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],
      narrow: 'some narrow',
    };

    const result = getMessageUpdateStrategy(getMessageTransitionProps(prevProps, nextProps));

    expect(result).toEqual('preserve-position');
  });

  test('when newer messages loaded preserve scroll position', () => {
    const prevProps = {
      messages: [{ id: 4 }, { id: 5 }, { id: 6 }],
      narrow: 'some narrow',
    };
    const nextProps = {
      messages: [{ id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }],
      narrow: 'some narrow',
    };

    const result = getMessageUpdateStrategy(getMessageTransitionProps(prevProps, nextProps));

    expect(result).toEqual('preserve-position');
  });

  test('if only one new message scroll to bottom if near bottom', () => {
    const prevProps = {
      messages: [{ id: 4 }, { id: 5 }, { id: 6 }],
      narrow: 'some narrow',
    };
    const nextProps = {
      messages: [{ id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }],
      narrow: 'some narrow',
    };

    const result = getMessageUpdateStrategy(getMessageTransitionProps(prevProps, nextProps));

    expect(result).toEqual('scroll-to-bottom-if-near-bottom');
  });

  test('when loading new messages, scroll to anchor', () => {
    const prevProps = {
      messages: [],
      narrow: 'some narrow',
    };
    const nextProps = {
      messages: [{ id: 1 }, { id: 2 }, { id: 3 }],
      narrow: 'some narrow',
    };

    const result = getMessageUpdateStrategy(getMessageTransitionProps(prevProps, nextProps));

    expect(result).toEqual('scroll-to-anchor');
  });
});
