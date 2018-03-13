/* @flow */
import type { Action, TopicsState } from '../types';
import { ACCOUNT_SWITCH, INIT_TOPICS, EVENT_NEW_MESSAGE } from '../actionConstants';
import { NULL_OBJECT } from '../nullObjects';
import { replaceItemInArray } from '../utils/immutability';

const initialState: TopicsState = NULL_OBJECT;

export default (state: TopicsState = initialState, action: Action): TopicsState => {
  switch (action.type) {
    case INIT_TOPICS:
      return {
        ...state,
        [action.streamId]: action.topics,
      };

    case ACCOUNT_SWITCH:
      return initialState;

    case EVENT_NEW_MESSAGE: {
      if (action.message.type !== 'stream') {
        return state;
      }

      if (!state[action.message.stream_id]) {
        return {
          ...state,
          [action.message.stream_id]: [
            {
              max_id: action.message.id,
              name: action.message.subject,
            },
          ],
        };
      }

      return {
        ...state,
        [action.message.stream_id]: replaceItemInArray(
          state[action.message.stream_id],
          x => x.name === action.message.subject,
          () => ({
            max_id: action.message.id,
            name: action.message.subject,
          }),
        ),
      };
    }

    default:
      return state;
  }
};
