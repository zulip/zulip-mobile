import {
  MESSAGE_FETCH_SUCCESS,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../constants';

const initialState = {};

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
      return action.messages.reduce((newState, msgId) => {
        if (action.operation === 'add') {
          if (!newState[msgId]) {
            newState[msgId] = [];
          }
          if (!newState[msgId].includes(action.flag)) {
            newState[msgId] = [...newState[msgId], action.flag];
          }
        } else if (action.operation === 'remove') {
          if (newState[msgId]) {
            newState[msgId] = newState[msgId].filter(x => x !== action.flag);
          }
        }
        return newState;
      }, { ...state });
    default:
      return state;
  }
};
