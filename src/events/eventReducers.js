import {
  ACCOUNT_SWITCH,
  EVENT_REGISTERED,
  LOGOUT,
} from '../constants';

const initialState = {
  queueId: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ACCOUNT_SWITCH:
    case LOGOUT:
      return initialState;
    case EVENT_REGISTERED:
      return {
        ...state,
        queueId: action.queueId,
      };
    default:
      return state;
  }
};
