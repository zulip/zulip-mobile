import {
  EVENTS_REGISTERED,
} from '../constants';

const initialState = {
  queueId: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case EVENTS_REGISTERED:
      return {
        ...state,
        queueId: action.queueId,
      };
    default:
      return state;
  }
};

export default reducer;
