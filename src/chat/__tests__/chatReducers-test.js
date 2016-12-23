import messagesReducers from '../chatReducers';
import {
  homeNarrow,
  privateNarrow,
  groupNarrow,
  streamNarrow,
  topicNarrow,
  specialNarrow,
} from '../../utils/narrow';
import {
  MESSAGE_FETCH_SUCCESS,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE,
} from '../../constants';

describe('chatReducers', () => {
  const homeNarrowStr = JSON.stringify(homeNarrow());
  const privateNarrowStr = JSON.stringify(privateNarrow('mark@example.com'));
  const groupNarrowStr = JSON.stringify(groupNarrow(['mark@example.com', 'john@example.com']));
  const streamNarrowStr = JSON.stringify(streamNarrow('some stream'));
  const topicNarrowStr = JSON.stringify(topicNarrow('some stream', 'some topic'));
  const allPrivateMessagesNarrowStr = JSON.stringify(specialNarrow('private'));

  test('handles unknown action and no previous state by returning initial state', () => {
    const newState = messagesReducers(undefined, {});
    expect(newState).toBeDefined();
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('appends message to state producing a copy of messages', () => {
      const initialState = {
        messages: {
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        }
      };
      const action = {
        type: EVENT_NEW_MESSAGE,
        message: { id: 3 }
      };
      const expectedState = {
        messages: {
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }, { id: 3 }],
        }
      };

      const newState = messagesReducers(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });
  });

  test('appends stream message to all cached narrows that match', () => {
    const initialState = {
      messages: {
        [homeNarrowStr]: [{ id: 1 }],
        [streamNarrowStr]: [{ id: 2 }],
        [topicNarrowStr]: [],
      }
    };
    const message = {
      id: 3,
      type: 'stream',
      display_recipient: 'some stream',
      subject: 'some topic',
    };
    const action = {
      type: EVENT_NEW_MESSAGE,
      message,
    };
    const expectedState = {
      messages: {
        [homeNarrowStr]: [{ id: 1 }, message],
        [streamNarrowStr]: [{ id: 2 }, message],
        [topicNarrowStr]: [message],
      },
    };

    const newState = messagesReducers(initialState, action);

    expect(newState).toEqual(expectedState);
    expect(newState).not.toBe(initialState);
  });

  test('does not append stream message to new cached narrows', () => {
    const initialState = {
      messages: {
        [homeNarrowStr]: [{ id: 1 }],
      }
    };
    const action = {
      type: EVENT_NEW_MESSAGE,
      message: {
        id: 3,
        type: 'stream',
        display_recipient: 'stream name',
        subject: 'some topic',
      },
    };
    const expectedState = {
      messages: {
        [homeNarrowStr]: [{ id: 1 }, { id: 3 }],
      },
    };

    const newState = messagesReducers(initialState, action);

    expect(newState).toEqual(expectedState);
    expect(newState).not.toBe(initialState);
  });

  test('appends private message to multiple cached narrows', () => {
    const initialState = {
      messages: {
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        [allPrivateMessagesNarrowStr]: [{ id: 1 }, { id: 2 }],
        [streamNarrowStr]: [{ id: 2 }, { id: 3 }],
        [privateNarrowStr]: [{ id: 2 }, { id: 3 }],
        [groupNarrowStr]: [{ id: 2 }, { id: 3 }],
      }
    };
    const action = {
      type: EVENT_NEW_MESSAGE,
      message: {
        id: 3,
        type: 'private',
        sender_email: 'someone@example.com',
        display_recipient: [
          { email: 'me@example.com' },
          { email: 'someone@example.com' },
        ],
      },
    };
    const expectedState = {
      messages: {
        [homeNarrowStr]: [{ id: 1 }, { id: 2 }, { id: 3 }],
        [privateNarrowStr]: [{ id: 3 }],
      },
    };

    const newState = messagesReducers(initialState, action);

    expect(newState).toEqual(expectedState);
    expect(newState).not.toBe(initialState);
  });

  describe('EVENT_UPDATE_MESSAGE', () => {
    test('message is not shown, do not change state', () => {
      const initialState = {
        messages: {
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        }
      };
      const action = {
        type: EVENT_UPDATE_MESSAGE,
        messageId: 3,
      };

      const newState = messagesReducers(initialState, action);

      expect(newState).toBe(initialState);
    });

    test('when a message exists in state, new state and new object is created with updated message', () => {
      const initialState = {
        messages: {
          [homeNarrowStr]: [
            { id: 1 },
            { id: 2 },
            { id: 3, content: 'Old content' },
          ],
        },
      };
      const action = {
        type: EVENT_UPDATE_MESSAGE,
        messageId: 3,
        newContent: 'New content',
        editTimestamp: 123,
      };
      const expectedState = {
        messages: {
          [homeNarrowStr]: [
            { id: 1 },
            { id: 2 },
            { id: 3, content: 'New content', edit_timestamp: 123 }
          ]
        }
      };

      const newState = messagesReducers(initialState, action);

      expect(newState).not.toBe(initialState);
      expect(initialState.messages[homeNarrowStr][2]).not.toBe(newState.messages[homeNarrowStr][2]);
      expect(newState).toEqual(expectedState);
    });
  });

  describe('MESSAGE_FETCH_SUCCESS', () => {
    test('when new messages with already existing messages come, they are merged and not duplicated', () => {
      const initialState = {
        messages: {
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }, { id: 3 }],
        }
      };
      const action = {
        type: MESSAGE_FETCH_SUCCESS,
        narrow: [],
        shouldAppend: false,
        messages: [{ id: 2 }, { id: 3 }, { id: 4 }],
      };
      const expectedState = {
        messages: {
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
        },
      };

      const newState = messagesReducers(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });

    test('when shouldAppend is false, adds messages in front of existing ones', () => {
      const initialState = {
        messages: {
          [homeNarrowStr]: [
            { id: 1, timestamp: 3 },
            { id: 2, timestamp: 4 },
          ],
        }
      };
      const action = {
        type: MESSAGE_FETCH_SUCCESS,
        narrow: [],
        shouldAppend: false,
        messages: [
          { id: 3, timestamp: 2 },
          { id: 4, timestamp: 1 },
        ],
      };
      const expectedState = {
        messages: {
          [homeNarrowStr]: [
            { id: 4, timestamp: 1 },
            { id: 3, timestamp: 2 },
            { id: 1, timestamp: 3 },
            { id: 2, timestamp: 4 },
          ],
        }
      };

      const newState = messagesReducers(initialState, action);

      expect(newState).toEqual(expectedState);
      expect(newState).not.toBe(initialState);
    });
  });
});
