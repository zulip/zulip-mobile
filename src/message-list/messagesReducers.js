import {
  CHAT_FETCHED_MESSAGES,
  CHAT_SET_MESSAGES,
  EVENT_NEW_MESSAGE,
} from '../constants';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case CHAT_SET_MESSAGES:
      return [].concat(action.messages);
    case EVENT_NEW_MESSAGE:
      return state.concat([action.message]);
    case CHAT_FETCHED_MESSAGES: {
      const keepMessages = state.filter(x =>
        x.id !== action.anchor
      );
      if (action.shouldAppend) {
        return keepMessages.concat(action.messages);
      }
      return action.messages.concat(keepMessages);
    }
    default:
      return state;
  }
};
