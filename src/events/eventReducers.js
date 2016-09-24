import {
  EVENTS_REGISTERED,
} from './eventActions';

// Initial state
const initialState = {
  queueId: null,
}

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
