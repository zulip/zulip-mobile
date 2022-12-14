/* @flow strict-local */
import deepFreeze from 'deep-freeze';

import outboxReducer from '../outboxReducer';
import { MESSAGE_SEND_START } from '../../actionConstants';

import * as eg from '../../__tests__/lib/exampleData';

describe('outboxReducer', () => {
  describe('RESET_ACCOUNT_DATA', () => {
    const initialState = eg.baseReduxState.outbox;
    const action1 = { type: MESSAGE_SEND_START, outbox: eg.streamOutbox({}) };
    const prevState = outboxReducer(initialState, action1);
    expect(prevState).not.toEqual(initialState);

    expect(outboxReducer(prevState, eg.action.reset_account_data)).toEqual(initialState);
  });

  describe('REGISTER_COMPLETE', () => {
    test('filters out isSent', () => {
      const message1 = eg.streamOutbox({ content: 'New one' });
      const message2 = eg.streamOutbox({ content: 'Another one' });
      const message3 = eg.streamOutbox({ content: 'Message already sent', isSent: true });

      const prevState = deepFreeze([message1, message2, message3]);
      expect(outboxReducer(prevState, eg.action.register_complete)).toEqual([message1, message2]);
    });
  });

  describe('MESSAGE_SEND_START', () => {
    test('add a new message to the outbox', () => {
      const message = eg.streamOutbox({ content: 'New one' });

      const prevState = deepFreeze([]);
      expect(
        outboxReducer(prevState, deepFreeze({ type: MESSAGE_SEND_START, outbox: message })),
      ).toEqual([message]);
    });

    test('do not add a message with a duplicate timestamp to the outbox', () => {
      const message1 = eg.streamOutbox({ content: 'hello', timestamp: 123 });
      const message2 = eg.streamOutbox({ content: 'hello twice', timestamp: 123 });

      const prevState = deepFreeze([message1]);
      expect(
        outboxReducer(prevState, deepFreeze({ type: MESSAGE_SEND_START, outbox: message2 })),
      ).toBe(prevState);
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('do not mutate state if a message is not removed', () => {
      const message = eg.streamMessage({ timestamp: 123 });

      const prevState = deepFreeze([eg.streamOutbox({ timestamp: 546 })]);
      expect(
        outboxReducer(
          prevState,
          eg.mkActionEventNewMessage(message, { local_message_id: message.timestamp }),
        ),
      ).toBe(prevState);
    });

    test('remove message if local_message_id matches', () => {
      const message1 = eg.streamOutbox({ timestamp: 546 });
      const message2 = eg.streamOutbox({ timestamp: 150238512430 });
      const message3 = eg.streamOutbox({ timestamp: 150238594540 });

      const prevState = deepFreeze([message1, message2, message3]);
      expect(
        outboxReducer(
          prevState,
          eg.mkActionEventNewMessage(eg.streamMessage(), { local_message_id: 546 }),
        ),
      ).toEqual([message2, message3]);
    });

    test("remove nothing if local_message_id doesn't match", () => {
      const message1 = eg.streamOutbox({ timestamp: 546 });
      const message2 = eg.streamOutbox({ timestamp: 150238512430 });
      const message3 = eg.streamOutbox({ timestamp: 150238594540 });

      const prevState = deepFreeze([message1, message2, message3]);
      const actualState = outboxReducer(
        prevState,
        eg.mkActionEventNewMessage(eg.streamMessage(), { local_message_id: 15023859 }),
      );
      expect(actualState).toBe(prevState);
    });
  });
});
