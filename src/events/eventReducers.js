import {
  EVENT_REGISTERED,
} from '../constants';

const initialState = {
  queueId: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case EVENT_REGISTERED:
      return {
        ...state,
        queueId: action.queueId,
      };
    default:
      return state;
  }
};
