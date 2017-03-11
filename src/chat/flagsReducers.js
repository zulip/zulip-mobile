import {
  MESSAGE_FETCH_SUCCESS,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  MARK_MESSAGES_READ,
} from '../constants';

const initialState = {};

const addFlagForMessages = (state, messages, flag) =>
  messages.reduce((newState, msgId) => {
    if (!newState[msgId]) {
      newState[msgId] = [];
    }
    if (!newState[msgId].includes(flag)) {
      newState[msgId] = [...newState[msgId], flag];
    }
    return newState;
  }, { ...state });

const removeFlagForMessages = (state, messages, flag) =>
  messages.reduce((newState, msgId) => {
    if (newState[msgId]) {
      newState[msgId] = newState[msgId].filter(x => x !== flag);
    }
    return newState;
  }, { ...state });

export default (state = initialState, action) => {
  switch (action.type) {
    case MESSAGE_FETCH_SUCCESS:
      return action.messages.reduce((newState, msg) => {
        newState[msg.id] = msg.flags || [];
        return newState;
      }, { ...state });

    case EVENT_NEW_MESSAGE:
      return {
        ...state,
        [action.message.id]: action.message.flags,
      };

    case EVENT_UPDATE_MESSAGE_FLAGS:
      if (action.operation === 'add') {
        return addFlagForMessages(state, action.messages, action.flag);
      } else if (action.operation === 'remove') {
        return removeFlagForMessages(state, action.messages, action.flag);
      } else {
        return state;
      }

    case MARK_MESSAGES_READ:
      return addFlagForMessages(state, action.messageIds, 'read');

    default:
      return state;
  }
};
