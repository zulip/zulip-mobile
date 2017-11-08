import deepFreeze from 'deep-freeze';

import topicsReducers from '../topicsReducers';
import { ACCOUNT_SWITCH, INIT_TOPICS } from '../../actionConstants';
import { NULL_OBJECT } from '../../nullObjects';

describe('streamsReducers', () => {
  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze([{ max_id: 1, topic: 'some_topic' }]);

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
      const initialState = deepFreeze({});

      const action = deepFreeze({
        type: INIT_TOPICS,
        streamId: 1,
        topics: [
          {
            max_id: 1,
            topic: 'topic1',
          },
          {
            max_id: 3,
            topic: 'topic1',
          },
        ],
      });

      const expectedState = {
        '1': [
          {
            max_id: 1,
            topic: 'topic1',
          },
          {
            max_id: 3,
            topic: 'topic1',
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
            topic: 'some topic',
          },
        ],
      });

      const action = deepFreeze({
        type: INIT_TOPICS,
        streamId: 1,
        topics: [
          {
            max_id: 2,
            topic: 'topic1',
          },
          {
            max_id: 3,
            topic: 'topic1',
          },
        ],
      });

      const expectedState = {
        '1': [
          {
            max_id: 2,
            topic: 'topic1',
          },
          {
            max_id: 3,
            topic: 'topic1',
          },
        ],
      };

      const newState = topicsReducers(initialState, action);

      expect(newState).toEqual(expectedState);
    });
  });
});
