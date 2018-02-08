import { getMessageTransitionProps } from '../messageUpdates';

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
      oldMessagesAdded: false,
      onlyOneNewMessage: false,
      sameNarrow: true,
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
      oldMessagesAdded: true,
      onlyOneNewMessage: false,
      sameNarrow: true,
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
      oldMessagesAdded: false,
      onlyOneNewMessage: false,
      sameNarrow: true,
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
      oldMessagesAdded: false,
      onlyOneNewMessage: true,
      sameNarrow: true,
    });
  });
});
