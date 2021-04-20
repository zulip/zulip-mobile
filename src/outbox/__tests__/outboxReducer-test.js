// @flow strict-local
import deepFreeze from 'deep-freeze';

import outboxReducer from '../outboxReducer';
import { INITIAL_FETCH_COMPLETE, MESSAGE_SEND_START } from '../../actionConstants';

import * as eg from '../../__tests__/lib/exampleData';

describe('outboxReducer', () => {
  describe('INITIAL_FETCH_COMPLETE', () => {
    test('filters out isSent', () => {
      const message1 = eg.streamOutbox({ content: 'New one' });
      const message2 = eg.streamOutbox({ content: 'Another one' });
      const message3 = eg.streamOutbox({ content: 'Message already sent', isSent: true });
      const initialState = deepFreeze([message1, message2, message3]);

      const action = deepFreeze({
        type: INITIAL_FETCH_COMPLETE,
      });

      const expectedState = [message1, message2];

      const actualState = outboxReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('MESSAGE_SEND_START', () => {
    test('add a new message to the outbox', () => {
      const message = eg.streamOutbox({ content: 'New one' });

      const initialState = deepFreeze([]);

      const action = deepFreeze({
        type: MESSAGE_SEND_START,
        outbox: message,
      });

      const expectedState = [message];

      const actualState = outboxReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('do not add a message with a duplicate timestamp to the outbox', () => {
      const message1 = eg.streamOutbox({ content: 'hello', timestamp: 123 });
      const message2 = eg.streamOutbox({ content: 'hello twice', timestamp: 123 });

      const initialState = deepFreeze([message1]);

      const action = deepFreeze({
        type: MESSAGE_SEND_START,
        outbox: message2,
      });

      const actualState = outboxReducer(initialState, action);

      expect(actualState).toBe(initialState);
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('do not mutate state if a message is not removed', () => {
      const initialState = deepFreeze([eg.streamOutbox({ timestamp: 546 })]);

      const message = eg.streamMessage({ timestamp: 123 });

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        message,
        local_message_id: message.timestamp,
      });

      const actualState = outboxReducer(initialState, action);
      expect(actualState).toBe(initialState);
    });

    test('remove message if local_message_id matches', () => {
      const message1 = eg.streamOutbox({ timestamp: 546 });
      const message2 = eg.streamOutbox({ timestamp: 150238512430 });
      const message3 = eg.streamOutbox({ timestamp: 150238594540 });
      const initialState = deepFreeze([message1, message2, message3]);

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        message: eg.streamMessage(),
        local_message_id: 546,
      });

      const expectedState = [message2, message3];

      const actualState = outboxReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test("remove nothing if local_message_id doesn't match", () => {
      const message1 = eg.streamOutbox({ timestamp: 546 });
      const message2 = eg.streamOutbox({ timestamp: 150238512430 });
      const message3 = eg.streamOutbox({ timestamp: 150238594540 });
      const initialState = deepFreeze([message1, message2, message3]);

      const action = deepFreeze({
        ...eg.eventNewMessageActionBase,
        message: eg.streamMessage(),
        local_message_id: 15023859,
      });

      const actualState = outboxReducer(initialState, action);
      expect(actualState).toBe(initialState);
    });
  });
});
