/* @flow strict-local */

import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import topicsReducer from '../topicsReducer';
import { INIT_TOPICS } from '../../actionConstants';
import { NULL_OBJECT } from '../../nullObjects';

describe('topicsReducer', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const prevState = deepFreeze({ [eg.stream.stream_id]: [{ max_id: 1, name: 'some topic' }] });

      const action = eg.action.account_switch;

      const expectedState = NULL_OBJECT;

      const actualState = topicsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('INIT_TOPICS', () => {
    test('adds new topics mapped to stream id', () => {
      const prevState = eg.plusReduxState.topics;

      const action = deepFreeze({
        type: INIT_TOPICS,
        streamId: eg.stream.stream_id,
        topics: [
          {
            max_id: 1,
            name: 'topic1',
          },
          {
            max_id: 3,
            name: 'topic1',
          },
        ],
      });

      const expectedState = {
        [eg.stream.stream_id]: [
          {
            max_id: 1,
            name: 'topic1',
          },
          {
            max_id: 3,
            name: 'topic1',
          },
        ],
      };

      const newState = topicsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if topics for stream already exist, replace them', () => {
      const prevState = deepFreeze({
        [eg.stream.stream_id]: [
          {
            max_id: 1,
            name: 'some topic',
          },
        ],
      });

      const action = deepFreeze({
        type: INIT_TOPICS,
        streamId: eg.stream.stream_id,
        topics: [
          {
            max_id: 2,
            name: 'topic1',
          },
          {
            max_id: 3,
            name: 'topic1',
          },
        ],
      });

      const expectedState = {
        [eg.stream.stream_id]: [
          {
            max_id: 2,
            name: 'topic1',
          },
          {
            max_id: 3,
            name: 'topic1',
          },
        ],
      };

      const newState = topicsReducer(prevState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('if message is not in stream do not change state', () => {
      const prevState = eg.plusReduxState.topics;

      const action = eg.mkActionEventNewMessage(eg.pmMessage());

      const actualState = topicsReducer(prevState, action);

      expect(actualState).toBe(prevState);
    });

    test('if stream message and topic exists update with latest message id', () => {
      const stream = eg.stream;
      const topic = 'some topic';
      const oldMessage = eg.streamMessage({ id: 1, stream, subject: topic });
      const newMessage = eg.streamMessage({ id: 2, stream, subject: topic });

      const prevState = {
        [stream.stream_id]: [
          {
            max_id: oldMessage.id,
            name: topic,
          },
        ],
      };

      const action = eg.mkActionEventNewMessage(newMessage);

      const expectedState = {
        [stream.stream_id]: [
          {
            max_id: newMessage.id,
            name: topic,
          },
        ],
      };

      const actualState = topicsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if stream message and topic does not exist, add it', () => {
      const stream = eg.stream;
      const topic = 'some topic';
      const message = eg.streamMessage({ stream, subject: topic });

      const prevState = eg.plusReduxState.topics;

      const action = eg.mkActionEventNewMessage(message);

      const expectedState = {
        [stream.stream_id]: [
          {
            max_id: message.id,
            name: topic,
          },
        ],
      };

      const actualState = topicsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
