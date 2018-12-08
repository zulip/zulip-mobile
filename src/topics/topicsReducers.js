/* @flow strict-local */
import type { TopicsState, TopicsAction, InitTopicsAction, EventNewMessageAction } from '../types';
import { ACCOUNT_SWITCH, INIT_TOPICS, EVENT_NEW_MESSAGE } from '../actionConstants';
import { NULL_OBJECT } from '../nullObjects';
import { replaceItemInArray } from '../utils/immutability';

const initialState: TopicsState = NULL_OBJECT;

const initTopics = (state: TopicsState, action: InitTopicsAction): TopicsState => ({
  ...state,
  [action.streamId]: action.topics,
});

const eventNewMessage = (state: TopicsState, action: EventNewMessageAction): TopicsState => {
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
};

export default (state: TopicsState = initialState, action: TopicsAction): TopicsState => {
  switch (action.type) {
    case ACCOUNT_SWITCH:
      return initialState;

    case INIT_TOPICS:
      return initTopics(state, action);

    case EVENT_NEW_MESSAGE:
      return eventNewMessage(state, action);

    default:
      return state;
  }
};
