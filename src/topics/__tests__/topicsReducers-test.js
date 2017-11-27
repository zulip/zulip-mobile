import deepFreeze from 'deep-freeze';

import topicsReducers from '../topicsReducers';
import { ACCOUNT_SWITCH, INIT_TOPICS, EVENT_NEW_MESSAGE } from '../../actionConstants';
import { NULL_OBJECT } from '../../nullObjects';

describe('streamsReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze([{ max_id: 1, name: 'some_topic' }]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = NULL_OBJECT;

      const actualState = topicsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('INIT_TOPICS', () => {
    test('adds new topics mapped to stream id', () => {
      const initialState = NULL_OBJECT;

      const action = deepFreeze({
        type: INIT_TOPICS,
        streamId: 1,
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
        '1': [
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

      const newState = topicsReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });

    test('if topics for stream already exist, replace them', () => {
      const initialState = deepFreeze({
        '1': [
          {
            max_id: 1,
            name: 'some topic',
          },
        ],
      });

      const action = deepFreeze({
        type: INIT_TOPICS,
        streamId: 1,
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
        '1': [
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

      const newState = topicsReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });

  describe('EVENT_NEW_MESSAGE', () => {
    test('if message is not in stream do not change state', () => {
      const initialState = NULL_OBJECT;

      const action = {
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 4,
          type: 'private',
          sender_id: 1,
        },
      };

      const actualState = topicsReducers(initialState, action);

      expect(actualState).toBe(initialState);
    });

    test('if stream message and topic exists update with latest message id', () => {
      const initialState = {
        123: [
          {
            max_id: 1,
            name: 'some topic',
          },
        ],
      };

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 234,
          type: 'stream',
          stream_id: 123,
          subject: 'some topic',
        },
      });

      const expectedState = {
        123: [
          {
            max_id: 234,
            name: 'some topic',
          },
        ],
      };

      const actualState = topicsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('if stream message and topic does not exist, add it', () => {
      const initialState = NULL_OBJECT;

      const action = deepFreeze({
        type: EVENT_NEW_MESSAGE,
        message: {
          id: 2,
          type: 'stream',
          stream_id: 123,
          subject: 'some topic',
        },
      });

      const expectedState = {
        123: [
          {
            max_id: 2,
            name: 'some topic',
          },
        ],
      };

      const actualState = topicsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
